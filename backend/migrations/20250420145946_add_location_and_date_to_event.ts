import type { Knex } from "knex";

export async function up(knex: Knex): Promise<any> {
  let updates = [];
  updates.push(
    knex.raw("ALTER TABLE event ADD COLUMN location TEXT DEFAULT NULL")
  );
  updates.push(
    knex.raw("ALTER TABLE event ADD COLUMN date TEXT DEFAULT NULL")
  );
  return Promise.all(updates);
}

export async function down(knex: Knex): Promise<any> {
  let updates = [];
  updates.push(knex.raw("ALTER TABLE event DROP COLUMN location"));
  updates.push(knex.raw("ALTER TABLE event DROP COLUMN date"));
  return Promise.all(updates);
}
