# Location Register Dashboard

Location Register is a React and TypeScript dashboard for managing African
country data, shops, inventory, sales, users, communications, wallets, and
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

## Validation

```powershell
npm run typecheck
npm run build
```

`npm test` runs the Firestore rules suite and expects the Firestore emulator
to already be listening on `localhost:8080`. Start it in another terminal with
the Firebase CLI:

```powershell
npx firebase-tools emulators:start --only firestore
```

## Persistence

- Firestore: products, stock, regional economic levels, and user profiles
- Express memory: countries (reset when the server restarts)
- Browser local storage: partners and pricing
- React demonstration state: most remaining modules

## Architecture entrypoints

- `App.tsx`: public site and dashboard entry
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
