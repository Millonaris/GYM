import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import { Pool } from "pg";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);

function validateUid(uid) {
  if (typeof uid !== "string") return null;
  const trimmed = uid.trim();
  if (!trimmed || trimmed.length > 128) return null;
  return trimmed;
}

function parseJsonSafe(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

class PgStateStore {
  constructor(connectionString) {
    const requiresSsl = /neon\.tech|supabase\.co/i.test(connectionString);
    this.pool = new Pool({
      connectionString,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
    });
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS user_state (
        user_id TEXT PRIMARY KEY,
        history_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        active_json JSONB DEFAULT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async getState(userId) {
    const result = await this.pool.query(
      `SELECT history_json, active_json, updated_at
       FROM user_state
       WHERE user_id = $1`,
      [userId]
    );

    if (!result.rowCount) {
      return { history: [], active: null, updatedAt: null };
    }

    const row = result.rows[0];
    return {
      history: Array.isArray(row.history_json) ? row.history_json : [],
      active: row.active_json ?? null,
      updatedAt: row.updated_at,
    };
  }

  async saveState(userId, history, active) {
    await this.pool.query(
      `INSERT INTO user_state (user_id, history_json, active_json, updated_at)
       VALUES ($1, $2::jsonb, $3::jsonb, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         history_json = EXCLUDED.history_json,
         active_json = EXCLUDED.active_json,
         updated_at = NOW()`,
      [userId, JSON.stringify(history ?? []), JSON.stringify(active ?? null)]
    );
  }
}

class SqliteStateStore {
  constructor(filePath) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    this.db.pragma("journal_mode = WAL");
  }

  async init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_state (
        user_id TEXT PRIMARY KEY,
        history_json TEXT NOT NULL DEFAULT '[]',
        active_json TEXT DEFAULT 'null',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getState(userId) {
    const row = this.db
      .prepare(
        `SELECT history_json, active_json, updated_at
         FROM user_state
         WHERE user_id = ?`
      )
      .get(userId);

    if (!row) {
      return { history: [], active: null, updatedAt: null };
    }

    return {
      history: parseJsonSafe(row.history_json, []),
      active: parseJsonSafe(row.active_json, null),
      updatedAt: row.updated_at,
    };
  }

  async saveState(userId, history, active) {
    this.db
      .prepare(
        `INSERT INTO user_state (user_id, history_json, active_json, updated_at)
         VALUES (?, ?, ?, datetime('now'))
         ON CONFLICT(user_id)
         DO UPDATE SET
           history_json = excluded.history_json,
           active_json = excluded.active_json,
           updated_at = datetime('now')`
      )
      .run(userId, JSON.stringify(history ?? []), JSON.stringify(active ?? null));
  }
}

function createStore() {
  if (process.env.DATABASE_URL) {
    console.log("[db] Using Postgres (DATABASE_URL)");
    return new PgStateStore(process.env.DATABASE_URL);
  }

  const sqlitePath = path.join(rootDir, "data", "gymtracker.db");
  console.log(`[db] Using SQLite (${sqlitePath})`);
  return new SqliteStateStore(sqlitePath);
}

const store = createStore();
await store.init();

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get("/api/state", async (req, res) => {
  const uid = validateUid(req.query.uid);
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  try {
    const state = await store.getState(uid);
    res.json(state);
  } catch (err) {
    console.error("[api/state GET]", err);
    res.status(500).json({ error: "failed_to_load_state" });
  }
});

app.put("/api/state", async (req, res) => {
  const uid = validateUid(req.query.uid);
  if (!uid) {
    return res.status(400).json({ error: "uid is required" });
  }

  const hasHistory = Object.prototype.hasOwnProperty.call(req.body || {}, "history");
  const hasActive = Object.prototype.hasOwnProperty.call(req.body || {}, "active");

  if (!hasHistory && !hasActive) {
    return res.status(400).json({ error: "history or active is required" });
  }

  if (hasHistory && !Array.isArray(req.body.history)) {
    return res.status(400).json({ error: "history must be an array" });
  }

  if (hasActive && req.body.active !== null && typeof req.body.active !== "object") {
    return res.status(400).json({ error: "active must be object or null" });
  }

  try {
    const current = await store.getState(uid);
    const history = hasHistory ? req.body.history : current.history;
    const active = hasActive ? req.body.active : current.active;
    await store.saveState(uid, history, active);
    res.json({ ok: true });
  } catch (err) {
    console.error("[api/state PUT]", err);
    res.status(500).json({ error: "failed_to_save_state" });
  }
});

if (isProd) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`[server] Running on http://localhost:${port}`);
});
