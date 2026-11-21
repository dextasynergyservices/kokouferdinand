"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deletePressAction, upsertPressAction } from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { DataTable } from "@/components/admin/data-table";
import { LocalizedFieldTabs } from "@/components/admin/localized-field-tabs";
import { R2Dropzone } from "@/components/admin/r2-dropzone";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { pressItems } from "@/db/schema";
import { pickLocalized } from "@/lib/i18n-helpers";
import type { PressFormValues } from "@/lib/validations/admin";

type PressRow = typeof pressItems.$inferSelect;

const EMPTY_PRESS: PressFormValues = {
  slug: "",
  title: { fr: "", en: "", es: "" },
  publication: "",
  publishedDate: new Date().toISOString().slice(0, 10),
  externalUrl: "",
  pdfUrl: "",
  pdfR2Key: "",
  coverUrl: "",
  coverR2Key: "",
  excerpt: { fr: "", en: "", es: "" },
  body: { fr: "", en: "", es: "" },
  featured: false,
  status: "draft",
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PressManager({ initialPress }: { initialPress: PressRow[] }) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PressFormValues>(EMPTY_PRESS);

  function openNew() {
    setForm(EMPTY_PRESS);
    setOpen(true);
  }

  function openEdit(item: PressRow) {
    setForm({
      id: item.id,
      slug: item.slug ?? toSlug(item.title.fr),
      title: item.title,
      publication: item.publication,
      publishedDate: item.publishedDate.toISOString().slice(0, 10),
      externalUrl: item.externalUrl ?? "",
      pdfUrl: item.pdfUrl ?? "",
      pdfR2Key: item.pdfR2Key ?? "",
      coverUrl: item.coverUrl ?? "",
      coverR2Key: item.coverR2Key ?? "",
      excerpt: item.excerpt,
      body: item.body ?? { fr: "", en: "", es: "" },
      featured: item.featured,
      status: item.status,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await upsertPressAction(form);
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success(form.id ? t.press.updatedToast : t.press.createdToast);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(item: PressRow) {
    if (!window.confirm(`${t.press.confirmDelete} (${pickLocalized(item.title, locale)})`)) return;
    const res = await deletePressAction(item.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(t.press.deletedToast);
    router.refresh();
  }

  const columns: Array<LegacyColumnDef<PressRow, unknown>> = [
    {
      accessorFn: (row) => pickLocalized(row.title, locale),
      id: "title",
      header: t.works.colTitle,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{pickLocalized(row.original.title, locale)}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.publication}
            {row.original.slug ? ` · /${row.original.slug}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorFn: (row) => row.publishedDate.toISOString().slice(0, 10),
      id: "publishedDate",
      header: t.press.colDate,
    },
    {
      id: "links",
      header: t.press.colAttachment,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {row.original.externalUrl ? <Badge variant="outline">{t.press.linkBadge}</Badge> : null}
          {row.original.pdfUrl ? <Badge variant="secondary">PDF</Badge> : null}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t.common.status,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status === "published" ? t.common.published : t.common.draft}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <RowActionsMenu
          onEdit={() => openEdit(row.original)}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={initialPress}
        searchPlaceholder={t.press.search}
        statusFilterOptions={["published", "draft"]}
        getStatusValue={(row) => row.status}
        toolbarAction={
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t.press.newButton}
          </Button>
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{form.id ? t.press.editTitle : t.press.createTitle}</SheetTitle>
            <SheetDescription>{t.press.sheetDesc}</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-4 pb-8">
            <LocalizedFieldTabs
              label={t.press.articleTitle}
              required
              value={form.title}
              onChange={(title) =>
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: prev.id || prev.slug ? prev.slug : toSlug(title.fr),
                }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="press-slug">{t.common.slug} *</Label>
                <Input
                  id="press-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="press-pub">{t.press.publication} *</Label>
                <Input
                  id="press-pub"
                  required
                  value={form.publication}
                  onChange={(e) => setForm({ ...form, publication: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="press-date">{t.press.publishedDate} *</Label>
                <Input
                  id="press-date"
                  type="date"
                  required
                  value={form.publishedDate}
                  onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
                />
              </div>
            </div>

            <LocalizedFieldTabs
              label={t.press.excerpt}
              required
              multiline
              rows={3}
              value={form.excerpt}
              onChange={(excerpt) => setForm({ ...form, excerpt })}
            />

            <LocalizedFieldTabs
              label={t.press.articleBody}
              multiline
              rows={8}
              value={form.body ?? { fr: "", en: "", es: "" }}
              onChange={(body) => setForm({ ...form, body })}
            />

            <R2Dropzone
              category="image"
              label={t.press.coverLabel}
              currentUrl={form.coverUrl}
              onUploaded={(asset) =>
                setForm({ ...form, coverUrl: asset.publicUrl, coverR2Key: asset.r2Key })
              }
              onClear={() => setForm({ ...form, coverUrl: "", coverR2Key: "" })}
            />

            <div className="space-y-1.5">
              <Label htmlFor="press-url">{t.press.externalUrl}</Label>
              <Input
                id="press-url"
                type="url"
                placeholder="https://…"
                value={form.externalUrl ?? ""}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
              />
            </div>

            <R2Dropzone
              category="document"
              label={t.press.pdfLabel}
              currentUrl={form.pdfUrl}
              onUploaded={(asset) =>
                setForm({ ...form, pdfUrl: asset.publicUrl, pdfR2Key: asset.r2Key })
              }
              onClear={() => setForm({ ...form, pdfUrl: "", pdfR2Key: "" })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.common.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (val) setForm({ ...form, status: val as PressFormValues["status"] });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t.common.draft}</SelectItem>
                    <SelectItem value="published">{t.common.published}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  id="press-featured"
                  checked={form.featured}
                  onCheckedChange={(featured) => setForm({ ...form, featured })}
                />
                <Label htmlFor="press-featured">{t.press.featuredHome}</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.common.saving : form.id ? t.press.updateBtn : t.press.createBtn}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
