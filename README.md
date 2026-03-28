# TC-bootcamp

## Flappy TAMID leaderboard

Scores are stored in **SQLite** (`leaderboard.db`) by a small **Express** server.

1. `npm install`
2. `npm start`
3. Open **http://127.0.0.1:3456/flappy-tamid.html** (use this URL so the game can reach `/api/leaderboard` and `/api/scores`).

Opening `flappy-tamid.html` as a file (`file://`) still works for gameplay; the client will try `http://127.0.0.1:3456` for the API when the server is running.
