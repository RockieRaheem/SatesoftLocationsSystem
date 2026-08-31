# Uganda Location Register

A focused React, TypeScript, Express, and Supabase workspace for governing Uganda's administrative and electoral location hierarchy. The supplied Electoral Commission support data is retained as a historical 2022 dataset and is never represented as current authoritative election data.

## Requirements

- Node.js 22+
- npm 10+
- A Supabase project
- Docker Desktop only when using the optional local Supabase stack

## Configure the project

Copy `.env.example` to `.env` and replace every placeholder. Only the project URL and publishable key may use the `VITE_` prefix. The secret key is restricted to the server-side import script and must never be exposed in client code or committed.

In Supabase Authentication, enable Google, configure its credentials, set the deployed application URL as the site URL, and allow the exact local and deployed redirect URLs. Sign in once, then bootstrap the first administrator from the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@example.com';
```

After that, database RLS permits only administrators to mutate registry data. Authenticated viewers can read active registry records but cannot write them.

## Apply the database

```powershell
npm.cmd exec supabase login
npm.cmd exec supabase link -- --project-ref YOUR_PROJECT_REF
npm.cmd run supabase:push
npm.cmd run supabase:seed
```

`supabase:seed` loads the Uganda country master record, Uganda's applicable regional grouping, and the normalized Electoral Commission support file. It records a SHA-256 source fingerprint, inserts locations in bounded batches, and activates the new dataset only after a complete load. Re-running it creates a new auditable dataset version and archives the formerly active version.

## Run locally

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://localhost:3000`. The `.cmd` form avoids the PowerShell script-execution restriction that can block `npm.ps1` on Windows.

For a fully local Supabase environment:

```powershell
npm.cmd run supabase:start
npm.cmd run supabase:reset
```

Use the local API URL and publishable/secret keys printed by the CLI in `.env`.

## Security model

- Supabase Auth owns user sessions; Google OAuth is the configured sign-in method.
- Browser requests contain only the publishable key and user access token.
- Express verifies each access token with Supabase Auth.
- Database calls run with the user's token, so PostgreSQL row-level security remains the authorization boundary.
- The Supabase secret key is used only by the controlled import process.
- Explicit table grants, RLS policies, protected roles, audit triggers, payload limits, CORS, and security headers are included.
- Theme preference is the only application data stored in browser local storage.

## Uganda electoral data

The importer merges the `byVillage`, `byParish`, and `bySubcounty` indexes in `Support Files/electoral-commission-2022.json`, deduplicates by the complete hierarchy, assigns stable composite IDs, retains source provenance, and flags ambiguous constituency mappings for review.

The source indexes contain omissions and conflicting totals. Replace the support file with an Electoral Commission-verified export before using this system for a current election. Set `UGANDA_ELECTORAL_DATA_PATH` to import an approved replacement; the source hash and dataset history make that replacement traceable.

## Validation

```powershell
npm.cmd run check
```

This runs TypeScript checks, electoral normalization tests, and the production build. When Docker is available, also run `npm.cmd run supabase:reset` to execute all migrations against a clean local database before deployment.

## Main entrypoints

- `server.ts` — authenticated Express API and Vite integration
- `components/AdminDashboard.tsx` — Supabase authentication and dashboard state
- `src/supabase/` — typed browser/server clients and database mappings
- `supabase/migrations/` — versioned schema, privileges, RLS, functions, and audit controls
- `scripts/seedSupabase.ts` — controlled country and electoral dataset import
- `electoral/ugandaElectoralRegistry.ts` — source normalization and validation logic
