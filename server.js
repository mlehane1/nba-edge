import express from "express";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ODDS_API_KEY = process.env.ODDS_API_KEY;

// Serve built frontend in production
app.use(express.static(join(__dirname, "dist")));

// ── Odds proxy endpoint ───────────────────────────────────────────────────────
app.get("/api/odds", async (req, res) => {
  if (!ODDS_API_KEY) {
    return res.status(500).json({ error: "ODDS_API_KEY environment variable is not set" });
  }

  const url = new URL("https://api.the-odds-api.com/v4/sports/basketball_nba/odds");
  url.searchParams.set("apiKey", ODDS_API_KEY);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "h2h,spreads,totals");
  url.searchParams.set("oddsFormat", "american");

  try {
    const upstream = await fetch(url.toString());
    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    // Forward usage headers to the client
    res.set("X-Requests-Used",      upstream.headers.get("x-requests-used") || "");
    res.set("X-Requests-Remaining", upstream.headers.get("x-requests-remaining") || "");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, keyConfigured: !!ODDS_API_KEY });
});

// SPA fallback — serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`NBA Edge running on port ${PORT}`);
  if (!ODDS_API_KEY) console.warn("⚠  ODDS_API_KEY not set — /api/odds will return 500");
});
