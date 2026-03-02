# Deploy Hidup B40 to Vercel

## 1. Convex (required)

The app uses **Convex Cloud** in production (not the local dev server).

- Run `npx convex login` and sign in.
- From the project root, run **`npx convex deploy`** (use Node 20: `nvm use 20` first).
- Convex will give you a **production** deployment URL. You need this for Vercel.

## 2. Environment variables in Vercel

In Vercel: Project → Settings → Environment Variables. Add:

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | **Yes** | From Convex dashboard (production deployment URL) |
| `ANTHROPIC_API_KEY` | **Yes** | For AI-generated scenarios |
| `NEXT_PUBLIC_APP_URL` | Recommended | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `INTERNAL_API_KEY` | Optional | For analytics API protection (set a random string in prod) |
| `TIDB_HOST`, `TIDB_USER`, `TIDB_PASSWORD`, `TIDB_DATABASE`, `TIDB_PORT` | Optional | Only if you use TiDB analytics |

## 3. Deploy

- Push to GitHub and connect the repo in Vercel, or run `vercel` from the project root.
- Build command: `npm run build` (default).
- Output: Next.js (auto-detected).

## 4. After first deploy

- Set `NEXT_PUBLIC_APP_URL` to your live URL so Convex/TiDB sync callbacks work.
- Redeploy if you add or change env vars.
