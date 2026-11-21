"use client";

import { FileText, Film, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAdminI18n } from "@/components/admin/admin-i18n-provider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type UploadedAsset, uploadFileToR2 } from "@/lib/upload-client";
import { UPLOAD_RULES, type UploadCategory } from "@/lib/upload-rules";

const ACCEPT_MAP: Record<UploadCategory, string> = {
  image: "image/webp,image/avif,image/jpeg,image/png",
  video: "video/mp4,video/webm",
  model3d: ".glb,model/gltf-binary",
  document: "application/pdf",
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export function R2Dropzone({
  category,
  label,
  multiple = false,
  currentUrl,
  onUploaded,
  onClear,
}: {
  category: UploadCategory;
  label: string;
  multiple?: boolean;
  currentUrl?: string | null;
  onUploaded: (asset: UploadedAsset) => void;
  onClear?: () => void;
}) {
  const { t } = useAdminI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  const rule = UPLOAD_RULES[category];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const list = multiple ? Array.from(files) : [files[0]];
    setUploading(true);

    for (const file of list) {
      if (!file) continue;
      const controller = new AbortController();
      abortRef.current = controller;
      setActiveFileName(file.name);
      setProgress(0);

      try {
        const asset = await uploadFileToR2({
          file,
          category,
          signal: controller.signal,
          onProgress: (p) => setProgress(p.percent),
        });
        onUploaded(asset);
        toast.success(`${t.common.uploadSuccess}: ${file.name}`);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          toast.info(t.common.uploadCancelled);
          break;
        }
        const message = err instanceof Error ? err.message : t.common.uploadFailed;
        toast.error(`${t.common.uploadFailed}: ${message}`);
      }
    }

    abortRef.current = null;
    setUploading(false);
    setActiveFileName(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {t.common.maxSize} {formatBytes(rule.maxBytes)}
        </span>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[category]}
          multiple={multiple}
          disabled={uploading}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 truncate font-medium">
                <Loader2 className="size-3.5 animate-spin" />
                {t.common.uploading} {activeFileName}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{progress}%</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => abortRef.current?.abort()}
                >
                  {t.common.cancel}
                </Button>
              </div>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <UploadCloud className="size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {multiple ? t.common.uploadPromptMulti : t.common.uploadPromptSingle}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              {multiple ? t.common.chooseFiles : t.common.chooseFile}
            </Button>
          </div>
        )}
      </div>

      {currentUrl && !multiple ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2.5">
            {category === "image" ? (
              // biome-ignore lint/performance/noImgElement: Admin upload preview of dynamic R2 URL.
              <img
                src={currentUrl}
                alt="Uploaded preview"
                className="size-10 shrink-0 rounded object-cover"
              />
            ) : category === "video" ? (
              <Film className="size-5 shrink-0 text-muted-foreground" />
            ) : category === "document" ? (
              <FileText className="size-5 shrink-0 text-muted-foreground" />
            ) : (
              <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
            )}
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-foreground underline-offset-2 hover:underline"
            >
              {currentUrl}
            </a>
          </div>
          {onClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
