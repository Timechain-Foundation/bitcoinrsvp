import { schema } from "../db/schema";
import { createDb } from "../db/create-db";
import DB from "../db/db";
import knex from "knex";
import knexConfig from "../knexfile";

interface TableInfo {
  name: string;
}

let db = new DB();

beforeAll(async () => {
  createDb();
  await db.execAsync(schema);
  await knex(knexConfig).migrate.latest();
});

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  const tables = await db.allAsync<TableInfo>(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );

  const MIGRATIONS_TABLE = "knex_migrations";

  for (const table of tables) {
    if(table.name === MIGRATIONS_TABLE) {
      continue;
    }

    await db.db.run(`DELETE FROM ${table.name}`);
  }
});
