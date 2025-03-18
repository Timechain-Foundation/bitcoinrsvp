import { schema } from '../db/schema';
import { createDb } from '../db/create-db';
import DB from '../db/db';

interface TableInfo {
  name: string,
};

let db = new DB();

beforeAll(async () => {
  createDb();
  await db.execAsync(schema);
});

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  const tables = await db.allAsync<TableInfo>(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );

  for (const table of tables) {
    await db.db.run(`DELETE FROM ${table.name}`);
  }
});
