# Setup
1. Supabase > SQL Editor: paste and run `supabase.sql`.
2. Supabase > Authentication > Users > Add user (owner email + password). Then Authentication > Sign In / Providers: turn OFF "Allow new users to sign up".
3. Run in SQL Editor: `insert into public.admins (user_id) select id from auth.users where email = 'YOUR_OWNER_EMAIL';`
4. Edit `js/config.js` with your company name.
5. Push this folder to a GitHub repo > Settings > Pages > deploy from `main` / root.
6. Visit `/admin.html` and log in.
