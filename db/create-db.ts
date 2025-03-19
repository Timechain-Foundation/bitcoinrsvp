// create-db.ts
import sqlite3 from "sqlite3";
import { schema } from './schema';

export function createDb() {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const dbPath = isTestEnv ? 'test.sqlite' : 'db.sqlite';

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQLite database for setup.");
  });

  db.serialize(async () => {
    db.exec(schema, (err) => {
      if (err) {
        console.log("error creating tables " + err);
      } else {
        console.log('All tables ensured to exist.');
      }
    });
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the setup database connection.");
  });
}

export default createDb;

// If you want to run this directly with ts-node:
if (require.main === module) {
  createDb();
}
