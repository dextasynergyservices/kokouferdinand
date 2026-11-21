"use client";

import { useAdminI18n } from "@/components/admin/admin-i18n-provider";

type SectionKey = "overview" | "pages" | "works" | "exhibitions" | "videos" | "press" | "enquiries";

export function AdminPageHeader({ section }: { section: SectionKey }) {
  const { t } = useAdminI18n();
  const copy = t[section];

  return (
    <div className="spec-rule pb-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">{copy.eyebrow}</p>
      <h1 className="debossed-heading mt-1 font-serif text-3xl font-light tracking-tight sm:text-4xl">
        {copy.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
    </div>
  );
}
