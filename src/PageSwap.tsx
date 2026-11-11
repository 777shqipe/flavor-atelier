import { useEffect, useRef } from "react";
import type { Page } from "./Header";
import { useT } from "./i18n";
import { pageSwapStrings } from "./i18n/strings/PageSwap";
import { createPeelGeometry } from "./peelGeometry";
import "./pageswap.css";

/**
 * Page change as a markdown sticker: a giant label slaps over the screen, the
 * page swaps underneath it, then it peels away from the bottom-right corner
 * and reveals the new one.
 */

export type Swap = { to: Page; anchor?: string; n: number; history?: boolean };

const SLAP_MS = 400;
const PEEL_MS = 860;
const COVER_TIMEOUT_MS = 15_000;

export function PageSwap({ swap, onCover, onDone, onCancel }: { swap: Swap | null; onCover: (swap: Swap) => void | Promise<void>; onDone: () => void; onCancel: () => void }) {
  const s = useT(pageSwapStrings);
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLElement>(null);
  const callbacks = useRef({ onCover, onDone, onCancel });

  useEffect(() => {
    callbacks.current = { onCover, onDone, onCancel };
  });

  useEffect(() => {
    if (!swap) return;
    const el = root.current;
    const fr = face.current;
    const fl = flap.current;
    const bk = back.current;
    if (!el || !fr || !fl || !bk) return;
    let raf = 0;
    let active = true;
    let finished = false;
    let peelScheduled = false;
    let peelFailsafe = 0;
    let covering: Promise<void> | undefined;
    const cover = () => covering ??= Promise.resolve().then(() => active ? callbacks.current.onCover(swap) : undefined);
    const finish = () => {
      if (!active || finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      callbacks.current.onDone();
    };

    const peel = () => {
      if (!active || finished) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const geometry = createPeelGeometry(w, h, "br");
      const t0 = performance.now();
      el.dataset.peeling = "";
      // Count the watchdog from the actual reveal, rather than from the network request.
      peelFailsafe = window.setTimeout(finish, PEEL_MS + 1500);
      const tick = (now: number) => {
        if (!active || finished) return;
        const t = Math.min(1, (now - t0) / PEEL_MS);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const f = geometry(0.03 + eased);
        fr.style.clipPath = f.front;
        fl.style.visibility = "visible";
        fl.style.clipPath = f.flap;
        fl.style.transform = f.mirror;
        bk.style.backgroundImage = f.shade;
        if (t < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
    };

    const schedulePeel = () => {
      if (!active || finished || peelScheduled) return;
      peelScheduled = true;
      // Give lazy content two frames to lay out before revealing it.
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(peel);
      });
    };
    const timer = window.setTimeout(() => { void cover().then(schedulePeel, finish); }, SLAP_MS);

    // A stalled frame must not discard a navigation whose destination is still loading.
    const settle = () => { void cover().then(finish, finish); };
    const failsafe = window.setTimeout(() => {
      if (document.hidden) settle();
      else void cover().then(schedulePeel, finish);
    }, SLAP_MS + PEEL_MS + 1500);
    const onVisibility = () => { if (document.hidden) settle(); };
    document.addEventListener("visibilitychange", onVisibility);
    const coverTimeout = window.setTimeout(() => {
      if (!active || finished || peelScheduled) return;
      finished = true;
      cancelAnimationFrame(raf);
      callbacks.current.onCancel();
    }, COVER_TIMEOUT_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearTimeout(failsafe);
      window.clearTimeout(peelFailsafe);
      window.clearTimeout(coverTimeout);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [swap]);

  if (!swap) return null;
  const { title, line } = s.labels[swap.to];

  return (
    <div className="swap" ref={root} key={swap.n} aria-hidden="true">
      <div className="swap-face" ref={face}>
        <div className="swap-band">
          <span>{s.band.repeat(6)}</span>
        </div>
        <div className="swap-body">
          <small>{s.nowShowing}</small>
          <strong>{title}</strong>
          <p>{line}</p>
        </div>
        <div className="swap-foot">
          <span className="swap-code" />
          <span className="swap-price">
            <b>$0</b>
            <small>{s.toBrowse}</small>
          </span>
        </div>
      </div>
      <div className="swap-flap">
        <div className="swap-flap-in" ref={flap}>
          <i ref={back} />
        </div>
      </div>
    </div>
  );
}
