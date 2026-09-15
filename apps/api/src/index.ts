import { createServer } from "node:http";
import { db, users } from "@repo/db";

const PORT = 3000;

const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Health check
  if (req.url === "/health") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: "ok",
        service: "sync-code-api",
      }),
    );
    return;
  }

  // Get users from database
  if (req.url === "/users") {
    try {
      const result = await db.select().from(users);

      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Database query failed",
        }),
      );
    }

    return;
  }

  // Not found
  res.writeHead(404);
  res.end(
    JSON.stringify({
      error: "Not Found",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});