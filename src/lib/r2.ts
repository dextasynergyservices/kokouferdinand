import crypto from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UPLOAD_RULES, type UploadCategory } from "./upload-rules";

export { UPLOAD_RULES, type UploadCategory };

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function createPresignedUpload({
  category,
  contentType,
  contentLength,
  extension,
}: {
  category: UploadCategory;
  contentType: string;
  contentLength: number;
  extension: string;
}) {
  const rule = UPLOAD_RULES[category];
  if (!rule.mimeTypes.includes(contentType as never)) {
    throw new Error("UNSUPPORTED_MIME_TYPE");
  }
  if (contentLength <= 0 || contentLength > rule.maxBytes) {
    throw new Error("FILE_TOO_LARGE");
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!bucketName || !publicBaseUrl) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (!safeExt || !rule.extensions.includes(safeExt as never)) {
    throw new Error("INVALID_EXTENSION");
  }

  const r2Key = `${rule.prefix}/${crypto.randomUUID()}.${safeExt}`;
  const r2Client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });
  const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/${r2Key}`;

  return { uploadUrl, publicUrl, r2Key };
}

export async function deleteR2Object(r2Key: string) {
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("R2_NOT_CONFIGURED");
  }

  const r2Client = getR2Client();
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
    }),
  );
}
