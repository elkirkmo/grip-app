# grip-app

A web app for renting and lending gear. It works with any backend that implements the
API contract in `packages/api/openapi.yaml`. The reference backend is grip-api.

| Workspace | What it is |
| --- | --- |
| `apps/web` | The renter-facing web app: Vite, React, TypeScript, Tailwind. |
| `packages/api` | The API contract (`openapi.yaml`), types generated from it, and a typed client (`createApiClient`). |

## Run it locally

Needs Node 24 (pinned in `.tool-versions` for asdf).

```sh
npm install
cp apps/web/.env.example apps/web/.env.local   # then point it at your backend
npm run dev      # http://localhost:5173
npm run lint
npm test
npm run build
```

**Adding a dependency:** `npm install <package>` hits [npm/cli#4828](https://github.com/npm/cli/issues/4828)
here and drops Vite's native bundler from `package-lock.json` ("Cannot find native binding"). Add the package to the
workspace's `package.json` by hand, then `rm -rf node_modules */*/node_modules package-lock.json && npm install`.

## Configuration

Set in `apps/web/.env.local` locally, and in the hosting provider's environment settings for
deployments. The build fails if either of the first two is missing. Values end up in the browser bundle, so
never put secrets here.

| Variable | What it is |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend |
| `VITE_APP_NAME` | Name shown in the page title and header |
| `VITE_CURRENCY` | Optional ISO currency code for prices; defaults to `USD` |

## The API contract

`packages/api/openapi.yaml` lists only the public operations this app calls. Any backend that
implements it works. Types in `src/schema.d.ts` are generated from it, and CI fails if they're stale.

To pick up backend changes, or to use a new endpoint:

1. Add the endpoint's `operationId` to `OPERATIONS` in `packages/api/scripts/sync-contract.mjs`.
   The script refuses operations that need a login.
2. `npm run sync -w @grip/api -- <path to the backend's openapi.yaml>`
3. `npm run gen -w @grip/api`
