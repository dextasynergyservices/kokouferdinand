import { cookies } from "next/headers";
import type { AppLocale } from "@/i18n/routing";

export const ADMIN_LOCALE_COOKIE = "admin_locale";

export async function getAdminLocale(): Promise<AppLocale> {
  const store = await cookies();
  const raw = store.get(ADMIN_LOCALE_COOKIE)?.value;
  if (raw === "fr" || raw === "en" || raw === "es") {
    return raw;
  }
  return "fr";
}
