"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { saveSitePageAction } from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { LocalizedFieldTabs } from "@/components/admin/localized-field-tabs";
import { R2Dropzone } from "@/components/admin/r2-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LocalizedText, sitePages } from "@/db/schema";

type SitePageRow = typeof sitePages.$inferSelect;
type PageKey = SitePageRow["key"];

const EMPTY_TEXT: LocalizedText = { fr: "", en: "", es: "" };

const PAGE_FIELDS: Record<
  PageKey,
  Array<{
    field:
      | "heroTitle"
      | "heroSubtitle"
      | "statement"
      | "headline"
      | "biography"
      | "representation"
      | "intro"
      | "studioLocation"
      | "galleryContact"
      | "artistName"
      | "footerNote";
    multiline?: boolean;
  }>
> = {
  home: [
    { field: "heroTitle" },
    { field: "heroSubtitle" },
    { field: "statement", multiline: true },
  ],
  about: [
    { field: "headline" },
    { field: "biography", multiline: true },
    { field: "representation", multiline: true },
  ],
  contact: [
    { field: "headline" },
    { field: "intro", multiline: true },
    { field: "studioLocation" },
    { field: "galleryContact" },
  ],
  global: [{ field: "artistName" }, { field: "footerNote" }],
};

export function PagesEditor({ initialPages }: { initialPages: SitePageRow[] }) {
  const router = useRouter();
  const { t } = useAdminI18n();
  const [savingKey, setSavingKey] = useState<PageKey | null>(null);

  const [state, setState] = useState<
    Record<PageKey, { content: Record<string, LocalizedText>; cvUrl: string; cvR2Key: string }>
  >(() => {
    const map = {} as Record<
      PageKey,
      { content: Record<string, LocalizedText>; cvUrl: string; cvR2Key: string }
    >;
    for (const key of ["home", "about", "contact", "global"] as PageKey[]) {
      const existing = initialPages.find((p) => p.key === key);
      map[key] = {
        content: existing?.content ?? {},
        cvUrl: existing?.cvUrl ?? "",
        cvR2Key: existing?.cvR2Key ?? "",
      };
    }
    return map;
  });

  function updateField(pageKey: PageKey, field: string, value: LocalizedText) {
    setState((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        content: {
          ...prev[pageKey].content,
          [field]: value,
        },
      },
    }));
  }

  async function handleSave(pageKey: PageKey) {
    setSavingKey(pageKey);
    const current = state[pageKey];
    const res = await saveSitePageAction({
      key: pageKey,
      content: current.content,
      cvUrl: current.cvUrl || null,
      cvR2Key: current.cvR2Key || null,
    });
    setSavingKey(null);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success(t.pages.savedToast);
    router.refresh();
  }

  return (
    <Tabs defaultValue="home" className="space-y-4">
      <TabsList>
        <TabsTrigger value="home">{t.pages.tabs.home}</TabsTrigger>
        <TabsTrigger value="about">{t.pages.tabs.about}</TabsTrigger>
        <TabsTrigger value="contact">{t.pages.tabs.contact}</TabsTrigger>
        <TabsTrigger value="global">{t.pages.tabs.global}</TabsTrigger>
      </TabsList>

      {(["home", "about", "contact", "global"] as PageKey[]).map((key) => (
        <TabsContent key={key} value={key}>
          <Card>
            <CardHeader>
              <CardTitle>
                {t.pages.tabs[key]} {t.pages.cardTitleSuffix}
              </CardTitle>
              <CardDescription>{t.pages.cardDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {PAGE_FIELDS[key].map(({ field, multiline }) => (
                <LocalizedFieldTabs
                  key={field}
                  label={t.pages.fields[field]}
                  multiline={multiline}
                  value={state[key].content[field] ?? EMPTY_TEXT}
                  onChange={(next) => updateField(key, field, next)}
                />
              ))}

              {key === "about" ? (
                <R2Dropzone
                  category="document"
                  label={t.pages.cvLabel}
                  currentUrl={state.about.cvUrl}
                  onUploaded={(asset) =>
                    setState((prev) => ({
                      ...prev,
                      about: {
                        ...prev.about,
                        cvUrl: asset.publicUrl,
                        cvR2Key: asset.r2Key,
                      },
                    }))
                  }
                  onClear={() =>
                    setState((prev) => ({
                      ...prev,
                      about: { ...prev.about, cvUrl: "", cvR2Key: "" },
                    }))
                  }
                />
              ) : null}

              <div className="flex justify-end">
                <Button onClick={() => handleSave(key)} disabled={savingKey === key}>
                  {savingKey === key ? t.common.saving : t.pages.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
