const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./coins.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mint TEXT UNIQUE,
      creator TEXT,
      first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'NEW'
    )
  `);
});

function dbGet(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    db,
    dbGet
};