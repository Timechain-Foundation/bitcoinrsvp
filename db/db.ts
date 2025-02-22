// db.ts
import sqlite3 from "sqlite3";

const dbFile = "db.sqlite";

class DB {
  public db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error("Could not connect to database:", err.message);
      } else {
        console.log("Connected to the SQLite database from DB class.");
      }
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Closed the database connection.");
      }
    });
  }
}

export default DB;
