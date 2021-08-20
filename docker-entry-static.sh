cd /var/www/static
find ./_next -type f | xargs sed -i -e "s|ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABASE_URL|$NEXT_PUBLIC_SUPABASE_URL|g"
find ./_next -type f | xargs sed -i -e "s/ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABSE_PUBLIC_ANON_KEY/$NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY/g"
if [ -z $NEXT_PUBLIC_SUPABASE_URL ]; then export NEXT_PUBLIC_SUPABASE_URL='' ;fi;
if [ -z $NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY ]; then export NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY='' ;fi;
envsubst '${NEXT_PUBLIC_SUPABASE_URL} ${NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;'