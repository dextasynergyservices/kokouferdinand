"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { EnquiryForm, type EnquiryFormLabels } from "@/components/public/enquiry-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AppLocale } from "@/i18n/routing";

export function EnquiryDrawer({
  locale,
  artworkId,
  artworkTitle,
  triggerLabel,
  drawerTitle,
  regardingLabel,
  formLabels,
  turnstileSiteKey,
}: {
  locale: AppLocale;
  artworkId: string;
  artworkTitle: string;
  triggerLabel: string;
  drawerTitle: string;
  regardingLabel: string;
  formLabels: EnquiryFormLabels;
  turnstileSiteKey?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex w-full items-center justify-between border border-ink-950 bg-ink-950 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-board-50 transition-colors hover:border-oxide hover:bg-oxide"
      >
        <span>{triggerLabel}</span>
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto border-l border-ink-950/15 bg-board-100 sm:max-w-lg">
          <SheetHeader className="border-b border-ink-950/15 pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-oxide">
              Atelier / Galerie Sator
            </p>
            <SheetTitle className="font-serif text-3xl font-light text-ink-950">
              {drawerTitle}
            </SheetTitle>
            <SheetDescription className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-600">
              {regardingLabel}: {artworkTitle}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 px-4 pb-8">
            <EnquiryForm
              locale={locale}
              labels={formLabels}
              artworkId={artworkId}
              defaultSubject={`${drawerTitle} — ${artworkTitle}`}
              turnstileSiteKey={turnstileSiteKey}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
