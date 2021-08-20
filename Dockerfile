FROM node:lts AS builder
RUN apt update && apt install -y git build-essential
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
COPY . /app/
ARG NEXT_PUBLIC_SUPABASE_URL=ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY=ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABSE_PUBLIC_ANON_KEY
RUN pnpm run build
RUN rm -r .next/cache/webpack

FROM node:lts-alpine as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile --production
RUN find node_modules -type f | egrep "(.idea|.vscode|benchmark.js|.eslintrc.js|changelog|AUTHORS|AUTHORSon|license|LICENSE|LICENCE|.travis.yml|.eslintrc.json|.eslintrc.yml|Makefile|.npmignore|.DS_Store|.jshintrc|.eslintrc.BSD|.editorconfig|tsconfig.json|tsconfig.jsonon|.coveralls.yml|appveyor.yml|.gitattributes|.eslintignore|.eslintrc|.eslintignore.BSD|.babelrc)" | xargs rm -rf && \
    find node_modules -type f | egrep "\.(md|mdon|markdown|log|ts|swp|jst|coffee|txt|BSD|m?js.map)$" | xargs rm -f &&\
    find node_modules -type d | egrep "(test|docs|doc|examples|example|.githubs|@types)" | xargs rm -rf

FROM node:lts-alpine as app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

ENV NODE_ENV production

WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ./docker-entry.sh /app/docker-entry.sh

USER nextjs
EXPOSE 3000
CMD ["sh", "/app/docker-entry.sh"]



