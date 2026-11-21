import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { count } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/auth-schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Invite/seed-only admin accounts
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "admin", input: false },
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  plugins: [nextCookies()],
});

export async function hasAnyAdmin(): Promise<boolean> {
  const [row] = await db.select({ total: count() }).from(user);
  return (row?.total ?? 0) > 0;
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
