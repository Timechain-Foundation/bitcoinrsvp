// db.ts
import sqlite3 from "sqlite3";

class DB {
  public db: sqlite3.Database;

  constructor() {
    const isTestEnv = process.env.NODE_ENV === "test";
    const dbPath = isTestEnv ? "test.sqlite" : "db.sqlite";
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Could not connect to database:", err.message);
      } else {
        console.log("Connected to the SQLite database from DB class.");
      }
    });
  }

  async allAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows: T[]) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  async getAsync<T = any>(
    sql: string,
    ...params: any[]
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      this.db.get(sql, ...params, function (err: Error | null, row: T) {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  async runAsync(
    sql: string,
    ...params: any[]
  ): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function (err: Error | null) {
        if (err) {
          return reject(err);
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async execAsync(sql: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.exec(sql, (err: Error | null) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database:", err.message);
          reject(err);
        } else {
          console.log("Closed the database connection.");
          resolve();
        }
      });
    });
  }
}

export default DB;
