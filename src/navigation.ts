import type { Page } from "./Header";

type LocationParts = Pick<Location, "pathname" | "search" | "hash">;
const prefixes = new Set(["vi", "zh", "it", "ja"]);

export function routeFromLocation(location: LocationParts): { page: Page; anchor?: string } {
  const parts = location.pathname.split("/").filter(Boolean);
  if (prefixes.has(parts[0])) parts.shift();
  let page: Page = parts[0] === "stores" || parts[0] === "about" ? parts[0] : "home";
  let anchor: string | undefined;
  try {
    anchor = decodeURIComponent(location.hash.slice(1)) || undefined;
  } catch {
    anchor = undefined;
  }
  if (!parts.length && (anchor === "contact" || anchor === "suppliers")) page = "about";
  return { page, anchor };
}

export function pageUrl(page: Page, anchor: string | undefined, location: LocationParts): string {
  const first = location.pathname.split("/")[1];
  const prefix = prefixes.has(first) ? `/${first}` : "";
  return `${prefix}/${page === "home" ? "" : page}${location.search}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
}
