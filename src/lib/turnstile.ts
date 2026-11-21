export async function verifyTurnstileToken(token: string, ip?: string | null): Promise<boolean> {
  if (!token) return false;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return false;

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  });

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}
