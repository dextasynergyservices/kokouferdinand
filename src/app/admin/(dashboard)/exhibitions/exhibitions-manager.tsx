"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExhibitionAction, upsertExhibitionAction } from "@/app/admin/actions";
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
import type { exhibitions } from "@/db/schema";
import { pickLocalized } from "@/lib/i18n-helpers";
import type { ExhibitionFormValues } from "@/lib/validations/admin";

type ExhibitionRow = typeof exhibitions.$inferSelect;

const EMPTY_EXHIBITION: ExhibitionFormValues = {
  slug: "",
  type: "solo",
  title: { fr: "", en: "", es: "" },
  venue: "",
  city: "",
  country: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  curatorialText: { fr: "", en: "", es: "" },
  coverUrl: "",
  coverR2Key: "",
  galleryImages: [],
  isCurrent: false,
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

export function ExhibitionsManager({
  initialExhibitions,
}: {
  initialExhibitions: ExhibitionRow[];
}) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExhibitionFormValues>(EMPTY_EXHIBITION);

  function openNew() {
    setForm(EMPTY_EXHIBITION);
    setOpen(true);
  }

  function openEdit(item: ExhibitionRow) {
    setForm({
      id: item.id,
      slug: item.slug,
      type: item.type,
      title: item.title,
      venue: item.venue,
      city: item.city,
      country: item.country,
      startDate: item.startDate.toISOString().slice(0, 10),
      endDate: item.endDate ? item.endDate.toISOString().slice(0, 10) : "",
      curatorialText: item.curatorialText,
      coverUrl: item.coverUrl ?? "",
      coverR2Key: item.coverR2Key ?? "",
      galleryImages: item.galleryImages ?? [],
      isCurrent: item.isCurrent,
      status: item.status,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await upsertExhibitionAction(form);
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success(form.id ? t.exhibitions.updatedToast : t.exhibitions.createdToast);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(item: ExhibitionRow) {
    if (!window.confirm(`${t.exhibitions.confirmDelete} (${pickLocalized(item.title, locale)})`)) {
      return;
    }
    const res = await deleteExhibitionAction(item.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(t.exhibitions.deletedToast);
    router.refresh();
  }

  const columns: Array<LegacyColumnDef<ExhibitionRow, unknown>> = [
    {
      accessorFn: (row) => pickLocalized(row.title, locale),
      id: "title",
      header: t.works.colTitle,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            <p className="font-medium">{pickLocalized(row.original.title, locale)}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.venue}, {row.original.city}
            </p>
          </div>
          {row.original.isCurrent ? <Badge>{t.exhibitions.currentBadge}</Badge> : null}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: t.exhibitions.type,
      cell: ({ row }) => t.exhibitions.types[row.original.type],
    },
    {
      accessorFn: (row) => row.startDate.toISOString().slice(0, 10),
      id: "startDate",
      header: t.exhibitions.colStart,
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
        data={initialExhibitions}
        searchPlaceholder={t.exhibitions.search}
        statusFilterOptions={["published", "draft"]}
        getStatusValue={(row) => row.status}
        toolbarAction={
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t.exhibitions.newButton}
          </Button>
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{form.id ? t.exhibitions.editTitle : t.exhibitions.createTitle}</SheetTitle>
            <SheetDescription>{t.exhibitions.sheetDesc}</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-4 pb-8">
            <LocalizedFieldTabs
              label={t.works.titleField}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ex-slug">{t.common.slug} *</Label>
                <Input
                  id="ex-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t.exhibitions.type}</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => {
                    if (val) setForm({ ...form, type: val as ExhibitionFormValues["type"] });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">{t.exhibitions.types.solo}</SelectItem>
                    <SelectItem value="group">{t.exhibitions.types.group}</SelectItem>
                    <SelectItem value="biennale">{t.exhibitions.types.biennale}</SelectItem>
                    <SelectItem value="fair">{t.exhibitions.types.fair}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="ex-venue">{t.exhibitions.venue} *</Label>
                <Input
                  id="ex-venue"
                  required
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-city">{t.exhibitions.city} *</Label>
                <Input
                  id="ex-city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-country">{t.exhibitions.country} *</Label>
                <Input
                  id="ex-country"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ex-start">{t.exhibitions.startDate} *</Label>
                <Input
                  id="ex-start"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-end">{t.exhibitions.endDate}</Label>
                <Input
                  id="ex-end"
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <LocalizedFieldTabs
              label={t.exhibitions.curatorialText}
              required
              multiline
              value={form.curatorialText}
              onChange={(curatorialText) => setForm({ ...form, curatorialText })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.common.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (val) setForm({ ...form, status: val as ExhibitionFormValues["status"] });
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
                  id="ex-current"
                  checked={form.isCurrent}
                  onCheckedChange={(isCurrent) => setForm({ ...form, isCurrent })}
                />
                <Label htmlFor="ex-current">{t.exhibitions.isCurrent}</Label>
              </div>
            </div>

            <R2Dropzone
              category="image"
              label={t.exhibitions.coverLabel}
              currentUrl={form.coverUrl}
              onUploaded={(asset) =>
                setForm({ ...form, coverUrl: asset.publicUrl, coverR2Key: asset.r2Key })
              }
              onClear={() => setForm({ ...form, coverUrl: "", coverR2Key: "" })}
            />

            <R2Dropzone
              category="image"
              label={t.exhibitions.galleryLabel}
              multiple
              onUploaded={(asset) =>
                setForm((prev) => ({
                  ...prev,
                  galleryImages: [
                    ...prev.galleryImages,
                    { url: asset.publicUrl, r2Key: asset.r2Key },
                  ],
                }))
              }
            />

            {form.galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {form.galleryImages.map((img, idx) => (
                  <div key={img.r2Key} className="relative overflow-hidden rounded-md border">
                    {/* biome-ignore lint/performance/noImgElement: Admin gallery preview. */}
                    <img src={img.url} alt="" className="h-24 w-full object-cover" />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? t.common.saving
                  : form.id
                    ? t.exhibitions.updateBtn
                    : t.exhibitions.createBtn}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
