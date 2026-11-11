import { useState, useEffect, useCallback, useRef } from "react";
import type { Lang } from "./i18n";

export type LocalizedText = Record<Lang, string>;

export type StoreNoticeData = {
  id: string;
  storeId: string;
  href: string;
  img: string;
  date: string;
  tag: string;
  title: LocalizedText;
  dates: LocalizedText;
  reopen: LocalizedText;
  caption: LocalizedText;
};

export type FoodPostData = {
  id: string;
  type: "hero" | "ticket";
  href: string;
  img: string;
  date: string;
  size: string;
  price: string;
  aisle?: LocalizedText;
  where?: LocalizedText;
  tag?: LocalizedText;
  name: LocalizedText;
  quip: LocalizedText;
};

export type PeoplePostData = {
  id: string;
  href: string;
  img: string;
  date: string;
  duration: string;
  author: string;
  tag: string;
  title: LocalizedText;
  highlight: LocalizedText;
  quip: LocalizedText;
  video: boolean;
};

export type QaItemData = {
  id: string;
  asker: string;
  badge: LocalizedText;
  tag: LocalizedText;
  question: LocalizedText;
  answer: LocalizedText;
};

export type InstagramFeedData = {
  lastChecked: string;
  handle: string;
  profileUrl: string;
  storeNotice?: StoreNoticeData;
  foodPosts: FoodPostData[];
  peoplePosts: PeoplePostData[];
  qa: QaItemData[];
};

const REFRESH_MS = 10 * 60 * 1000;
const LANGS: Lang[] = ["en", "it", "vi", "zh", "ja"];
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const strings = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => typeof value[key] === "string");
const localized = (value: unknown) => record(value) && strings(value, LANGS);
const post = (value: unknown): value is Record<string, unknown> =>
  record(value) && strings(value, ["id", "href", "img", "date"]) &&
  /^[\w-]+$/.test(value.id as string) && /^https:\/\//.test(value.href as string) &&
  (/^\/(?!\/)/.test(value.img as string) || /^https:\/\//.test(value.img as string)) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value.date as string) && Number.isFinite(Date.parse(value.date as string));
const unique = (items: Array<{ id: string }>) => new Set(items.map((item) => item.id)).size === items.length;

/** Keep the immediately available shelf if a deploy serves a partial or malformed feed. */
function validFeed(value: unknown): value is InstagramFeedData {
  if (!record(value) || !strings(value, ["lastChecked", "handle", "profileUrl"]) ||
      !Number.isFinite(Date.parse(value.lastChecked as string)) || !/^https:\/\//.test(value.profileUrl as string)) return false;
  if (!Array.isArray(value.foodPosts) || !value.foodPosts.every((item: unknown) =>
    post(item) && (item.type === "hero" || item.type === "ticket") && strings(item, ["size", "price"]) &&
    localized(item.name) && localized(item.quip) &&
    ["aisle", "where", "tag"].every((key) => item[key] === undefined || localized(item[key])))) return false;
  if (!Array.isArray(value.peoplePosts) || !value.peoplePosts.every((item: unknown) =>
    post(item) && strings(item, ["duration", "author", "tag"]) && typeof item.video === "boolean" &&
    localized(item.title) && localized(item.highlight) && localized(item.quip))) return false;
  if (!Array.isArray(value.qa) || !value.qa.every((item: unknown) => record(item) && strings(item, ["id", "asker"]) &&
    /^[\w-]+$/.test(item.id as string) && ["badge", "tag", "question", "answer"].every((key) => localized(item[key])))) return false;
  if (value.storeNotice !== undefined && !(post(value.storeNotice) && strings(value.storeNotice, ["storeId", "tag"]) &&
    ["title", "dates", "reopen", "caption"].every((key) => localized((value.storeNotice as Record<string, unknown>)[key])))) return false;
  return [value.foodPosts, value.peoplePosts, value.qa].every(unique);
}

let cached: { feed: InstagramFeedData; checked: number } | undefined;
let pending: Promise<InstagramFeedData> | undefined;

/** Share in-flight work across remounts (including StrictMode) and revalidate HTTP caches. */
function loadFeed(force = false): Promise<InstagramFeedData> {
  if (pending) return pending;
  if (!force && cached && Date.now() - cached.checked < REFRESH_MS) return Promise.resolve(cached.feed);
  pending = fetch("/data/instagram-feed.json", { cache: "no-cache", signal: AbortSignal.timeout(15_000) })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      if (!validFeed(data)) throw new Error("Invalid Instagram feed");
      cached = { feed: data, checked: Date.now() };
      return data;
    })
    .finally(() => { pending = undefined; });
  return pending;
}

export function useInstagramFeed(fallbackData: InstagramFeedData) {
  const [feed, setFeed] = useState<InstagramFeedData>(() => cached?.feed ?? fallbackData);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date((cached?.feed ?? fallbackData).lastChecked || Date.now()));
  const [isLiveSync, setIsLiveSync] = useState(!!cached);
  const mounted = useRef(false);

  const fetchLiveFeed = useCallback(async (force = true) => {
    if (!mounted.current) return;
    try {
      const data = await loadFeed(force);
      if (!mounted.current) return;
      setFeed(data);
      setLastSyncTime((previous) => previous.getTime() === Date.parse(data.lastChecked) ? previous : new Date(data.lastChecked));
      setIsLiveSync(true);
    } catch {
      // Offline or network error: gracefully keep current state
      if (mounted.current) setIsLiveSync(false);
    } finally {
      if (mounted.current) setIsFetching(false);
    }
  }, []);

  const refreshFeed = useCallback(() => {
    if (!mounted.current) return Promise.resolve();
    setIsFetching(true);
    return fetchLiveFeed();
  }, [fetchLiveFeed]);

  useEffect(() => {
    mounted.current = true;
    // oxlint-disable-next-line react/set-state-in-effect -- All feed updates follow the awaited external request.
    void fetchLiveFeed(false);

    const refresh = () => { if (!document.hidden) void fetchLiveFeed(false); };
    // Hidden tabs do no network work; returning to an old shelf revalidates it immediately.
    const interval = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      mounted.current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [fetchLiveFeed]);

  return {
    feed,
    isFetching,
    isLiveSync,
    lastSyncTime,
    refreshFeed,
  };
}
