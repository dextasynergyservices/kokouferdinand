export type ParsedExternalVideo =
  | { provider: "youtube"; id: string; embedUrl: string }
  | { provider: "vimeo"; id: string; embedUrl: string };

export function parseExternalVideoUrl(rawUrl: string): ParsedExternalVideo | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "");

  // YouTube (watch, live, shorts, youtu.be)
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let id = "";
    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0] ?? "";
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v") ?? "";
    } else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      id = match?.[1] ?? "";
    }
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    };
  }

  // Vimeo
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = url.pathname.match(/\/(?:video\/)?(\d+)/);
    const id = match?.[1] ?? "";
    if (!id) return null;
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?dnt=1`,
    };
  }

  return null;
}
