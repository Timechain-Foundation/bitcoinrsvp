import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { parseExpressCookie } from "./utils";

const app = new Elysia()
  .use(swagger())
  .derive(parseExpressCookie)
  .get("/cookie", ({ cookie, orgSession }) => {
    return orgSession ?? "no session";
  })
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
