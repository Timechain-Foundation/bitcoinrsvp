import request from "supertest";
import app from "../../app";
import CookieHelper, { Constants } from "../../cookie-helper";

const secretKey = process.env.COOKIE_SECRET_KEY || "test-secret";

describe("POST /:group_id/event", () => {
  it("should create an event", async () => {

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
    const res0 = await request(app)
      .post("/group")
      .set("Cookie", cookie)
      .send(testGroupData);


    const testEventData = {
      name: "Event #1",
      description: "This is the first event",
      location: "Naomi's Garden",
      date: "2025-04-30T04:03:38.883Z",
      price_in_cents: 0,
      max_quantity: 100,
    };

    const res1 = await request(app)
      .post("/1/event")
      .set("Cookie", cookie)
      .send(testEventData);

    expect(res1.statusCode).toBe(200);
  });
});
