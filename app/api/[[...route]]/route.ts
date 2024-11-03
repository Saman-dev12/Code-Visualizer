import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
  return c.html(`<h1>Hello!</h1>`, 200);
});

export const GET = handle(app);
export const POST = handle(app);
