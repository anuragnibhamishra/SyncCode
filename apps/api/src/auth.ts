import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({
  path: "../../.env",
});

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_SECRET_VALUE: string = (() => {
  if (typeof JWT_SECRET !== "string" || JWT_SECRET.length === 0) {
    throw new Error("JWT_SECRET is not defined");
  }

  return JWT_SECRET;
})();

const COOKIE_NAME = "auth_token";

export function createAuthToken(userId: string) {
  return jwt.sign(
    {
      sub: userId,
    },
    JWT_SECRET_VALUE,
    {
      expiresIn: "7d",
    },
  );
}

export function verifyAuthToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET_VALUE);

    if (typeof payload === "string" || !payload.sub) {
      return null;
    }

    return {
      userId: payload.sub,
    };
  } catch {
    return null;
  }
}

export function createAuthCookie(token: string) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`;
}

export function createLogoutCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getAuthTokenFromCookie(cookieHeader?: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === COOKIE_NAME) {
      return valueParts.join("=") || null;
    }
  }

  return null;
}

export async function getAuthenticatedUserId(
  cookieHeader: string | undefined,
) {
  const token = getAuthTokenFromCookie(cookieHeader);

  if (!token) {
    return null;
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return null;
  }

  return payload.userId;
}