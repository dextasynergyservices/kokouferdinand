import { describe, expect, it } from "bun:test";
import { detectImageMimeFromBytes, parseSafeImageUrl } from "./image-utils";

describe("detectImageMimeFromBytes", () => {
  it("detects PNG magic bytes", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(detectImageMimeFromBytes(png)).toBe("image/png");
  });

  it("detects JPEG magic bytes", () => {
    const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(detectImageMimeFromBytes(jpg)).toBe("image/jpeg");
  });

  it("detects WebP magic bytes", () => {
    const webp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(detectImageMimeFromBytes(webp)).toBe("image/webp");
  });

  it("detects AVIF magic bytes", () => {
    const avif = new Uint8Array([
      0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
    ]);
    expect(detectImageMimeFromBytes(avif)).toBe("image/avif");
  });

  it("rejects spoofed SVG/HTML payloads", () => {
    const svg = new TextEncoder().encode("<svg onload=alert(1)></svg>");
    expect(detectImageMimeFromBytes(svg)).toBeNull();
  });
});

describe("parseSafeImageUrl", () => {
  const base = "https://media.makouvia.com";

  it("allows HTTPS URLs on the configured R2 domain", () => {
    expect(parseSafeImageUrl("https://media.makouvia.com/artworks/abc.webp", base)).toBe(
      "https://media.makouvia.com/artworks/abc.webp",
    );
  });

  it("allows root-relative paths and rejects protocol-relative paths", () => {
    expect(parseSafeImageUrl("/images/placeholder.webp", base)).toBe("/images/placeholder.webp");
    expect(parseSafeImageUrl("//evil.example.com/x.png", base)).toBeNull();
  });

  it("rejects non-R2 hosts, HTTP, and javascript/data URLs", () => {
    expect(parseSafeImageUrl("http://media.makouvia.com/artworks/abc.webp", base)).toBeNull();
    expect(parseSafeImageUrl("https://evil.example.com/artworks/abc.webp", base)).toBeNull();
    expect(parseSafeImageUrl("javascript:alert(1)", base)).toBeNull();
    expect(parseSafeImageUrl("data:image/svg+xml,<svg/>", base)).toBeNull();
  });
});
