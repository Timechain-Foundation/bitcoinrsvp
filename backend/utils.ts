import { v4 as uuidv4 } from "uuid";
import { Resend } from "resend";
const fs = require("fs");

const resend_api_key = process.env.RESEND_API_KEY;

export async function getGroupByGroupIdAndOrgId(db, groupId, orgId) {
  const getGroupByGroupIdAndOrgIdSql = `SELECT * FROM group_entity WHERE id = ? AND organizer_id = ?`;

  let group;
  try {
    group = await db.getAsync(getGroupByGroupIdAndOrgIdSql, groupId, orgId);
  } catch (e) {
    console.error(e);
    return;
  }

  return group;
}

export async function getGroupById(db, groupId) {
  const getGroupByGroupIdSql = `
  SELECT 
    group_entity.id as id,
    group_entity.name, 
    group_entity.description, 
    group_entity.rules,
    COALESCE(
        (
            SELECT json_group_array(json_object('id', q.id, 'question', q.question))
            FROM group_application_question q
            WHERE q.group_id = group_entity.id
        ),
        '[]'
    ) AS questions
  FROM group_entity 
  LEFT JOIN 
    group_application_question ON group_application_question.group_id = group_entity.id 
  WHERE group_entity.id = ?
  GROUP BY group_entity.id
`;

  let group;
  try {
    group = await db.getAsync(getGroupByGroupIdSql, groupId);
    group.questions = JSON.parse(group?.questions);
  } catch (e) {
    console.error(e);
    return;
  }

  return group;
}

const TicketType = {
  REGUALR: "regular",
  RANDOM: "random",
};

export async function createEvent(
  db,
  name: string,
  description: string,
  location: string,
  date: string,
  groupId: number
) {
  const createEventSql = `INSERT INTO event (name, description, location, group_id, date, date_created) VALUES (?, ?, ?, ?, ?, ?)`;
  let { lastID } = await db.runAsync(
    createEventSql,
    name,
    description,
    location,
    groupId,
    date,
    new Date().toISOString()
  );
  return lastID;
}

export async function setRegularTicketTier(
  db,
  eventId: number,
  priceInCents: number,
  maxQuantity: number
) {
  // event_id INTEGER NOT NULL,
  // type TEXT NOT NULL, /* 'regular', 'season', 'random' */
  // price_in_cents INTEGER NOT NULL,
  // max_quantity INTEGER NOT NULL,
  // FOREIGN KEY (event_id) REFERENCES event (id)

  const setRegularTicketSql = `INSERT INTO ticket (event_id, type, price_in_cents, max_quantity) VALUES (?, ?, ?, ?)`;
  let { lastID } = await db.runAsync(
    setRegularTicketSql,
    eventId,
    TicketType.REGUALR,
    priceInCents,
    maxQuantity
  );
  return lastID;
}

export async function setRandomTicketTier(
  db,
  eventId: number,
  priceInCents: number,
  maxQuantity: number
) {
  const setRandomTicketSql = `INSERT INTO ticket (event_id, type, price_in_cents, max_quantity) VALUES (?, ?, ?, ?)`;
  let { lastID } = await db.runAsync(
    setRandomTicketSql,
    eventId,
    TicketType.REGUALR,
    priceInCents,
    maxQuantity
  );
  return lastID;
}

export async function getEventsByGroupId(db, groupId: number) {
  let getEventsByGroupIdSql = `SELECT * FROM event WHERE group_id = ?`;
  return await db.allAsync(getEventsByGroupIdSql, groupId);
}

export async function getEventsById(db, eventId: number) {
  let getEventByIdSql = `SELECT * FROM event WHERE id = ?`;
  return db.getAsync(getEventByIdSql, eventId);
}

export async function getTicketInfoForEvent(db, eventId: number) {
  let getTicketsByGroupId = `SELECT * FROM ticket WHERE event_id = ?`;

  let availableTickets = await db.allAsync(getTicketsByGroupId, eventId);

  let getUsedTicketByEventId = `SELECT COUNT(*) as count, type FROM user_ticket WHERE event_id = ? GROUP BY type`;
  let usedTickets = await db.allAsync(getUsedTicketByEventId, eventId);

  return availableTickets.map((a) => {
    let count =
      usedTickets.filter((u) => {
        return u.type == a.type;
      })?.[0]?.count || 0;

    a["max_quantity"] - count;
    return a;
  });
}

export async function getUserById(db, userId) {
  const sql = `SELECT * FROM user WHERE id = ?`;
  return db.getAsync(sql, userId);
}

export async function getUserByInvoice(db, invoice) {
  const getUserInvoiceSql = `
    SELECT * FROM user_invoice WHERE invoice = ?
  `;

  let userInvoice = await db.getAsync(getUserInvoiceSql, invoice);
  let user = await getUserById(db, userInvoice.user_id);
  return [user, userInvoice];
}

export async function createUserInvoice(
  db,
  type,
  eventId,
  userId,
  amount,
  preimage,
  publicKey,
  address,
  invoice
) {
  const insertSql = `
    INSERT INTO user_invoice (type, event_id, user_id, amount_satoshis, preimage, public_key, address, invoice, date_created)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  let { lastID } = await db.runAsync(
    insertSql,
    type,
    eventId,
    userId,
    amount,
    preimage,
    publicKey,
    address,
    invoice,
    new Date().toISOString()
  );
}

export async function createUserTicket(
  db: any,
  type: string,
  eventId: any,
  userId: any
) {
  const insertSql = `
    INSERT INTO user_ticket (type, event_id, user_id, code, date_created)
    VALUES (?, ?, ?, ?, ?)
  `;
  let code = uuidv4();
  let { lastID } = await db.runAsync(
    insertSql,
    type,
    eventId,
    userId,
    code,
    new Date().toISOString()
  );
  return code;
}

export async function getUserTicket(db: any, eventId: any, userId: any) {
  const sql = `SELECT * FROM user_ticket WHERE user_id = ? AND event_id = ?`;
  let userTicket = await db.getAsync(sql, userId, eventId);

  return userTicket;
}

export async function getSatoshisFromCents(cents: number) {
  let priceResponse = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );
  let priceResponseJson = await priceResponse.json();
  let bitcoinPriceInCents = priceResponseJson.bitcoin.usd * 100;
  return Math.round((cents / bitcoinPriceInCents) * 1_0000_0000);
}

async function readFile(relativeFilePath) {
  return fs.promises.readFile(`${__dirname}/${relativeFilePath}`, {
    encoding: "utf-8",
  });
}

export async function sendPendingEmail(email) {
  const resend = new Resend(resend_api_key);
  let index = await readFile("/email-template/index.html");

  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [email],
    subject: "We successfully received your submission",
    html: index,
  });
}
