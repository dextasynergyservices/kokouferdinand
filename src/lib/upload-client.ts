"use client";

import { detectImageMimeFromBytes, extensionForImageMime } from "./image-utils";
import { UPLOAD_RULES, type UploadCategory } from "./upload-rules";

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadedAsset = {
  publicUrl: string;
  r2Key: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
};

export async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(objectUrl);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("FAILED_TO_READ_IMAGE_DIMENSIONS"));
    };
    img.src = objectUrl;
  });
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

/**
 * Validates file type/size (including magic-byte verification for images),
 * requests a presigned R2 PUT URL from /api/admin/upload, and uploads
 * directly to R2 with real-time progress reporting and AbortSignal support.
 */
export async function uploadFileToR2({
  file,
  category,
  onProgress,
  signal,
}: {
  file: File;
  category: UploadCategory;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}): Promise<UploadedAsset> {
  const rule = UPLOAD_RULES[category];

  if (file.size <= 0 || file.size > rule.maxBytes) {
    throw new Error("FILE_TOO_LARGE");
  }

  let contentType = file.type;
  let extension = getFileExtension(file.name);

  if (category === "image") {
    const headerSlice = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detectedMime = detectImageMimeFromBytes(headerSlice);
    if (!detectedMime) {
      throw new Error("INVALID_IMAGE_SIGNATURE");
    }
    contentType = detectedMime;
    extension = extensionForImageMime(detectedMime);
  } else {
    if (!contentType && category === "model3d" && extension === "glb") {
      contentType = "model/gltf-binary";
    }
    if (!rule.mimeTypes.includes(contentType as never)) {
      throw new Error("UNSUPPORTED_MIME_TYPE");
    }
    if (!rule.extensions.includes(extension as never)) {
      throw new Error("INVALID_EXTENSION");
    }
  }

  const presignRes = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category,
      contentType,
      contentLength: file.size,
      extension,
    }),
    signal,
  });

  if (!presignRes.ok) {
    const errBody = (await presignRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error ?? "PRESIGN_REQUEST_FAILED");
  }

  const { uploadUrl, publicUrl, r2Key } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    r2Key: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const handleAbort = () => {
      xhr.abort();
      reject(new DOMException("Upload aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        handleAbort();
        return;
      }
      signal.addEventListener("abort", handleAbort, { once: true });
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (!onProgress) return;
      const total = event.lengthComputable ? event.total : file.size;
      const percent = total > 0 ? Math.min(100, Math.round((event.loaded / total) * 100)) : 0;
      onProgress({ loaded: event.loaded, total, percent });
    });

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", handleAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
        resolve();
      } else {
        reject(new Error(`R2_UPLOAD_FAILED_${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", handleAbort);
      reject(new Error("R2_UPLOAD_NETWORK_ERROR"));
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });

  let dimensions: { width: number; height: number } | undefined;
  if (category === "image") {
    dimensions = await readImageDimensions(file);
  }

  return {
    publicUrl,
    r2Key,
    contentType,
    size: file.size,
    ...dimensions,
  };
}
