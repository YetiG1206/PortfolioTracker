# InvestCheck

Tracks S&P 500 deposits in shekels, with live index level and USD/ILS rate lookups via [yfinance](https://github.com/ranaroussi/yfinance) (Yahoo Finance).

## Structure

- `public/index.html` — the app (static HTML/JS, no build step)
- `api/rates.py` — Vercel Python serverless function that fetches the latest (or historical) S&P 500 close and USD/ILS rate via yfinance
- `scripts/rates_cli.py` — the same lookup logic as a standalone CLI script, used by the local dev server
- `scripts/dev-server.mjs` — plain Node dev server that serves `public/` and shells out to `rates_cli.py` locally, for testing without a Vercel login

## Run locally

Requires Python 3 with `yfinance` installed: `pip install -r requirements.txt`.

1. `npm run dev`
2. Open http://localhost:3000

Or with the Vercel CLI (requires `vercel login`): `npx vercel dev`.

## Deploy

`npx vercel` (or connect the repo in the Vercel dashboard). Vercel auto-detects `api/rates.py` as a Python function and installs `requirements.txt`.
