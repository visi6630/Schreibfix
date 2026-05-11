# Security Audit — Schreibfix

Audit date: 2026-05-11

## A) XSS (Cross-Site Scripting)

**Checked:** All components that render user-provided or API-returned content.

**Findings:** No `dangerouslySetInnerHTML` usage found in the codebase. React's JSX
renderer escapes all dynamic values by default, which prevents XSS in:
- `DiktatClient.tsx` — sentence text and user input displayed as text nodes
- `LesenClient.tsx` — AI-generated reading text rendered as `{text}`
- `UebungenClient.tsx` — exercise content rendered as text
- `ElternClient.tsx` — all data fields rendered as text

**Status:** No issues found. ✅

---

## B) SQL Injection

**Checked:** All Supabase query calls throughout the codebase.

**Findings:** The Supabase JavaScript SDK exclusively uses the PostgREST API with
parameterized queries. No raw SQL string concatenation with user input was found.
All filters use the typed chained API (`.eq()`, `.in()`, `.select()`, etc.).

**Status:** No issues found. ✅

---

## C) Authentication Issues

### C1 — Protected routes

**Checked:** `ProtectedPage` component and all page-level auth guards.

**Findings:**
- `/diktat`, `/uebungen`, `/fortschritt` are wrapped in `ProtectedPage` which
  redirects unauthenticated users to `/auth`.
- `/lesen` was not protected — acceptable as it contains no personal data.
- `/eltern` performs a client-side user check and shows a login prompt if not
  authenticated.
- `/admin` — newly added. Redirects to `/auth` if not logged in, redirects to `/`
  if logged in but not admin. Backed by Supabase RLS which enforces admin-only data
  access server-side regardless of client-side checks.

**Status:** Addressed. ✅

### C2 — Admin routes check `is_admin` server-side

**Implementation:** Supabase Row Level Security policies verify `is_admin` in
PostgreSQL, not just in client code. Even if client-side checks are bypassed, a
non-admin user cannot read admin data (profiles of other users, api_logs, error_logs)
because the RLS policies enforce this at the database level.

Added policies (see `supabase/migrations/001_admin_api_logs.sql`):
- `Admins can read all profiles`
- `Admins can read all progress`
- `Admins can read all weak_words`
- `Admins can read api_logs`
- `Admins can read error_logs`

**Status:** Addressed. ✅

### C3 — API key exposure

**Checked:** All environment variables used in the codebase.

**Findings:**
- `ANTHROPIC_API_KEY` — used only in `lib/ai-content.ts` (server module) and
  `app/api/ai/encouragement/route.ts` (server API route). Never exposed to client.
- `ELEVENLABS_API_KEY` — used only in `app/api/tts/route.ts` (server API route).
  Never exposed to client.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are intentionally
  public (Supabase anon key is designed for client-side use; RLS enforces access
  control).

**Status:** No issues found. ✅

---

## D) Data Exposure

### D1 — RLS on all tables

**Verified:** All Supabase tables have RLS enabled:
- `profiles` — RLS enabled (confirmed in schema)
- `progress` — RLS enabled
- `weak_words` — RLS enabled
- `api_logs` — RLS enabled (new table, created with RLS)
- `error_logs` — RLS enabled (new table, created with RLS)

### D2 — Users can only access their own data

**Verified:** Existing RLS policies allow users to read/write only their own rows.
Admin policies are additive (OR'd by Supabase) so regular users are not affected.

### D3 — Admin data not accessible to regular users

**Addressed:** Admin SELECT policies use `auth.uid() IN (SELECT id FROM profiles
WHERE is_admin = true)`. Regular users cannot query other users' data even with
the anon key because their JWT does not match the admin condition.

**Status:** Addressed. ✅

---

## E) Rate Limiting

**Added:** In-memory IP-based rate limiting on all AI generation endpoints.

### Claude API endpoints
- `POST /api/ai/diktat` — max **20 requests/hour** per IP
- `POST /api/ai/verben` — max **20 requests/hour** per IP
- `POST /api/ai/artikel` — max **20 requests/hour** per IP
- `POST /api/ai/lesen` — max **20 requests/hour** per IP
- `POST /api/ai/encouragement` — max **20 requests/hour** per IP

### ElevenLabs TTS endpoint
- `POST /api/tts` — max **50 requests/hour** per IP

When the limit is exceeded, a `429 Too Many Requests` response is returned with:
```
"Du hast heute schon viel geübt! Komm morgen wieder."
```

**Implementation:** `apps/web/lib/rate-limit.ts` — in-memory Map with sliding
window per IP address (`x-forwarded-for` header, falling back to `x-real-ip`).

**Note:** In-memory rate limiting resets on server restart. For production at scale,
replace with a Redis-backed solution. For the current user volume, this is sufficient.

**Status:** Addressed. ✅

---

## F) Additional improvements

### F1 — API usage logging
All Claude and ElevenLabs API calls are now logged to the `api_logs` Supabase table
(server-side, insert-only RLS policy). Failed calls are logged to `error_logs`.
Both tables are readable only by admin users.

### F2 — Password complexity
Registration form at `/auth` now enforces:
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (`!@#$%^&*`)
- Real-time password strength indicator (Schwach / Mittel / Stark)
- Requirement checklist shown while typing

### F3 — Admin console
New page at `/admin` (visible in footer only to admins) provides:
- User overview with email, grade, XP, registration date, last active
- Usage statistics with DAU chart and popular exercise types
- API usage tracking with cost estimates
- Error log monitoring
