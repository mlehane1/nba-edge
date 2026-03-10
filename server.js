import express from "express";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const ODDS_API_KEY      = process.env.ODDS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "2mb" }));
app.use(express.static(join(__dirname, "dist")));

// ── Odds proxy ────────────────────────────────────────────────────────────────
app.get("/api/odds", async (req, res) => {
  if (!ODDS_API_KEY)
    return res.status(500).json({ error: "ODDS_API_KEY is not set" });

  const url = new URL("https://api.the-odds-api.com/v4/sports/basketball_nba/odds");
  url.searchParams.set("apiKey", ODDS_API_KEY);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "h2h,spreads,totals");
  url.searchParams.set("oddsFormat", "american");

  try {
    const upstream = await fetch(url.toString());
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    res.set("X-Requests-Used",      upstream.headers.get("x-requests-used") || "");
    res.set("X-Requests-Remaining", upstream.headers.get("x-requests-remaining") || "");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Anthropic proxy ───────────────────────────────────────────────────────────
app.post("/api/ai", async (req, res) => {
  if (!ANTHROPIC_API_KEY)
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" });

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, oddsKey: !!ODDS_API_KEY, anthropicKey: !!ANTHROPIC_API_KEY });
});

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`NBA Edge running on port ${PORT}`);
  if (!ODDS_API_KEY)      console.warn("⚠  ODDS_API_KEY not set");
  if (!ANTHROPIC_API_KEY) console.warn("⚠  ANTHROPIC_API_KEY not set");
});
