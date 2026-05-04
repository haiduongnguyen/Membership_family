# QA Checklist

## Auth
1. Signup with new email.
2. If email confirmation enabled, verify message shown.
3. Login success and logout success.
4. Row exists in `public.users` with correct email.

## Data Isolation
1. User A creates group.
2. User B cannot see User A group.

## Core Flow
1. Create group `Gia dinh`.
2. Add at least two people.
3. Add relationship between two people.
4. Add event and check calendar.
5. Upload avatar and event photo.
6. Verify gallery image fallback works when URL is invalid.

## Build Quality
1. Lint passes.
2. Unit tests pass.
3. Build passes.
4. E2E smoke passes.
5. E2E happy path passes when credentials are configured.
