import express, { Express, Request, Response } from "express";
import { AsyncDatabase } from "promised-sqlite3";
import CookieHelper from "./cookie-helper";
import createDb from "./db/create-db";
import { v4 as uuidv4 } from "uuid";
import cookieParser from "cookie-parser";
import ECPairFactory from "ecpair";
import * as ecclib from "tiny-secp256k1";
import {
  createEvent,
  createUserInvoice,
  createUserTicket,
  getEventsByGroupId,
  getEventsById,
  getGroupByGroupIdAndOrgId,
  getGroupById,
  getSatoshisFromCents,
  getTicketInfoForEvent,
  getUserByInvoice,
  getUserTicket,
  sendPendingEmail,
  setRandomTicketTier,
  setRegularTicketTier,
} from "./utils";
import BoltzClient from "./boltz-client";
var cors = require("cors");

let app: Express = express();
app.use(express.json());
app.use(cors());

const UNAUTHENTICATED_ORGANIZER_REQUEST =
  "You must be logged in as an org to request this action";

const secretKey = process.env.COOKIE_SECRET_KEY;
app.use(cookieParser(secretKey));

export const ECPair = ECPairFactory(ecclib);
let keypair = ECPair.fromPrivateKey(
  Buffer.from(process.env.LIQUID_PRIVATE_KEY, "hex")
);

app.get("/ping", (req: Request, res: Response): any => {
  return res.send(true);
});

app.get("/", (req, res) => {
  const ext = __dirname + "/ui/build";
  res.sendFile(ext + "/index.html");
});

app.get("/org/auth", (req: Request, res: Response) => {});

app.post("/org", async (req: Request, res: Response): Promise<any> => {
  let { email } = req.body;

  const insertOrgSql = `
        INSERT INTO organizer (email, date_created)
        VALUES (?, ?)
      `;

  let r = await db.run(insertOrgSql, email, new Date().toISOString());
  let { lastID } = r;
  CookieHelper.setOrgCookie(res, lastID);
  return res.send(r);
});

app.post("/group", async (req: Request, res: Response): Promise<any> => {
  let orgSession = CookieHelper.getOrgCookie(req);

  if (!orgSession) {
    return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
  }

  let { name, description = "", rules = "" } = req.body;

  if (!name) {
    return res.status(400).send("Must have valid name");
  }

  const insertGroupSql = `
        INSERT INTO group_entity (name, description, rules, organizer_id, date_created)
        VALUES (?, ?, ?, ?, ?)
      `;

  try {
    await db.run(
      insertGroupSql,
      name,
      description,
      rules,
      orgSession.org_id,
      new Date().toISOString()
    );
  } catch (e) {
    console.error(e);
  }

  // TODO: Create season pass

  return res.send(true);
});

app.get("/group", async (req: Request, res: Response): Promise<any> => {
  let orgSession = CookieHelper.getOrgCookie(req);

  if (!orgSession) {
    return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
  }

  const getGroupSql = `
  SELECT 
    g.id,
    g.name,
    g.description,
    g.rules,
    COALESCE(
        (
            SELECT json_group_array(json_object('id', q.id, 'question', q.question))
            FROM group_application_question q
            WHERE q.group_id = g.id
        ),
        '[]'
    ) AS questions
FROM group_entity g
WHERE g.organizer_id = ?`;

  try {
    let groups = await db.all(getGroupSql, orgSession.org_id);

    groups.map((g) => {
      g.questions = JSON.parse(g.questions);
    });

    return res.send(groups);
  } catch (e) {
    console.error(e);
  }

  return res.status(500).send(true);
});

app.post(
  "/:group_id/membership/question",
  async (req: Request, res: Response): Promise<any> => {
    let { questions } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).send("'questions' must be an array");
    }

    let { group_id } = req.params;
    let group = await getGroupById(db, group_id);

    if (!group) {
      return res.status(400).send("Group not found");
    }

    let insert = `INSERT INTO group_application_question (group_id, question, date_created) VALUES (?, ?, ?)`;
    for (let q of questions) {
      await db.run(insert, group_id, q, new Date().toString());
    }

    return res.json(questions);
  }
);

app.get(
  "/group/:group_id",
  async (req: Request, res: Response): Promise<any> => {
    let { group_id } = req.params;
    let group = await getGroupById(db, group_id);

    if (!group) {
      return res.status(400).send("Group not found");
    }

    return res.json(group);
  }
);

