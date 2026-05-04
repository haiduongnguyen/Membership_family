# Deploy Guide

## 1. Supabase setup
1. Run SQL migrations in order:
   1. `supabase/migrations/001_init.sql`
   2. `supabase/migrations/002_auth_trigger.sql`
   3. `supabase/migrations/003_rls.sql`
2. Create storage bucket `relationship-media`.
3. Set bucket policy to allow authenticated uploads/reads as needed.

## 2. Environment variables
Set these in hosting (Vercel/other):
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional for e2e happy path:
1. `E2E_EMAIL`
2. `E2E_PASSWORD`

## 3. Pre-deploy checks
Run in order:
1. `npm run check`
2. `npm run test:e2e:smoke`
3. `npm run test:e2e:happy` (only when e2e credentials are configured)

## 4. Production run
1. Build: `npm run build`
2. Start: `npm run start`

## 5. Post-deploy verification
1. Login works.
2. Create family group works.
3. Add person, relationship, event works.
4. Avatar/event image upload works.
5. Calendar and gallery render correctly.
