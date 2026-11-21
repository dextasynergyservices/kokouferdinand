import { describe, expect, it } from "bun:test";
import { parseExternalVideoUrl } from "./video-utils";

describe("parseExternalVideoUrl", () => {
  it("normalizes youtu.be short URLs to youtube-nocookie", () => {
    const res = parseExternalVideoUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(res).toEqual({
      provider: "youtube",
      id: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    });
  });

  it("normalizes youtube.com/watch URLs to youtube-nocookie", () => {
    const res = parseExternalVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s");
    expect(res?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0");
  });

  it("normalizes youtube shorts/live/embed URLs", () => {
    expect(parseExternalVideoUrl("https://youtube.com/shorts/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
    expect(parseExternalVideoUrl("https://youtube.com/live/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
    expect(parseExternalVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")?.id).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("normalizes Vimeo URLs with dnt=1", () => {
    const res = parseExternalVideoUrl("https://vimeo.com/123456789");
    expect(res).toEqual({
      provider: "vimeo",
      id: "123456789",
      embedUrl: "https://player.vimeo.com/video/123456789?dnt=1",
    });
  });

  it("rejects arbitrary, malformed, or non-http(s) URLs", () => {
    expect(parseExternalVideoUrl("https://evil.example.com/embed/1")).toBeNull();
    expect(parseExternalVideoUrl("javascript:alert(1)")).toBeNull();
    expect(parseExternalVideoUrl("not-a-url")).toBeNull();
  });
});
