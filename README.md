# grip-app

Frontend for Grip, Friday Night Films' gear rental and lending app. The backend is
grip-api (Django, private repo), served at https://api.fridaynightfilms.com.

| Workspace | What it is |
| --- | --- |
| `apps/web` | The renter-facing web app: Vite, React, TypeScript, Tailwind. Will live at grip.fridaynightfilms.com. |

## Run it locally

Needs Node 24 (pinned in `.tool-versions` for asdf).

```sh
npm install
npm run dev      # http://localhost:5173
npm run lint
npm test
npm run build
```
