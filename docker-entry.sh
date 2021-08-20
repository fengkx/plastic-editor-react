cd /app/
find ./.next -type f | xargs sed -i -e "s|ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABASE_URL|$NEXT_PUBLIC_SUPABASE_URL|g"
find ./.next -type f | xargs sed -i -e "s/ECALPER_EB_OT_GNIRTS_EUQINU_YREV_EMOS_SUPABSE_PUBLIC_ANON_KEY/$NEXT_PUBLIC_SUPABSE_PUBLIC_ANON_KEY/g"
npx next start