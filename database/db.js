cat > database/db.js << 'EOF'
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, "passwords.db");
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
      } else {
        this.initialize();
      }
    });
  }

  initialize() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL
      )
    `;
    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error("Ошибка создания таблицы:", err.message);
      }
    });
  }

  savePassword(password) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO passwords (password) VALUES (?)";
      this.db.run(sql, [password], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  getHistory(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = SELECT password FROM passwords ORDER BY id DESC LIMIT ?;
      this.db.all(sql, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Database;