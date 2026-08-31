# Location Register Dashboard

Location Register is a focused React and TypeScript workspace for governing
country master records, administrative hierarchies, electoral locations, and
regional economic structures.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Firebase access for authenticated and Firestore-backed features

## Local development

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Express serves the temporary in-memory country
API at `/api/countries` and mounts Vite as development middleware.

If PowerShell blocks `npm.ps1`, use the Windows command shim instead:

```powershell
npm.cmd run dev
```

## Validation

```powershell
npm run typecheck
npm run test:electoral
npm run build
```

`npm test` runs the Firestore rules suite and expects the Firestore emulator
to already be listening on `localhost:8080`. Start it in another terminal with
the Firebase CLI:

```powershell
npx firebase-tools emulators:start --only firestore
```

## Persistence

- Firestore: regional economic levels and authenticated user profiles
- Express memory: countries (reset when the server restarts)
- Server-side source file: normalized Uganda electoral location data
- Browser local storage: color-theme preference only

The country API still uses process memory and must be connected to a durable
database before multi-instance production deployment.

## Product scope

The active application is intentionally limited to six workflows: registry
overview, countries, administrative levels, electoral locations, regional
groupings, and the authenticated account. The former AI Studio retail, sales,
inventory, finance, wallet, surveillance, marketing, personality, and packet
tracing demonstrations are no longer imported into the application runtime.

The UI uses locally compiled Tailwind CSS, responsive navigation, route-level
code splitting, accessible focus states, reduced-motion support, and deep-link
hashes such as `#country-electoral-levels`. Preview access is shown only on
`localhost`; deployed environments require Google authentication.

## Uganda electoral registry

The Uganda browser under **Country Electoral Levels** reads the supplied
`Support Files/electoral-commission-2022.json` only on the server. The large
source file is not bundled into the browser. At startup, the registry:

- merges the `byVillage`, `byParish`, and `bySubcounty` indexes;
- deduplicates using the complete electoral hierarchy instead of village name;
- attaches source provenance and flags records whose constituency is ambiguous;
- exposes read-only, paginated endpoints under `/api/electoral/uganda`.

The support file is presented as a **historical 2022 dataset requiring
verification**, because its indexes disagree with each other and its totals do
not match the Electoral Commission's published 2022 reference totals. Replace
it with an EC-verified export before using the registry to administer a current
election. A deployment may point to a verified file with the absolute
`UGANDA_ELECTORAL_DATA_PATH` environment variable.

Production configuration also supports `PORT` and a comma-separated
`CORS_ALLOWED_ORIGINS`. When no CORS origins are supplied in production,
cross-origin browser access is disabled; the same-origin dashboard continues
to work. Secrets are intentionally not injected into the Vite browser bundle.

Useful endpoints:

- `GET /api/electoral/uganda/summary`
- `GET /api/electoral/uganda/districts`
- `GET /api/electoral/uganda/constituencies?district=KAMPALA`
- `GET /api/electoral/uganda/subcounties?district=KAMPALA&constituency=...`
- `GET /api/electoral/uganda/parishes?...`
- `GET /api/electoral/uganda/villages?...&search=...&page=1&pageSize=50`

## Architecture entrypoints

- `App.tsx`: focused authenticated workspace entry
- `components/AdminDashboard.tsx`: authentication and shared dashboard state
- `components/MainContent.tsx`: dashboard view dispatch
- `types.ts`: shared domain contracts
- `data.ts`: demonstration datasets
- `server.ts`: Express API and Vite integration
- `firebaseService.ts`: Firestore subscriptions and writes
- `firestore.rules`: deployable Firestore authorization rules
- `firebase.json`: local Firestore emulator configuration

## Windows portability

The original AI Studio export committed prompt-history filenames containing
colons, which Windows cannot check out. Those files are not runtime inputs and
are excluded from the current working tree; their originals remain in Git
history.
