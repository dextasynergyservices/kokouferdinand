export type AllowedImageMime = "image/webp" | "image/avif" | "image/jpeg" | "image/png";

const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  "image/webp": "webp",
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export function extensionForImageMime(mime: AllowedImageMime): string {
  return MIME_TO_EXT[mime];
}

/**
 * Inspects file magic bytes to verify the true image format and reject spoofed files
 * (e.g., SVG/HTML renamed to .png or .jpg).
 */
export function detectImageMimeFromBytes(bytes: Uint8Array): AllowedImageMime | null {
  if (bytes.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  // AVIF: ISO BMFF "ftyp" at offset 4 followed by "avif" or "avis"
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    (bytes[11] === 0x66 || bytes[11] === 0x73)
  ) {
    return "image/avif";
  }

  return null;
}

/**
 * Validates that an image URL is either a safe local root-relative path ("/...")
 * or an HTTPS URL hosted on the configured Cloudflare R2 public domain.
 */
export function parseSafeImageUrl(
  rawUrl: string,
  allowedBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.makouvia.com",
): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Allow safe root-relative local assets (reject protocol-relative "//...")
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  let parsed: URL;
  let allowed: URL;
  try {
    parsed = new URL(trimmed);
    allowed = new URL(allowedBaseUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (parsed.hostname !== allowed.hostname) return null;
  if (parsed.username || parsed.password) return null;

  return parsed.toString();
}
