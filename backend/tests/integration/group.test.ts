import request from "supertest";
import app from "../../app";
import CookieHelper, { Constants } from "../../cookie-helper";
import DB from "../../db/db";

const secretKey = process.env.COOKIE_SECRET_KEY || "test-secret";

describe("POST /group", () => {
  const db = new DB();

  it("should create a group and prevent duplicate creation", async () => {
    const testGroupData = {
      name: "Dinner season one",
      description: "a dinner among friends",
      rules: "be cool",
    };

    const cookie = CookieHelper.generateSignedCookie(
      Constants.orgSessionCookieName,
      { org_id: 1 },
      secretKey
    );

    // Add a new group
    const res1 = await request(app)
      .post("/group")
      .set("Cookie", cookie)
      .send(testGroupData);

    expect(res1.statusCode).toBe(200);

    const rows1 = await db.allAsync(`SELECT * FROM group_entity`);
    expect(rows1.length).toBe(1);

    // Trying to add the same group to the same group within an organization should error
    const res2 = await request(app)
      .post("/group")
      .set("Cookie", cookie)
      .send(testGroupData);

    expect(res2.statusCode).toBe(409);
    expect(res2.body.error).toBe(
      "Constraint error: Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: group_entity.name, group_entity.organizer_id"
    );

    // DB should still have just one row
    const rows2 = await db.allAsync(`SELECT * FROM group_entity`);
    expect(rows2.length).toBe(1);

    //get group call should return 1 group
    const getGroupRes = await request(app).get("/group").set("Cookie", cookie);

    expect(JSON.parse(getGroupRes.text)).toEqual([
      {
        id: 1,
        name: "Dinner season one",
        description: "a dinner among friends",
        rules: "be cool",
        questions: [],
      },
    ]);
  });

  it("getting group returns empty list if none found", async () => {
    const cookie = CookieHelper.generateSignedCookie(
      Constants.orgSessionCookieName,
      { org_id: 1 },
      secretKey
    );

    const getGroupRes = await request(app).get("/group").set("Cookie", cookie);

    expect(getGroupRes.text).toBe("[]");
  });
});