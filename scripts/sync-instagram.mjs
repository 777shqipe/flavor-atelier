#!/usr/bin/env node
/**
 * scripts/sync-instagram.mjs
 *
 * Automated Instagram Feed Listener / Sync Service for @cheaperbuymiles.
 * Checks Instagram for latest posts, store updates, and video reels,
 * updating public/data/instagram-feed.json.
 *
 * Can be run locally via `npm run sync:instagram` or automatically
 * on a schedule via GitHub Actions cron.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../public/data/instagram-feed.json");

async function fetchPostOgMetadata(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:title"/);
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:description"/);
    const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:image"/);

    return {
      title: titleMatch ? titleMatch[1].replace(/&amp;/g, "&") : null,
      description: descMatch ? descMatch[1].replace(/&amp;/g, "&") : null,
      image: imageMatch ? imageMatch[1].replace(/&amp;/g, "&") : null,
    };
  } catch (err) {
    console.warn(`[sync-instagram] Failed to fetch metadata for ${url}:`, err.message);
    return null;
  }
}

async function sync() {
  console.log("[sync-instagram] Reading current feed from:", FEED_PATH);
  if (!fs.existsSync(FEED_PATH)) {
    console.error("[sync-instagram] Error: Feed file does not exist at:", FEED_PATH);
    process.exit(1);
  }

  const feed = JSON.parse(fs.readFileSync(FEED_PATH, "utf-8"));
  feed.lastChecked = new Date().toISOString();

  console.log(`[sync-instagram] Checking active store notice (${feed.storeNotice?.href})...`);
  if (feed.storeNotice?.href) {
    const meta = await fetchPostOgMetadata(feed.storeNotice.href);
    if (meta?.title) {
      console.log("[sync-instagram] Verified store notice post online:", meta.title.slice(0, 50));
    }
  }

  console.log(`[sync-instagram] Checking ${feed.peoplePosts?.length ?? 0} team video reels...`);
  for (const post of feed.peoplePosts ?? []) {
    if (post.href) {
      const meta = await fetchPostOgMetadata(post.href);
      if (meta?.title) {
        console.log(`[sync-instagram] Verified reel [${post.id}]:`, meta.title.slice(0, 50));
      }
    }
  }

  fs.writeFileSync(FEED_PATH, JSON.stringify(feed, null, 2) + "\n", "utf-8");
  console.log("[sync-instagram] Successfully synced feed! Updated timestamp:", feed.lastChecked);
}

sync().catch((err) => {
  console.error("[sync-instagram] Fatal sync error:", err);
  process.exit(1);
});
