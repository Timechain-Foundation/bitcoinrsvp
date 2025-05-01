import type { Knex } from "knex";

const isTestEnv = process.env.NODE_ENV === "test";
const filename = isTestEnv ? "test.sqlite" : "./db.sqlite";

const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename,
  },
};

export default config;
