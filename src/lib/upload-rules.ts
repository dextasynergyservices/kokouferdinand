export const UPLOAD_RULES = {
  image: {
    prefix: "artworks",
    maxBytes: 15 * 1024 * 1024, // 15 MB
    mimeTypes: ["image/webp", "image/avif", "image/jpeg", "image/png"],
    extensions: ["webp", "avif", "jpg", "jpeg", "png"],
  },
  video: {
    prefix: "videos",
    maxBytes: 250 * 1024 * 1024, // 250 MB
    mimeTypes: ["video/mp4", "video/webm"],
    extensions: ["mp4", "webm"],
  },
  model3d: {
    prefix: "models",
    maxBytes: 50 * 1024 * 1024, // 50 MB
    mimeTypes: ["model/gltf-binary", "application/octet-stream"],
    extensions: ["glb"],
  },
  document: {
    prefix: "docs",
    maxBytes: 20 * 1024 * 1024, // 20 MB
    mimeTypes: ["application/pdf"],
    extensions: ["pdf"],
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_RULES;
