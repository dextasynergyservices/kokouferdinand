"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { publicEnquirySchema } from "@/lib/validations/admin";

type EnquiryResult = { ok: true } | { ok: false; error: string };

export async function submitPublicEnquiryAction(input: unknown): Promise<EnquiryResult> {
  const parsed = publicEnquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid enquiry details" };
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const hdrs = await headers();
    const ip =
      hdrs.get("cf-connecting-ip") ?? hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const verified = await verifyTurnstileToken(parsed.data.turnstileToken ?? "", ip);
    if (!verified) {
      return { ok: false, error: "Security verification failed. Please retry." };
    }
  }

  await db.insert(enquiries).values({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    subject: parsed.data.subject,
    message: parsed.data.message,
    artworkId: parsed.data.artworkId ?? null,
    locale: parsed.data.locale,
    status: "unread",
  });

  return { ok: true };
}
