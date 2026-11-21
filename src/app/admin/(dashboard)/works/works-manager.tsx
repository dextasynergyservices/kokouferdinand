"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteArtworkAction, upsertArtworkAction } from "@/app/admin/actions";
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
import type { artworkMedia, artworks } from "@/db/schema";
import { pickLocalized } from "@/lib/i18n-helpers";
import type { ArtworkFormValues } from "@/lib/validations/admin";

type ArtworkWithMedia = typeof artworks.$inferSelect & {
  media: Array<typeof artworkMedia.$inferSelect>;
};

const EMPTY_WORK: ArtworkFormValues = {
  slug: "",
  title: { fr: "", en: "", es: "" },
  series: "",
  year: new Date().getFullYear(),
  medium: { fr: "", en: "", es: "" },
  dimensions: "",
  description: { fr: "", en: "", es: "" },
  provenance: { fr: "", en: "", es: "" },
  availability: "on_request",
  model3dUrl: "",
  model3dR2Key: "",
  featured: false,
  sortOrder: 0,
  status: "draft",
  media: [],
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function WorksManager({ initialWorks }: { initialWorks: ArtworkWithMedia[] }) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ArtworkFormValues>(EMPTY_WORK);

  function openNew() {
    setForm({ ...EMPTY_WORK, sortOrder: initialWorks.length + 1 });
    setOpen(true);
  }

  function openEdit(work: ArtworkWithMedia) {
    setForm({
      id: work.id,
      slug: work.slug,
      title: work.title,
      series: work.series ?? "",
      year: work.year,
      medium: work.medium,
      dimensions: work.dimensions,
      description: work.description,
      provenance: work.provenance ?? { fr: "", en: "", es: "" },
      availability: work.availability,
      model3dUrl: work.model3dUrl ?? "",
      model3dR2Key: work.model3dR2Key ?? "",
      featured: work.featured,
      sortOrder: work.sortOrder,
      status: work.status,
      media: work.media.map((m) => ({
        id: m.id,
        url: m.url,
        r2Key: m.r2Key,
        alt: m.alt,
        width: m.width,
        height: m.height,
        blurDataUrl: m.blurDataUrl,
        isPrimary: m.isPrimary,
        sortOrder: m.sortOrder,
      })),
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await upsertArtworkAction(form);
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success(form.id ? t.works.updatedToast : t.works.createdToast);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(work: ArtworkWithMedia) {
    if (!window.confirm(`${t.works.confirmDelete} (${pickLocalized(work.title, locale)})`)) return;
    const res = await deleteArtworkAction(work.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(t.works.deletedToast);
    router.refresh();
  }

  function moveMedia(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.media.length) return;
    const next = [...form.media];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    setForm({
      ...form,
      media: next.map((m, idx) => ({ ...m, sortOrder: idx })),
    });
  }

  function setPrimaryMedia(index: number) {
    setForm({
      ...form,
      media: form.media.map((m, idx) => ({ ...m, isPrimary: idx === index })),
    });
  }

  const columns: Array<LegacyColumnDef<ArtworkWithMedia, unknown>> = [
    {
      accessorFn: (row) => pickLocalized(row.title, locale),
      id: "title",
      header: t.works.colTitle,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{pickLocalized(row.original.title, locale)}</p>
          <p className="font-mono text-xs text-muted-foreground">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "series",
      header: t.works.series,
      cell: ({ row }) => row.original.series || "—",
    },
    {
      accessorKey: "year",
      header: t.common.year,
    },
    {
      id: "assets",
      header: t.works.colMedia,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">{row.original.media.length} img</Badge>
          {row.original.model3dUrl ? <Badge variant="secondary">3D .glb</Badge> : null}
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
        data={initialWorks}
        searchPlaceholder={t.works.search}
        statusFilterOptions={["published", "draft"]}
        getStatusValue={(row) => row.status}
        toolbarAction={
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t.works.newButton}
          </Button>
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{form.id ? t.works.editTitle : t.works.createTitle}</SheetTitle>
            <SheetDescription>{t.works.sheetDesc}</SheetDescription>
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
                <Label htmlFor="work-slug">{t.common.slug} *</Label>
                <Input
                  id="work-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-series">{t.works.series}</Label>
                <Input
                  id="work-series"
                  value={form.series ?? ""}
                  onChange={(e) => setForm({ ...form, series: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="work-year">{t.common.year} *</Label>
                <Input
                  id="work-year"
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-dims">{t.works.dimensions} *</Label>
                <Input
                  id="work-dims"
                  required
                  placeholder="185 × 62 × 48 cm"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-order">{t.common.sortOrder}</Label>
                <Input
                  id="work-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <LocalizedFieldTabs
              label={t.works.medium}
              required
              value={form.medium}
              onChange={(medium) => setForm({ ...form, medium })}
            />

            <LocalizedFieldTabs
              label={t.works.description}
              required
              multiline
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
            />

            <LocalizedFieldTabs
              label={t.works.provenance}
              value={form.provenance ?? { fr: "", en: "", es: "" }}
              onChange={(provenance) => setForm({ ...form, provenance })}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>{t.works.availability}</Label>
                <Select
                  value={form.availability}
                  onValueChange={(val) => {
                    if (val)
                      setForm({ ...form, availability: val as ArtworkFormValues["availability"] });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      {t.works.availabilityOptions.available}
                    </SelectItem>
                    <SelectItem value="on_request">
                      {t.works.availabilityOptions.on_request}
                    </SelectItem>
                    <SelectItem value="private_collection">
                      {t.works.availabilityOptions.private_collection}
                    </SelectItem>
                    <SelectItem value="sold">{t.works.availabilityOptions.sold}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{t.common.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (val) setForm({ ...form, status: val as ArtworkFormValues["status"] });
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
                  id="work-featured"
                  checked={form.featured}
                  onCheckedChange={(featured) => setForm({ ...form, featured })}
                />
                <Label htmlFor="work-featured">{t.common.featured}</Label>
              </div>
            </div>

            <R2Dropzone
              category="image"
              label={t.works.imagesLabel}
              multiple
              onUploaded={(asset) =>
                setForm((prev) => ({
                  ...prev,
                  media: [
                    ...prev.media,
                    {
                      url: asset.publicUrl,
                      r2Key: asset.r2Key,
                      alt: { fr: prev.title.fr, en: prev.title.en, es: prev.title.es },
                      width: asset.width ?? 1600,
                      height: asset.height ?? 1200,
                      isPrimary: prev.media.length === 0,
                      sortOrder: prev.media.length,
                    },
                  ],
                }))
              }
            />

            {form.media.length > 0 ? (
              <div className="space-y-2">
                {form.media.map((item, idx) => (
                  <div
                    key={item.r2Key}
                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {/* biome-ignore lint/performance/noImgElement: Admin thumbnail preview. */}
                      <img
                        src={item.url}
                        alt=""
                        className="size-12 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{item.r2Key}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {item.width}×{item.height}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={item.isPrimary ? "default" : "ghost"}
                        onClick={() => setPrimaryMedia(idx)}
                        title={t.works.setPrimary}
                      >
                        <Star className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={idx === 0}
                        onClick={() => moveMedia(idx, -1)}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={idx === form.media.length - 1}
                        onClick={() => moveMedia(idx, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            media: prev.media.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <R2Dropzone
              category="model3d"
              label={t.works.model3dLabel}
              currentUrl={form.model3dUrl}
              onUploaded={(asset) =>
                setForm({ ...form, model3dUrl: asset.publicUrl, model3dR2Key: asset.r2Key })
              }
              onClear={() => setForm({ ...form, model3dUrl: "", model3dR2Key: "" })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.common.saving : form.id ? t.works.updateBtn : t.works.createBtn}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
