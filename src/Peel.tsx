import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createPeelGeometry, type Corner } from "./peelGeometry";
import "./peel.css";

/**
 * A decorative sticker that lifts from one corner on hover and peels further
 * when clicked or tapped, showing what it was stuck over. Driven by a small
 * spring so it wobbles a little as it settles, the way paper does.
 */
export function Peel({
  from = "br",
  hover = 0.34,
  deep = 0.52,
  bleed = 0,
  className = "",
  style,
  back,
  under,
  children,
}: {
  from?: Corner;
  /** how far it lifts under the pointer, 0..1 */
  hover?: number;
  /** how far it lifts once clicked or tapped */
  deep?: number;
  /** overhang around the box, as a fraction of its width (for outlined shapes) */
  bleed?: number;
  className?: string;
  style?: CSSProperties;
  /** silhouette of the back of the sticker: clip-path or border-radius */
  back?: CSSProperties;
  under?: ReactNode;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const backEl = useRef<HTMLElement>(null);
  const api = useRef<{ set: (target: number) => void; state: { over: boolean; pinned: boolean; idle: number } } | null>(null);

  useEffect(() => {
    const el = root.current;
    const fr = front.current;
    const fl = flap.current;
    const bk = backEl.current;
    if (!el || !fr || !fl || !bk) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = el.offsetWidth;
    let h = el.offsetHeight;
    let geometry = createPeelGeometry(w, h, from, bleed * w);
    bk.style.inset = `${-bleed * w}px`;
    let p = 0;
    let v = 0;
    let target = 0;
    let raf = 0;
    let last = 0;

    const paint = () => {
      if (p < 0.004) {
        fr.style.clipPath = "";
        fl.style.visibility = "hidden";
        el.style.removeProperty("--lift");
        return;
      }
      const f = geometry(p);
      fr.style.clipPath = f.front;
      fl.style.visibility = "visible";
      fl.style.clipPath = f.flap;
      fl.style.transform = f.mirror;
      bk.style.backgroundImage = f.shade;
      el.style.setProperty("--lift", Math.min(1, p * 3).toFixed(3));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      const a = -240 * (p - target) - 17 * v;
      v += a * dt;
      p += v * dt;
      if (Math.abs(v) < 0.0008 && Math.abs(p - target) < 0.0008) {
        p = target;
        v = 0;
        paint();
        raf = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(tick);
    };

    const state = { over: false, pinned: false, idle: 0 };
    api.current = {
      state,
      set(next) {
        target = next;
        if (reduce) {
          p = next;
          paint();
          return;
        }
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
    };

    const ro = new ResizeObserver(() => {
      w = el.offsetWidth;
      h = el.offsetHeight;
      geometry = createPeelGeometry(w, h, from, bleed * w);
      bk.style.inset = `${-bleed * w}px`;
      paint();
    });
    ro.observe(el);

    // Touch screens have no hover to hint that a sticker peels: curl a corner once it is in view.
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    let curlTimer = 0;
    const io = coarse
      ? new IntersectionObserver(
          ([entry]) => {
            window.clearTimeout(curlTimer);
            if (entry.isIntersecting) {
              curlTimer = window.setTimeout(() => {
                state.idle = hover * 0.78;
                if (!state.pinned && !state.over) api.current?.set(state.idle);
              }, 320);
            } else {
              state.idle = 0;
              state.pinned = false;
              api.current?.set(0);
            }
          },
          { threshold: 0.35 },
        )
      : null;
    io?.observe(el);

    return () => {
      window.clearTimeout(curlTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      api.current = null;
    };
  }, [from, bleed, hover]);

  const update = () => {
    const a = api.current;
    if (!a) return;
    a.set(a.state.pinned ? deep : a.state.over ? hover : a.state.idle);
  };

  return (
    <div
      ref={root}
      className={`peel ${className}`}
      style={style}
      data-from={from}
      aria-hidden="true"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse" || !api.current) return;
        api.current.state.over = true;
        update();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse" || !api.current) return;
        api.current.state.over = false;
        api.current.state.pinned = false;
        update();
      }}
      onClick={() => {
        if (!api.current) return;
        api.current.state.pinned = !api.current.state.pinned;
        update();
      }}
    >
      {under && <div className="peel-under">{under}</div>}
      <div className="peel-front" ref={front}>
        {children}
      </div>
      <div className="peel-flap" aria-hidden="true">
        <div className="peel-flap-in" ref={flap}>
          <i className="peel-back" ref={backEl} style={back} />
        </div>
      </div>
    </div>
  );
}
