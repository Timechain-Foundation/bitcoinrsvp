import type { Knex } from "knex";

// Update with your config settings.

const config: Knex.Config  = {
  client: "sqlite3",
  connection: {
    filename: "./db.sqlite",
  },
};

module.exports = config;
