# EdgeLift Production Setup

## Recommended Stack

- Frontend hosting: Netlify or Vercel
- Database/Auth: Supabase
- Storage model: one `user_app_state` row per user

## Supabase Setup

1. Create a Supabase project.
2. In the SQL editor, run [supabase-schema.sql](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/supabase-schema.sql).
3. In Supabase Auth settings:
   - enable Email auth
   - add your production URL to Site URL
   - add your local preview URL and production URL to Redirect URLs
   - add `/reset-password.html` under your production origin as a valid redirect target
4. Copy [supabase-config.example.js](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/supabase-config.example.js) to `supabase-config.js` and fill in your project URL and anon key.

## Deploy

1. Push this folder to GitHub.
2. Import the repo into Netlify or Vercel.
3. Add environment variables in the host:
   - `EDGELIFT_SUPABASE_URL`
   - `EDGELIFT_SUPABASE_ANON_KEY`
4. The deploy runs `npm run build`, generates `dist/`, and writes a production `supabase-config.js` from those env vars.
5. Visit the site, sign up, and your tracker state will sync to Supabase.

## Local Build

To preview the production build locally:

1. Set environment variables:
   - PowerShell: `$env:EDGELIFT_SUPABASE_URL="https://..."; $env:EDGELIFT_SUPABASE_ANON_KEY="..."`
2. Run `npm run build`
3. Serve the `dist/` folder with any static server

## Deploy Files

- [build.mjs](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/build.mjs) builds `dist/` and injects runtime config
- [netlify.toml](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/netlify.toml) configures Netlify
- [vercel.json](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/vercel.json) configures Vercel
- [app.webmanifest](C:/Users/Edwin%20Kuang/Documents/Codex/2026-04-21-make-me-a-cyberpunk-edgerunners-styled/app.webmanifest) now includes install icons

## Current Behavior

- No Supabase config: local-only mode using `localStorage`
- Supabase configured + signed in: state loads from and saves to Supabase
- First cloud login: if there is no cloud state yet, the current local state is uploaded
- Password reset: users can request a reset from the auth shell and complete it on `reset-password.html`
- PWA: the app now ships with a manifest and service worker for installability and basic offline asset caching

## Suggested Next Hardening

- Tune service-worker caching for Supabase/network-aware behavior
- Add a real normalized schema if you want analytics or multi-device merge logic
