/**
 * auth.local.ts
 * Local authentication system with bcrypt password hashing
 */

import { Router } from "express";
import crypto from "crypto";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

// Simple password hashing using built-in crypto (no bcrypt needed)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const colonIndex = stored.indexOf(":");
  if (colonIndex === -1) {
    console.log("[Auth] No colon found in stored password");
    return false;
  }
  const salt = stored.substring(0, colonIndex);
  const hash = stored.substring(colonIndex + 1);
  const hashVerify = crypto.scryptSync(password, salt, 64).toString("hex");
  console.log("[Auth] Verify - salt length:", salt.length, "hash match:", hash === hashVerify);
  return hash === hashVerify;
}

export function registerLocalAuthRoutes(app: Router | any) {
  // Register
  app.post("/api/auth/register", async (req: any, res: any) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    try {
      // Check if email exists
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const openId = `local_${crypto.randomBytes(16).toString("hex")}`;
      const hashedPassword = hashPassword(password);

      await db.insert(users).values({
        openId,
        name,
        email,
        password: hashedPassword,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      // Get the new user
      const newUser = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!newUser[0]) return res.status(500).json({ error: "Failed to create user" });

      try {
        const sessionToken = await sdk.createSessionToken(openId, {
          name,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        console.log("[LocalAuth] ✅ User registered and session created:", email);
      } catch (tokenError) {
        console.error("[LocalAuth] ❌ Session token failed:", tokenError);
      }

      return res.json({ success: true, user: { id: newUser[0].id, name, email } });
    } catch (error: any) {
      console.error("[LocalAuth] Register error:", error?.message ?? error);
      console.error("[LocalAuth] Stack:", error?.stack);
      return res.status(500).json({ error: "Registration failed", detail: error?.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    try {
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!userResult[0]) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = userResult[0];

      if (!user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Update last signed in
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      try {
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      } catch (tokenError) {
        console.warn("[LocalAuth] Session token creation failed:", tokenError);
      }

      return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error: any) {
      console.error("[LocalAuth] Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: any, res: any) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return res.json({ success: true });
  });
}
