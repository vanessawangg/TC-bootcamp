import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3456;
const dbPath = path.join(__dirname, 'leaderboard.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scores_points ON scores (score DESC);
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '8kb' }));
app.use(express.static(__dirname));

app.get('/api/leaderboard', (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const rows = db
      .prepare(
        `SELECT player_name AS playerName, score, difficulty, created_at AS createdAt
         FROM scores
         ORDER BY score DESC, id ASC
         LIMIT ?`,
      )
      .all(limit);
    res.json({ rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/scores', (req, res) => {
  try {
    let { playerName, score, difficulty } = req.body || {};
    playerName = String(playerName || 'Player').trim().slice(0, 24) || 'Player';
    score = parseInt(score, 10);
    if (!Number.isFinite(score) || score < 0 || score > 1_000_000) {
      return res.status(400).json({ error: 'invalid_score' });
    }
    const okDiff = ['easy', 'medium', 'hard'];
    if (!okDiff.includes(difficulty)) difficulty = 'medium';

    const info = db
      .prepare(
        `INSERT INTO scores (player_name, score, difficulty)
         VALUES (?, ?, ?)`,
      )
      .run(playerName, score, difficulty);

    res.json({ ok: true, id: Number(info.lastInsertRowid) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.listen(PORT, () => {
  console.log(`Open http://127.0.0.1:${PORT}/flappy-tamid.html  (API + static files)`);
});
