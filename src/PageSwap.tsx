import { useEffect, useRef } from "react";
import type { Page } from "./Header";
import { peelFrame } from "./peelGeometry";
import "./pageswap.css";

/**
 * Page change as a markdown sticker: a giant label slaps over the screen, the
 * page swaps underneath it, then it peels away from the bottom-right corner
 * and reveals the new one.
 */

export type Swap = { to: Page; anchor?: string; n: number };

const LABELS: Record<Page, [string, string]> = {
  home: ["Home", "Fresh finds, every week."],
  stores: ["Our stores", "Four shops. One map."],
  about: ["About us", "Rescuing good food since 1995."],
};

const BAND = "Cheaper Buy Miles ✦ Reduced to clear ✦ ";
const SLAP_MS = 400;
const PEEL_MS = 860;

export function PageSwap({ swap, onCover, onDone }: { swap: Swap | null; onCover: (swap: Swap) => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLElement>(null);
  const callbacks = useRef({ onCover, onDone });

  useEffect(() => {
    callbacks.current = { onCover, onDone };
  });

  useEffect(() => {
    if (!swap) return;
    const el = root.current;
    const fr = face.current;
    const fl = flap.current;
    const bk = back.current;
    if (!el || !fr || !fl || !bk) return;
    let raf = 0;

    const peel = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const t0 = performance.now();
      el.dataset.peeling = "";
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / PEEL_MS);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const f = peelFrame(w, h, "br", 0.03 + eased);
        fr.style.clipPath = f.front;
        fl.style.visibility = "visible";
        fl.style.clipPath = f.flap;
        fl.style.transform = f.mirror;
        bk.style.backgroundImage = f.shade;
        if (t < 1) raf = requestAnimationFrame(tick);
        else callbacks.current.onDone();
      };
      raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      callbacks.current.onCover(swap);
      // Give the new page two frames to lay out before revealing it.
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(peel);
      });
    }, SLAP_MS);

    // Frames do not run in a background tab; never leave the sticker stuck on screen.
    const failsafe = window.setTimeout(() => callbacks.current.onDone(), SLAP_MS + PEEL_MS + 1500);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(failsafe);
      cancelAnimationFrame(raf);
    };
  }, [swap]);

  if (!swap) return null;
  const [title, line] = LABELS[swap.to];

  return (
    <div className="swap" ref={root} key={swap.n} aria-hidden="true">
      <div className="swap-face" ref={face}>
        <div className="swap-band">
          <span>{BAND.repeat(6)}</span>
        </div>
        <div className="swap-body">
          <small>Now showing</small>
          <strong>{title}</strong>
          <p>{line}</p>
        </div>
        <div className="swap-foot">
          <span className="swap-code" />
          <span className="swap-price">
            <b>$0</b>
            <small>to browse</small>
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
