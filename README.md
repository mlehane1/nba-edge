# NBA Edge — Spread Analyzer

Full-stack React + Express app. The backend holds your Odds API key as an env variable and proxies all requests — the key is never exposed to the browser.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env and add your ODDS_API_KEY

# 3. Run both servers (Express on :3000, Vite on :5173)
npm run dev
```

## Deploy to Railway

### Option A — GitHub (recommended)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select your repo
4. In the Railway project, go to **Variables** and add:
   ```
   ODDS_API_KEY = your_key_from_the-odds-api.com
   ```
5. Railway will automatically build (`npm run build`) and start (`npm start`)
6. Your app will be live at the generated `.up.railway.app` URL

### Option B — Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway variables set ODDS_API_KEY=your_key_here
railway up
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ODDS_API_KEY` | Yes | From [the-odds-api.com](https://the-odds-api.com) |
| `PORT` | No | Defaults to 3000, Railway sets this automatically |

## API Endpoints

- `GET /api/odds` — proxies NBA odds from The Odds API (spreads, totals, moneylines)
- `GET /api/health` — health check, returns `{ ok: true, keyConfigured: true/false }`
