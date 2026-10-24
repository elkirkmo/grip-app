# grip-app

A web app for renting and lending gear. It works with any backend that implements the
API contract in `packages/api/openapi.yaml` (coming next). The reference backend is grip-api.

| Workspace | What it is |
| --- | --- |
| `apps/web` | The renter-facing web app: Vite, React, TypeScript, Tailwind. |

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

## Configuration

Set in `apps/web/.env.local` locally, and in the hosting provider's environment settings for
deployments. The build fails if either is missing. Values end up in the browser bundle, so
never put secrets here.

| Variable | What it is |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend |
| `VITE_APP_NAME` | Name shown in the page title and header |