app.post(
  "/:group_id/membership",
  async (req: Request, res: Response): Promise<any> => {
    let { email, name, questions: applicationAnswers } = req.body;

    if (!email) {
      return res.status(400).send("Must enter a valid email");
    }

    if (!name) {
      return res.status(400).send("Must enter a valid name");
    }

    if (applicationAnswers && !Array.isArray(applicationAnswers)) {
      return res.status(400).send("questions must be an array");
    }

    let { group_id } = req.params;
    let group = await getGroupById(db, group_id);

    if (!group) {
      return res.status(400).send("Group not found");
    }

    let errors = [];
    group?.questions?.forEach((element) => {
      if (
        element?.id &&
        !applicationAnswers?.some((ans) => ans.id == element.id)
      ) {
        return errors.push(
          `Received empty answer for question '${element.question}'`
        );
      }
    });

    if (errors.length) {
      return res.status(400).send(errors[0]);
    }

    const getUserSql = `SELECT id FROM user WHERE email = ?`;

    let userId;
    try {
      let user = await db.get(getUserSql, email);
      userId = user?.id;
    } catch (e) {
      console.error(e);
      return res.status(500).send();
    }

    if (!userId) {
      const insertUserSql = `
        INSERT INTO user (email, name, date_created)
        VALUES (?, ?, ?)
      `;

      let userInsertResponse = await db.run(
        insertUserSql,
        email,
        name,
        new Date().toISOString()
      );
      userId = userInsertResponse.lastID;
    }

    // TODO: Verify this works
    let userMembership = await db.get(
      `SELECT * FROM membership WHERE user_id = ?`,
      userId
    );
    if (userMembership?.approval_status) {
      return res
        .status(400)
        .send(
          `User has already applied to group and has '${userMembership?.approval_status}' status`
        );
    }

    const invitationCode = uuidv4();
    const insertMembershipSql = `
    INSERT INTO membership (user_id, group_id, approval_status, invitation_code, date_created)
    VALUES (?, ?, 'pending', ?, ?)
    `;

    await db.run(
      insertMembershipSql,
      userId,
      group.id,
      invitationCode,
      new Date().toISOString()
    );

    let questionInsertionSql = `INSERT INTO group_application_answer 
    (group_application_question_id, user_id, answer, date_created)
    VALUES (?, ?, ?, ?)`;
    applicationAnswers.forEach((answer) => {
      db.run(
        questionInsertionSql,
        answer.id,
        userId,
        answer.answer,
        new Date().toString()
      );
    });

    // TODO: Uncomment
    // await sendPendingEmail(email);

    return res.send(true);
  }
);

app.get(
  "/:group_id/membership",
  async (req: Request, res: Response): Promise<any> => {
    let orgSession = CookieHelper.getOrgCookie(req);
    if (!orgSession) {
      return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
    }

    let { group_id } = req.params;
    let group = await getGroupByGroupIdAndOrgId(
      db,
      group_id,
      orgSession.org_id
    );

    if (!group) {
      return res.status(400).send("Group not found");
    }

    const getGroupApplications = `
    SELECT
      user.email,
      membership.*,
      COALESCE(
        (
          SELECT json_group_array(
            json_object('question', gq.question, 'answer', ga.answer)
          )
          FROM group_application_answer ga
          JOIN group_application_question gq
            ON gq.id = ga.group_application_question_id
          WHERE ga.user_id = user.id
        ),
        '[]'
      ) AS answers
    FROM membership
    LEFT JOIN user ON user.id = membership.user_id
    WHERE membership.group_id = ?`;

    let groupApplications = await db.all(getGroupApplications, group.id);
    groupApplications.map((ga) => {
      ga.answers = JSON.parse(ga.answers);
      return ga;
    });
    return res.json(groupApplications);
  }
);

app.post(
  "/:group_id/membership/:membership_id/:approval_status",
  async (req: Request, res: Response): Promise<any> => {
    let orgSession = CookieHelper.getOrgCookie(req);
    if (!orgSession) {
      return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
    }

    let { group_id, membership_id, approval_status } = req.params;

    if (approval_status != "approve" && approval_status != "reject") {
      return res
        .status(400)
        .send("Approval status must be 'approve' or 'reject'");
    }

    const getGroupByGroupIdAndOrgIdSql = `SELECT * FROM group_entity WHERE id = ? AND organizer_id = ?`;

    let group;
    try {
      group = await db.get(
        getGroupByGroupIdAndOrgIdSql,
        group_id,
        orgSession.org_id
      );
    } catch (e) {
      console.error(e);
      return;
    }

    const getGroupApplicationByMembershipId = `SELECT * FROM membership WHERE group_id = ? AND id = ?`;
    let groupApplication = await db.get(
      getGroupApplicationByMembershipId,
      group.id,
      membership_id
    );

    if (!groupApplication) {
      return res.status(400).send("Group application not found");
    }

    if (groupApplication.approval_status != "pending") {
      return res
        .status(400)
        .send(
          `Membership application already ${groupApplication.approval_status}d`
        );
    }

    const updateMembershipApplication = `UPDATE membership SET approval_status = ?`;
    await db.run(updateMembershipApplication, approval_status);

    return res.json(true);
  }
);

