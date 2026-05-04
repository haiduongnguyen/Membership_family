# Test Plan

## Gate Per Step
1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. `npm run test:e2e:smoke`
6. `npm run test:e2e:happy` (requires `E2E_EMAIL` + `E2E_PASSWORD`)

## Step 0-1 Mandatory
1. Apply SQL migrations in order: `001_init.sql`, `002_auth_trigger.sql`, `003_rls.sql`.
2. Run auth smoke test: signup/login/logout.
3. Verify trigger creates/updates `public.users` row.
4. Verify RLS blocks cross-user access.
