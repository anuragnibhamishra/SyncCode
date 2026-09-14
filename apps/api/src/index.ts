import { createServer } from "node:http";

const PORT = 3000;

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

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