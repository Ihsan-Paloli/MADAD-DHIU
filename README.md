# MADAD — React + Vite SPA (Firebase Hosting)

Converted from TanStack Start SSR to a pure static React + Vite SPA, with all
privileged backend logic moved to **Supabase Edge Functions**. The Supabase
schema, RLS, storage buckets, and auth flows are unchanged.

## Architecture summary

| Layer            | Tech                                          | Notes                                                                                         |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| UI               | React 19 + Vite 7 + Tailwind v4               | Identical to the original; only routing layer changed.                                        |
| Routing          | `react-router-dom` v7 (BrowserRouter)         | One `<Routes>` table in `src/App.tsx`. Per-route `<title>`/meta via `useDocumentMeta()`.       |
| Data             | `@tanstack/react-query`                       | Public reads use the publishable Supabase key + RLS (unchanged).                              |
| Privileged ops   | **Supabase Edge Functions** (`supabase/functions/*`) | Each old `*.functions.ts` is now one edge function. Service role key stays on Supabase.        |
| Hosting          | **Firebase Hosting**                          | `firebase.json` rewrites every URL to `/index.html` for SPA routing.                          |

### Security

- The Supabase **service role key never leaves Supabase**. It is only read
  by Edge Functions via `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")`.
- All admin/events/auditing actions are authenticated by the same HMAC token
  format the original app used, so existing portal sessions and stored
  scrypt password hashes continue to work without DB changes.
- The browser bundle only ever sees `VITE_SUPABASE_URL` and the
  publishable (anon) key — both safe to be public.

## Files changed at a glance

### Added
- `index.html`, `src/main.tsx`, `src/App.tsx` — SPA entry + router.
- `src/lib/use-document-meta.ts` — per-route title/description hook.
- `src/lib/invoke-edge.ts` — thin wrapper around `supabase.functions.invoke`.
- `supabase/functions/_shared/madad.ts` — shared HMAC token + scrypt + dispatcher.
- `supabase/functions/{achievements,auditing,feedback,gallery,programs,quick-links,results,stationery,uploads,portal-auth}/index.ts` — one Deno edge function per old `*.functions.ts`.
- `firebase.json`, `.firebaserc` — Firebase Hosting config.

### Rewritten
- `src/lib/*.functions.ts` — each is now a 5–10 line client wrapper that calls
  `invokeEdge('<fn>', '<action>', data)`. Same exports, same call shape.
- `src/routes/*.tsx` — `createFileRoute({…})({ component })` blocks removed;
  components are default-exported. `head()` meta moved into `useDocumentMeta`.
- `vite.config.ts` — dropped `tanstackStart()`, kept React + tsconfig-paths +
  Tailwind plugins, set `build.outDir = "dist"`.
- `package.json` — removed `@tanstack/react-router`, `@tanstack/react-start`,
  `@tanstack/router-plugin`, `nitro`. Added `react-router-dom`.
- `tsconfig.json` — relaxed strictness, excluded `supabase/functions` from the
  client typecheck (those files are Deno).
- `.env` — only `VITE_*` Supabase variables; service role removed.

### Deleted (TanStack Start–only)
- `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`,
  `src/routes/__root.tsx`, `src/routes/README.md`
- `src/integrations/supabase/{auth-middleware,auth-attacher,client.server}.ts`
- `src/lib/{config.server,error-capture,error-page}.ts`, `src/lib/api/`

## Local verification

```bash
npm install
npm run build      # → dist/index.html + dist/assets/*
npm run preview    # → http://localhost:4173
```

The build already passes on a fresh checkout (~1.2 MB JS, ~17 kB gzipped CSS).

## Firebase Hosting deploy

### One-time setup

```bash
npm i -g firebase-tools
firebase login
# Edit .firebaserc and set "default" to your Firebase project ID.
```

### Deploy frontend

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` rewrites every path to `/index.html`, so `/admin`, `/wings/srdb`,
`/results/<uuid>` all resolve to the SPA on hard refresh.

## Deploy the Supabase Edge Functions

The frontend talks to your existing Supabase project, but you must publish the
new edge functions once. From the project root:

```bash
# (one-time) install the CLI
npm i -g supabase

# log in and link to the existing project
supabase login
supabase link --project-ref visgnwzwwozbegicxxyt

# set server-only secrets — these REPLACE the previous TanStack server env
supabase secrets set \
  PORTAL_TOKEN_SECRET="<the same secret the old backend used>" \
  ADMIN_PORTAL_PASSWORD="<existing admin portal password>" \
  EVENTS_PORTAL_PASSWORD="<existing events portal password>" \
  AUDITING_PORTAL_PASSWORD="<existing auditing portal password>"
# SUPABASE_SERVICE_ROLE_KEY is injected automatically by Supabase; do NOT set it manually.

# publish all functions
supabase functions deploy achievements
supabase functions deploy auditing
supabase functions deploy feedback
supabase functions deploy gallery
supabase functions deploy programs
supabase functions deploy quick-links
supabase functions deploy results
supabase functions deploy stationery
supabase functions deploy uploads
supabase functions deploy portal-auth
```

If you previously had the same env vars on the TanStack host, copy them
verbatim (especially `PORTAL_TOKEN_SECRET`) so any tokens issued by the old
backend keep validating until they expire (24h).

### `verify_jwt = false`

`supabase/config.toml` disables platform-level JWT verification on every
function. Each function still enforces its own auth:

- Admin/Events/Auditing actions verify the HMAC portal token in the body.
- `issueAdminToken` and `setPortalPassword` validate the **caller's
  Supabase Auth JWT** (forwarded as `Authorization: Bearer …`) and check
  `has_role(uid, 'admin')` before issuing a portal token.
- `submitFeedback`, `getResultForProgram`, and `verifyPortalPassword` are
  intentionally public endpoints (rate-limited at the platform layer).

## Compatibility notes

- All Supabase tables, RLS policies, storage buckets, and migrations are
  untouched — see `supabase/migrations/` and `supabase/config.toml`.
- HMAC token format is byte-identical to the old TanStack version, so logged-in
  portal sessions in users' `localStorage` continue to work after deploy.
- The scrypt password hash format (`scrypt$<saltHex>$<keyHex>`) is preserved,
  so the existing `portal_passwords` rows verify successfully.
- Realtime subscriptions, file uploads to private buckets, and signed-URL
  retrieval all run through the existing buckets and policies.

## Hosting on other static platforms

The build is plain static files. To use Netlify or Vercel instead of Firebase:

- **Netlify:** add `public/_redirects` containing `/* /index.html 200`.
- **Vercel:** add `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`.
