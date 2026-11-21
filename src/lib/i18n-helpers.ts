import type { LocalizedText } from "@/db/schema";
import type { AppLocale } from "@/i18n/routing";

export function pickLocalized(value: LocalizedText | null | undefined, locale: AppLocale): string {
  if (!value) return "";
  return value[locale]?.trim() || value.fr?.trim() || value.en?.trim() || value.es?.trim() || "";
}
