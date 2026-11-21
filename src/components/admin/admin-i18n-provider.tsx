"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import type { AppLocale } from "@/i18n/routing";
import { type AdminDictionary, getAdminDictionary } from "@/lib/admin-i18n";

type AdminI18nContextValue = {
  locale: AppLocale;
  t: AdminDictionary;
  setLocale: (next: AppLocale) => void;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  function setLocale(next: AppLocale) {
    if (next === locale) return;
    setLocaleState(next);
    // biome-ignore lint/suspicious/noDocumentCookie: Lightweight non-sensitive UI locale preference cookie for admin.
    document.cookie = `admin_locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <AdminI18nContext.Provider
      value={{
        locale,
        t: getAdminDictionary(locale),
        setLocale,
      }}
    >
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n(): AdminI18nContextValue {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminI18n must be used inside AdminI18nProvider");
  }
  return ctx;
}

const LOCALES: AppLocale[] = ["fr", "en", "es"];

export function AdminLocaleSwitcher() {
  const { locale, setLocale } = useAdminI18n();

  return (
    <fieldset
      aria-label="Admin language"
      className="inline-flex items-center border border-ink-950/15 bg-board-50 p-0.5"
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={
              active
                ? "bg-ink-950 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-board-50 transition-colors"
                : "px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-600 transition-colors hover:text-oxide"
            }
          >
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
