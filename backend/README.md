# MonoLeague Backend

Express API for matches, players, scorecard, and player-stats (predictions).

## Run locally

```bash
npm install
npm run dev
```

Runs on http://localhost:3001.

## Deploy (Render)

1. Push this repo to GitHub (backend lives in `/backend`).
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the **MonoLeague** repo. Render will use the root `render.yaml` and `Dockerfile.backend`.
4. After deploy, copy the backend URL (e.g. `https://monoleague-backend.onrender.com`).
5. In your frontend, set `VITE_API_URL` to that URL (e.g. in Vercel/Netlify env or `.env.production`).

## Deploy with Docker

From repo root:

```bash
docker build -f Dockerfile.backend -t monoleague-backend .
docker run -p 3001:3001 monoleague-backend
```
