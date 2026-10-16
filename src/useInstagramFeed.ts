import { useState, useEffect, useCallback } from "react";
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

export function useInstagramFeed(fallbackData: InstagramFeedData) {
  const [feed, setFeed] = useState<InstagramFeedData>(fallbackData);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date(fallbackData.lastChecked || Date.now()));
  const [isLiveSync, setIsLiveSync] = useState(false);

  const fetchLiveFeed = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/data/instagram-feed.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: InstagramFeedData = await res.json();
      setFeed(data);
      setLastSyncTime(new Date(data.lastChecked || Date.now()));
      setIsLiveSync(true);
    } catch {
      // Offline or network error: gracefully keep current state
      setIsLiveSync(false);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadInitial = async () => {
      try {
        const res = await fetch(`/data/instagram-feed.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InstagramFeedData = await res.json();
        if (!cancelled) {
          setFeed(data);
          setLastSyncTime(new Date(data.lastChecked || Date.now()));
          setIsLiveSync(true);
        }
      } catch {
        if (!cancelled) {
          setIsLiveSync(false);
        }
      }
    };
    void loadInitial();

    // Re-check periodically every 10 minutes while tab is open
    const interval = window.setInterval(fetchLiveFeed, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [fetchLiveFeed]);

  return {
    feed,
    isFetching,
    isLiveSync,
    lastSyncTime,
    refreshFeed: fetchLiveFeed,
  };
}
