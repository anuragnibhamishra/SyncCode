import { createServer, type IncomingMessage } from "node:http";
import { db, users, workspaceMembers, workspaces } from "@repo/db";
import { eq , and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  createAuthCookie,
  createAuthToken,
  getAuthTokenFromCookie,
  verifyAuthToken,
  createLogoutCookie,
  getAuthenticatedUserId

} from "./auth.js";


async function parseBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString("utf-8");

  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Invalid JSON");
  }
}

const PORT = 3000;

const server = createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST" && req.url === "/auth/register") {
    try {
      const body = await parseBody(req);

      const schema = z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      });

      const result = schema.safeParse(body);

      if (!result.success) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Invalid input",
            details: result.error.flatten(),
          }),
        );
        return;
      }

      const { name, email, password } = result.data;

      const normalizedEmail = email.toLowerCase();

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existingUser) {
        res.writeHead(409);
        res.end(
          JSON.stringify({
            error: "User already exists",
          }),
        );
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [user] = await db
        .insert(users)
        .values({
          name,
          email: normalizedEmail,
          passwordHash,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      const token = createAuthToken(user.id);

      res.setHeader("Set-Cookie", createAuthCookie(token));
      res.writeHead(201);

      res.end(
        JSON.stringify({
          user,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Registration failed",
        }),
      );
    }

    return;
  }


  if (req.method === "POST" && req.url === "/auth/login") {
    try {
      const body = await parseBody(req);

      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });

      const result = schema.safeParse(body);

      if (!result.success) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Invalid input",
          }),
        );
        return;
      }

      const { email, password } = result.data;

      const normalizedEmail = email.toLowerCase();

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (!user) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Invalid email or password",
          }),
        );
        return;
      }

      const passwordValid = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (!passwordValid) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Invalid email or password",
          }),
        );
        return;
      }

      const token = createAuthToken(user.id);

      res.setHeader("Set-Cookie", createAuthCookie(token));
      res.writeHead(200);

      res.end(
        JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Login failed",
        }),
      );
    }

    return;
  }

  if (req.method === "GET" && req.url === "/auth/me") {
    try {
      const token = getAuthTokenFromCookie(req.headers.cookie);

      if (!token) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Not authenticated",
          }),
        );
        return;
      }

      const payload = verifyAuthToken(token);

      if (!payload) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Invalid or expired session",
          }),
        );
        return;
      }

      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "User not found",
          }),
        );
        return;
      }

      res.writeHead(200);
      res.end(
        JSON.stringify({
          user,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Authentication check failed",
        }),
      );
    }

    return;
  }

  if (req.method === "POST" && req.url === "/auth/logout") {
    res.setHeader("Set-Cookie", createLogoutCookie());
    res.writeHead(200);

    res.end(
      JSON.stringify({
        message: "Logged out successfully",
      }),
    );

    return;
  }

  if (req.method === "GET" && req.url === "/workspaces") {
    try {
      const userId = await getAuthenticatedUserId(req.headers.cookie);

      if (!userId) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Not authenticated",
          }),
        );
        return;
      }

      const result = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .innerJoin(
          workspaces,
          eq(workspaceMembers.workspaceId, workspaces.id),
        )
        .where(eq(workspaceMembers.userId, userId));

      res.writeHead(200);
      res.end(
        JSON.stringify({
          workspaces: result,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Failed to fetch workspaces",
        }),
      );
    }

    return;
  }

  if (req.method === "POST" && req.url === "/workspaces") {
    try {
      const userId = await getAuthenticatedUserId(req.headers.cookie);

      if (!userId) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Not authenticated",
          }),
        );
        return;
      }

      const body = await parseBody(req);

      const schema = z.object({
        name: z.string().min(1).max(100),
      });

      const result = schema.safeParse(body);

      if (!result.success) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Invalid input",
            details: result.error.flatten(),
          }),
        );
        return;
      }

      const { name } = result.data;

      const [workspace] = await db
        .insert(workspaces)
        .values({
          name,
          ownerId: userId,
        })
        .returning({
          id: workspaces.id,
          name: workspaces.name,
          ownerId: workspaces.ownerId,
        });

      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: "OWNER",
      });

      res.writeHead(201);
      res.end(
        JSON.stringify({
          workspace,
          role: "OWNER",
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Failed to create workspace",
        }),
      );
    }

    return;
  }

  if (
    req.method === "GET" &&
    req.url?.startsWith("/workspaces/")
  ) {
    try {
      const userId = await getAuthenticatedUserId(req.headers.cookie);

      if (!userId) {
        res.writeHead(401);
        res.end(
          JSON.stringify({
            error: "Not authenticated",
          }),
        );
        return;
      }

      const workspaceId = req.url.split("/")[2];

      const idResult = z.string().uuid().safeParse(workspaceId);

      if (!idResult.success) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Invalid workspace ID",
          }),
        );
        return;
      }

      const [workspace] = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          ownerId: workspaces.ownerId,
          role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .innerJoin(
          workspaces,
          eq(workspaceMembers.workspaceId, workspaces.id),
        )
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId),
          ),
        )
        .limit(1);

      if (!workspace) {
        res.writeHead(404);
        res.end(
          JSON.stringify({
            error: "Workspace not found",
          }),
        );
        return;
      }

      res.writeHead(200);
      res.end(
        JSON.stringify({
          workspace,
        }),
      );
    } catch (error) {
      console.error(error);

      res.writeHead(500);
      res.end(
        JSON.stringify({
          error: "Failed to fetch workspace",
        }),
      );
    }

    return;
  }

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