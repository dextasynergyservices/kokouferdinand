"use client";

import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteVideoAction, upsertVideoAction } from "@/app/admin/actions";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { DataTable } from "@/components/admin/data-table";
import { LocalizedFieldTabs } from "@/components/admin/localized-field-tabs";
import { R2Dropzone } from "@/components/admin/r2-dropzone";
import { RowActionsMenu } from "@/components/admin/row-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import type { videos } from "@/db/schema";
import { pickLocalized } from "@/lib/i18n-helpers";
import type { VideoFormValues } from "@/lib/validations/admin";
import { parseExternalVideoUrl } from "@/lib/video-utils";

type VideoRow = typeof videos.$inferSelect;

const EMPTY_VIDEO: VideoFormValues = {
  slug: "",
  title: { fr: "", en: "", es: "" },
  description: { fr: "", en: "", es: "" },
  sourceType: "external_link",
  externalUrl: "",
  videoUrl: "",
  videoR2Key: "",
  posterUrl: "",
  posterR2Key: "",
  duration: "",
  year: new Date().getFullYear(),
  featured: false,
  sortOrder: 0,
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

export function VideosManager({ initialVideos }: { initialVideos: VideoRow[] }) {
  const router = useRouter();
  const { locale, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VideoFormValues>(EMPTY_VIDEO);

  const parsedEmbed =
    form.sourceType === "external_link" && form.externalUrl
      ? parseExternalVideoUrl(form.externalUrl)
      : null;

  function openNew() {
    setForm({ ...EMPTY_VIDEO, sortOrder: initialVideos.length + 1 });
    setOpen(true);
  }

  function openEdit(item: VideoRow) {
    setForm({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      sourceType: item.sourceType,
      externalUrl: item.externalUrl ?? "",
      videoUrl: item.videoUrl ?? "",
      videoR2Key: item.videoR2Key ?? "",
      posterUrl: item.posterUrl ?? "",
      posterR2Key: item.posterR2Key ?? "",
      duration: item.duration ?? "",
      year: item.year,
      featured: item.featured,
      sortOrder: item.sortOrder,
      status: item.status,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await upsertVideoAction(form);
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    toast.success(form.id ? t.videos.updatedToast : t.videos.createdToast);
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(item: VideoRow) {
    if (!window.confirm(`${t.videos.confirmDelete} (${pickLocalized(item.title, locale)})`)) return;
    const res = await deleteVideoAction(item.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(t.videos.deletedToast);
    router.refresh();
  }

  const columns: Array<LegacyColumnDef<VideoRow, unknown>> = [
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
      accessorKey: "sourceType",
      header: t.videos.colSource,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.sourceType === "r2_upload" ? t.videos.r2Badge : t.videos.externalBadge}
        </Badge>
      ),
    },
    {
      accessorKey: "year",
      header: t.common.year,
    },
    {
      accessorKey: "duration",
      header: t.videos.duration,
      cell: ({ row }) => row.original.duration || "—",
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
        data={initialVideos}
        searchPlaceholder={t.videos.search}
        statusFilterOptions={["published", "draft"]}
        getStatusValue={(row) => row.status}
        toolbarAction={
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            {t.videos.newButton}
          </Button>
        }
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{form.id ? t.videos.editTitle : t.videos.createTitle}</SheetTitle>
            <SheetDescription>{t.videos.sheetDesc}</SheetDescription>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="vid-slug">{t.common.slug} *</Label>
                <Input
                  id="vid-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vid-year">{t.common.year} *</Label>
                <Input
                  id="vid-year"
                  type="number"
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vid-duration">{t.videos.duration}</Label>
                <Input
                  id="vid-duration"
                  placeholder="04:32"
                  value={form.duration ?? ""}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.videos.sourceMode}</Label>
              <RadioGroup
                value={form.sourceType}
                onValueChange={(val) => {
                  const next = String(val);
                  if (next === "external_link" || next === "r2_upload") {
                    setForm({ ...form, sourceType: next });
                  }
                }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <Label
                  htmlFor="vid-src-external"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm font-normal"
                >
                  <RadioGroupItem id="vid-src-external" value="external_link" />
                  <span>{t.videos.externalOption}</span>
                </Label>
                <Label
                  htmlFor="vid-src-r2"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm font-normal"
                >
                  <RadioGroupItem id="vid-src-r2" value="r2_upload" />
                  <span>{t.videos.r2Option}</span>
                </Label>
              </RadioGroup>
            </div>

            {form.sourceType === "external_link" ? (
              <div className="space-y-2">
                <Label htmlFor="vid-external">{t.videos.externalUrlLabel} *</Label>
                <Input
                  id="vid-external"
                  type="url"
                  placeholder="https://vimeo.com/... or https://youtu.be/..."
                  value={form.externalUrl ?? ""}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                />
                {form.externalUrl && !parsedEmbed ? (
                  <p className="text-xs text-destructive">{t.videos.invalidExternalUrl}</p>
                ) : null}
                {parsedEmbed ? (
                  <div className="aspect-video overflow-hidden rounded-lg border border-border">
                    <iframe
                      src={parsedEmbed.embedUrl}
                      title="Video preview"
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <R2Dropzone
                  category="video"
                  label={t.videos.uploadVideoLabel}
                  currentUrl={form.videoUrl}
                  onUploaded={(asset) =>
                    setForm({ ...form, videoUrl: asset.publicUrl, videoR2Key: asset.r2Key })
                  }
                  onClear={() => setForm({ ...form, videoUrl: "", videoR2Key: "" })}
                />
                {form.videoUrl ? (
                  <video
                    src={form.videoUrl}
                    poster={form.posterUrl || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full rounded-lg border border-border bg-black"
                  >
                    <track kind="captions" />
                  </video>
                ) : null}
              </div>
            )}

            <R2Dropzone
              category="image"
              label={t.videos.posterLabel}
              currentUrl={form.posterUrl}
              onUploaded={(asset) =>
                setForm({ ...form, posterUrl: asset.publicUrl, posterR2Key: asset.r2Key })
              }
              onClear={() => setForm({ ...form, posterUrl: "", posterR2Key: "" })}
            />

            <LocalizedFieldTabs
              label={t.videos.descriptionLabel}
              required
              multiline
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>{t.common.status}</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => {
                    if (val) setForm({ ...form, status: val as VideoFormValues["status"] });
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
              <div className="space-y-1.5">
                <Label htmlFor="vid-order">{t.common.sortOrder}</Label>
                <Input
                  id="vid-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch
                  id="vid-featured"
                  checked={form.featured}
                  onCheckedChange={(featured) => setForm({ ...form, featured })}
                />
                <Label htmlFor="vid-featured">{t.common.featured}</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t.common.saving : form.id ? t.videos.updateBtn : t.videos.createBtn}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
