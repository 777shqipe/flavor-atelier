#!/usr/bin/env node
/**
 * scripts/sync-instagram.mjs
 *
 * Checks metadata for the curated Instagram links already in the feed.
 * This does not discover new posts or update their content. lastChecked is
 * advanced only when every reference check succeeds.
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
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:title"/);
    const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:description"/);
    const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:image"/);

    const title = titleMatch?.[1].replace(/&amp;/g, "&").trim();
    // Instagram can return a generic login/landing page with HTTP 200.
    if (!title || /^(instagram|login|log in|sign up)(?:\s*[·•|–-]\s*instagram)?$/i.test(title)) return null;
    return {
      title,
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

  const original = fs.readFileSync(FEED_PATH, "utf-8");
  const feed = JSON.parse(original);
  const urls = [...new Set([feed.storeNotice?.href, ...(feed.peoplePosts ?? []).map((post) => post.href)].filter(Boolean))];
  if (!urls.length) {
    console.error("[sync-instagram] No references to verify; feed and timestamp left unchanged.");
    process.exitCode = 1;
    return;
  }
  const checks = await Promise.all(urls.map(async (url) => ({ url, metadata: await fetchPostOgMetadata(url) })));
  const failed = checks.filter(({ metadata }) => !metadata);
  if (failed.length) {
    console.error(`[sync-instagram] ${failed.length}/${checks.length} reference checks failed; feed and timestamp left unchanged.`);
    process.exitCode = 1;
    return;
  }
  // Avoid overwriting an editor's changes made while the network checks were running.
  if (fs.readFileSync(FEED_PATH, "utf-8") !== original) throw new Error("Feed changed during verification; no data was written.");
  feed.lastChecked = new Date().toISOString();
  const temporary = `${FEED_PATH}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(feed, null, 2) + "\n", "utf-8");
    fs.renameSync(temporary, FEED_PATH);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  console.log(`[sync-instagram] Verified ${checks.length} existing references. No post content was changed. Checked at:`, feed.lastChecked);
}

sync().catch((err) => {
  console.error("[sync-instagram] Fatal sync error:", err);
  process.exit(1);
});
