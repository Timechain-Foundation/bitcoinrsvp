export const schema = `
  CREATE TABLE IF NOT EXISTS organizer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    date_created TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS organizer_login (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizer_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    expiration TEXT NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES organizer (id)
  );

  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date_created TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_login (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    expiration TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

  CREATE TABLE IF NOT EXISTS group_entity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    rules TEXT,
    organizer_id INTEGER NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES organizer (id),
    UNIQUE(name, organizer_id)
  );

  CREATE TABLE IF NOT EXISTS membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending', /* pending, approved, rejected */
    invitation_code TEXT NOT NULL, /* a UUID or random code */
    date_created TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (group_id) REFERENCES group_entity (id)
  );

  CREATE TABLE IF NOT EXISTS event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    group_id INTEGER,
    date_created TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES group_entity (id)
  );

  CREATE TABLE IF NOT EXISTS group_application_question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES group_entity (id)
  );

  CREATE TABLE IF NOT EXISTS group_application_answer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_application_question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (group_application_question_id) REFERENCES group_application_question (id),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

  CREATE TABLE IF NOT EXISTS ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    type TEXT NOT NULL, /* 'regular', 'season', 'random' */
    price_in_cents INTEGER NOT NULL,
    max_quantity INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event (id)
  );

  CREATE TABLE IF NOT EXISTS user_ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, /* 'regular', 'random' */
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event (id),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_ticket_user_event 
  ON user_ticket (user_id, event_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_ticket_event_code 
  ON user_ticket (event_id, code);

  CREATE TABLE IF NOT EXISTS season_pass (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, /* 'regular', 'random' */
    group_id INTEGER NOT NULL,
    max_quantity INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES group_entity (id)
  );

  CREATE TABLE IF NOT EXISTS user_season_pass (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    season_pass_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (season_pass_id) REFERENCES season_pass (id)
  );

  CREATE TABLE IF NOT EXISTS user_invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount_satoshis INTEGER NOT NULL,
    preimage TEXT NOT NULL,
    public_key TEXT NOT NULL,
    address TEXT NOT NULL,
    invoice TEXT NOT NULL,
    date_created TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES event (id),
    FOREIGN KEY (user_id) REFERENCES user (id)
  );

`;
