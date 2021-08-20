FROM node:lts AS builder
RUN apt update && apt install -y git build-essential
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
COPY . /app/
ARG NEXT_PUBLIC_SUPABASE_URL=ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY=ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABSE_PUBLIC_ANON_KEY
RUN pnpm run build && pnpm run export

FROM ranadeeppolavarapu/nginx-http3:latest
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/site-common.conf /etc/nginx/site-common.conf
COPY --from=builder /app/out/ /var/www/static/
COPY docker-entry-static.sh /app/docker-entry-static.sh
WORKDIR /var/www/static
CMD ["sh", "/app/docker-entry-static.sh"]