app.post(
  "/:group_id/event",
  async (req: Request, res: Response): Promise<any> => {
    let orgSession = CookieHelper.getOrgCookie(req);
    if (!orgSession) {
      return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
    }

    let { group_id } = req.params;
    let group = await getGroupByGroupIdAndOrgId(
      db,
      group_id,
      orgSession.org_id
    );

    if (!group) {
      return res.status(400).send("Group not found");
    }

    let {
      event_name: eventName,
      event_description: eventDescription,
      price_in_cents: priceInCents,
      max_quantity: maxQuantity,
    } = req.body;

    let eventId = await createEvent(db, eventName, eventDescription, group.id);
    await setRegularTicketTier(db, eventId, priceInCents, maxQuantity);
    await setRandomTicketTier(db, eventId, priceInCents, maxQuantity);
    return res.json(200);
  }
);

app.get(
  "/:group_id/event",
  async (req: Request, res: Response): Promise<any> => {
    let orgSession = CookieHelper.getOrgCookie(req);
    if (!orgSession) {
      return res.status(400).send(UNAUTHENTICATED_ORGANIZER_REQUEST);
    }

    let { group_id } = req.params;
    let group = await getGroupByGroupIdAndOrgId(
      db,
      group_id,
      orgSession.org_id
    );

    if (!group) {
      return res.status(400).send("Group not found");
    }

    let events = await getEventsByGroupId(db, group.id);
    return res.json(events);
  }
);

app.get(
  "/event/:event_id/ticket",
  async (req: Request, res: Response): Promise<any> => {
    let { event_id: eventId } = req.params;
    let event = await getEventsById(db, Number(eventId));

    if (!event) {
      return res.status(400).send("Event not found");
    }

    let tickets = await getTicketInfoForEvent(db, event.id);
    return res.json(tickets);
  }
);

app.post(
  "/event/:event_id/ticket/invoice",
  async (req: Request, res: Response): Promise<any> => {
    let { event_id: eventId } = req.params;
    let event = await getEventsById(db, Number(eventId));

    if (!event) {
      return res.status(400).send("Event not found");
    }

    let tickets = await getTicketInfoForEvent(db, event.id);

    let { type, user_id } = req.body;

    let userTicket = await getUserTicket(db, eventId, user_id);

    if (userTicket) {
      return res.status(400).send("User already has a ticket");
    }

    if (type != "regular" && type != "random") {
      return res.status(400).send("Must be regular or random");
    }

    let ticket = tickets.filter((t) => {
      return t.type == type;
    })[0];

    if (ticket.max_quantity <= 0) {
      return res.status(400).send("No more tickets");
    }

    let amountInSatoshis = await getSatoshisFromCents(ticket.price_in_cents);
    let preimage = uuidv4();
    let publicKey = keypair.publicKey.toString("hex");

    let reverseSubmarineSwapResponse = await BoltzClient.getInvoice(
      preimage,
      publicKey,
      amountInSatoshis
    );
    await createUserInvoice(
      db,
      type,
      eventId,
      user_id,
      amountInSatoshis,
      preimage,
      publicKey,
      reverseSubmarineSwapResponse.lockupAddress,
      reverseSubmarineSwapResponse.invoice
    );

    return res.json({
      invoice: reverseSubmarineSwapResponse.invoice,
    });
  }
);

//TODO: Call repeatedly from frontend and cron job
app.post(
  "/event/:event_id/ticket/invoice/confirm",
  async (req: Request, res: Response): Promise<any> => {
    let { event_id: eventId } = req.params;
    let event = await getEventsById(db, Number(eventId));

    if (!event) {
      return res.status(400).send("Event not found");
    }

    let { invoice } = req.body;
    let [user, userInvoice] = await getUserByInvoice(db, invoice);

    if (!user || !userInvoice) {
      return res.status(400).send("Invoice not found");
    }

    // TODO: Validate address on userInvoice was paid and return 400 if not

    try {
      let code = await createUserTicket(db, userInvoice.type, eventId, user.id);
      //TODO: Fire off email to notify user

      return res.json({
        code,
      });
    } catch (e) {
      console.error(e);
      return res
        .status(400)
        .send("The ticket for this invoice has already been redeemed");
    }
  }
);

app.use(express.static(__dirname + "/ui/build"));

const PORT = 8080;

let db;
app.listen(PORT, async () => {
  db = await AsyncDatabase.open("./db.sqlite");
  createDb();
  console.log(`Listening on ${PORT}`);
});
