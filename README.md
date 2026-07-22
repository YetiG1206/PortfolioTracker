# PortfolioTracker

Tracks S&P 500 deposits in shekels, with live index level and USD/ILS rate lookups via Claude.

## Structure

- `public/index.html` — the app (static HTML/JS, no build step)
- `api/claude.js` — serverless function (Vercel-compatible signature) that proxies calls to the Anthropic API, keeping the API key server-side
- `scripts/dev-server.mjs` — plain Node dev server that serves `public/` and runs `api/claude.js` locally, for testing without a Vercel login

## Run locally

1. Copy `.env.example` to `.env` and fill in a real Anthropic API key (`sk-ant-...` from console.anthropic.com → API Keys).
2. `npm run dev`
3. Open http://localhost:3000

Or with the Vercel CLI (requires `vercel login`): `npx vercel dev`.

Without a key set, the app still loads and shows cached/fallback figures — "Refresh rates," "Add deposit," and monthly-plan sync will show an error until `ANTHROPIC_API_KEY` is configured.

## Deploy

`npx vercel` (or connect the repo in the Vercel dashboard) and set `ANTHROPIC_API_KEY` as an environment variable in the project settings.
