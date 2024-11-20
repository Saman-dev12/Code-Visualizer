import { Hono } from "hono";
import { handle } from "hono/vercel";
import { exec } from "child_process";
import fs from "fs";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
  return c.html(`<h1>Hello!</h1>`, 200);
});

app.post("/execute-java", async (c) => {
  const body = await c.req.json();
  const javaCode = body;
  console.log("Java code", javaCode);
  if (!javaCode) {
    return c.json("No Java code provided", 404);
  }
  const classNameRegex = /public\s+class\s+(\w+)/;
  const match = javaCode.match(classNameRegex);
  if (!match || match.length < 2) {
    return c.json(
      "Could not find public class name in the provided Java code",
      400
    );
  }
  const className = match[1];

  fs.writeFileSync(`${className}.java`, javaCode);

  exec(`javac ${className}.java`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return c.json("Error compiling Java code", 500);
    }

    exec(`java ${className}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return c.json("Error executing Java code", 500);
      }

      return c.json(stdout, 200);
    });
  });
});

export const GET = handle(app);
export const POST = handle(app);
