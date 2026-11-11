import { memo, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { gap, useLang, useT } from "./i18n";
import { palletDockStrings } from "./i18n/strings/PalletDock";
import { Odometer } from "./Odometer";
import "./palletdock.css";

/** A semi-trailer takes 22 standard pallets: 11 along, two high. The stop after that is "more than a truck". */
const SLOTS = 11;
const FULL = SLOTS * 2;
const OVER = FULL + 1;

/** The field's value: nothing yet, "unsure", or a pallet count ("23" means more than a truck). */
export type DockValue = string;

const dockCount = (value: DockValue) => (value === "" || value === "unsure" ? 0 : Math.min(OVER, Math.max(0, Number(value) || 0)));

/** What the review step prints for a dock value, or nothing when the field was never touched. */
export function useDockReview(value: DockValue): string | undefined {
  const s = useT(palletDockStrings);
  if (value === "") return undefined;
  return s.review(value === "unsure" ? "unsure" : dockCount(value));
}

function hintFor(value: DockValue, count: number) {
  if (value === "unsure") return "unsure" as const;
  if (value === "") return "unset" as const;
  if (count === 0) return "boxes" as const;
  if (count === 1) return "one" as const;
  if (count <= 5) return "few" as const;
  if (count <= 10) return "part" as const;
  if (count < FULL) return "most" as const;
  if (count === FULL) return "full" as const;
  return "over" as const;
}

/* ---------- the drawings ------------------------------------------------- */

/** The prime mover, nose to the left: sleeper cab, stack, mirror. The wheels are HTML, so the cab can sit on its springs. */
const Cab = memo(function Cab() {
  return (
    <svg className="pd-cab-art" viewBox="0 0 64 78" aria-hidden="true">
      <rect x="52" y="4" width="5" height="34" rx="2" fill="#5b6a63" />
      <path d="M14 20c0-6 4-10 10-10h26c4 0 6 2 6 6v50H6V40c0-3 1-6 3-8z" fill="var(--green)" />
      <path d="M8 40h10c3 0 5-2 5-5V22c0-2-2-4-4-4-5 0-9 4-11 9z" fill="#cfe7df" />
      <path d="M24 10h24v22H24z" fill="var(--green-700)" />
      <path d="M26 14h20v14H26z" fill="#cfe7df" />
      <path d="M6 48h50v18H6z" fill="var(--green-700)" />
      <path d="M2 62h58v6H2z" fill="#17140c" />
      <rect x="6" y="52" width="9" height="5" rx="1.5" fill="#f6b531" />
      <rect x="2" y="30" width="4" height="9" rx="1" fill="#17140c" />
    </svg>
  );
});

/** A forklift, forks to the left, with its driver. Wheels are HTML so they can spin on the compositor. */
const Forklift = memo(function Forklift() {
  return (
    <svg className="pd-fl-art" viewBox="0 0 80 64" aria-hidden="true">
      <path d="M2 50h20" stroke="#17140c" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M11 8v42M16 8v42" stroke="#17140c" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M26 30h34c5 0 10 4 10 10v12H22V34c0-2 2-4 4-4z" fill="#f6b531" />
      <path d="M60 32h6c5 0 10 4 10 10v10H60z" fill="#d9951a" />
      <path d="M27 30V14c0-3 2-5 5-5h18c3 0 5 2 5 5v16" fill="none" stroke="#17140c" strokeWidth="3.2" strokeLinejoin="round" />
      <circle cx="43" cy="17" r="5" fill="#e8c39e" />
      <path d="M37 15c1-4 4-6 7-6s5 2 6 5l-13 1z" fill="var(--green)" />
      <path d="M36 30c0-5 3-8 7-8s7 3 7 8z" fill="var(--green)" />
      <rect x="33" y="26" width="18" height="5" rx="2" fill="#17140c" />
    </svg>
  );
});

/* ---------- the dock ----------------------------------------------------- */

/**
 * "How many pallets?", answered by loading a truck at the dock. Drag anywhere on the scene (a range input
 * lies over it): pallets drop into the trailer front to back, two high, the forklift backs out as the load
 * grows, and the rig settles on its springs. The dispatch tag swings and counts along; a full truck gets its
 * stamp, one more and the forklift is left holding a pallet on the dock. Hovering shows what a click would load.
 */
export function PalletDock({ value, onChange }: { value: DockValue; onChange: (value: DockValue) => void }) {
  const s = useT(palletDockStrings);
  const { lang } = useLang();
  const count = dockCount(value);
  const unsure = value === "unsure";
  const full = count >= FULL;

  // Each pallet remembers its last move so its animation plays once, with a short stagger when many land at once.
  // State adjusted during render: when the count changes, the pallets in between get their move.
  const [trail, setTrail] = useState<{ count: number; moves: Array<{ dir: "in" | "out"; delay: number } | undefined> }>({ count, moves: [] });
  if (trail.count !== count) {
    const from = trail.count;
    const moves = trail.moves.slice();
    for (let i = Math.min(from, count); i < Math.max(from, count); i += 1) {
      moves[i] = count > from ? { dir: "in", delay: Math.min(i - from, 10) * 35 } : { dir: "out", delay: Math.min(from - 1 - i, 10) * 25 };
    }
    setTrail({ count, moves });
  }

  // The forklift's wheels turn for a moment after every move, the way it drove.
  const [drive, setDrive] = useState<"in" | "out" | null>(null);
  const lastCount = useRef(count);
  useEffect(() => {
    if (lastCount.current === count) return;
    setDrive(count > lastCount.current ? "out" : "in");
    lastCount.current = count;
    const timer = window.setTimeout(() => setDrive(null), 650);
    return () => window.clearTimeout(timer);
  }, [count]);

  // Hover shows what a click would load: ghost pallets up to the pointer and the number on a little tag.
  const [preview, setPreview] = useState<{ n: number; x: number } | null>(null);
  const hoverFrame = useRef(0);
  const hoverX = useRef(0);
  const clearPreview = () => {
    cancelAnimationFrame(hoverFrame.current);
    hoverFrame.current = 0;
    setPreview(null);
  };
  useEffect(() => () => cancelAnimationFrame(hoverFrame.current), []);
  const onHover = (event: PointerEvent<HTMLInputElement>) => {
    if (event.pointerType !== "mouse" || unsure) return;
    const input = event.currentTarget;
    hoverX.current = event.clientX;
    if (hoverFrame.current) return;
    hoverFrame.current = requestAnimationFrame(() => {
      hoverFrame.current = 0;
      const box = input.getBoundingClientRect();
      if (!box.width) return;
      const x = Math.min(Math.max(hoverX.current - box.left, 0), box.width);
      setPreview({ n: Math.round((x / box.width) * OVER), x });
    });
  };

  const hint = hintFor(value, count);
  const shown = unsure ? "?" : count > FULL ? `${FULL}+` : String(count);
  const parity = count % 2 ? "a" : "b";
  const step = (delta: number) => onChange(String(Math.min(OVER, Math.max(0, count + delta))));
  const ghost = preview && preview.n !== count ? preview.n : null;

  return (
    <div className="pd" data-unsure={unsure || undefined}>
      <p className="ct-q" id="pd-q">
        {s.q} <small>{s.optional}</small>
      </p>

      <div className="pd-head">
        <div className="pd-hang" aria-hidden="true">
          <span className="pd-string" />
          <div className="pd-tag" data-swing={parity}>
            <b className="pd-num">
              <Odometer value={shown} />
            </b>
            <span className="pd-unit">
              {gap(lang)}
              {s.unit(count)}
            </span>
          </div>
        </div>
        <p className="pd-hint" key={hint}>
          {s.hints[hint]}
        </p>
      </div>

      <div className="pd-scene" style={{ "--load": Math.min(count, FULL) / FULL } as CSSProperties}>
        <div className="pd-wall" aria-hidden="true">
          <span className="pd-door" />
          <span className="pd-sign">CBM · {s.dock} 02</span>
        </div>
        <span className="pd-platform" />
        <span className="pd-bumper" />

        <div className="pd-dip" data-thud={parity} aria-hidden="true">
          <div className="pd-rig">
            <div className="pd-cab">
              <Cab />
            </div>
            <div className="pd-trailer">
              <div className="pd-slots">
                {Array.from({ length: FULL }, (_, i) => {
                  const move = trail.moves[i];
                  const ghostState = ghost === null ? undefined : i >= count && i < ghost ? "add" : i >= ghost && i < count ? "cut" : undefined;
                  return (
                    <i
                      key={i}
                      className="pd-pal"
                      data-on={i < count || undefined}
                      data-move={move?.dir}
                      data-ghost={ghostState}
                      style={{ gridColumn: Math.floor(i / 2) + 1, gridRow: i % 2 ? 1 : 2, "--d": `${move?.delay ?? 0}ms` } as CSSProperties}
                    />
                  );
                })}
              </div>
              {full && <span className="pd-stamp">{s.full}</span>}
            </div>
            <span className="pd-legs" />
          </div>
        </div>

        {/* Parked where the next pallet goes: deep inside for an empty trailer, out on the dock once it is full. */}
        <div className="pd-track" style={{ "--p": Math.min(count, FULL) / FULL } as CSSProperties} data-out={count > FULL || undefined} aria-hidden="true">
          <span className="pd-fl" data-moving={drive ?? undefined}>
            <Forklift />
            <span className="pd-fl-wheel pd-fl-wheel-a" />
            <span className="pd-fl-wheel pd-fl-wheel-b" />
            {count > FULL && <i className="pd-pal pd-fl-load" data-on />}
          </span>
        </div>

        <span className="pd-wheel pd-wheel-cab" />
        <span className="pd-wheel pd-wheel-cab2" />
        <span className="pd-wheel pd-wheel-a" />
        <span className="pd-wheel pd-wheel-b" />
        <div className="pd-ground" aria-hidden="true">
          <span>0</span>
          <span>{SLOTS}</span>
          <span>{FULL}</span>
        </div>

        {ghost !== null && preview && (
          <span className="pd-cursor" style={{ translate: `${preview.x}px 0` }} aria-hidden="true">
            {ghost > FULL ? `${FULL}+` : ghost}
          </span>
        )}
        <input
          className="pd-range"
          type="range"
          min={0}
          max={OVER}
          step={1}
          value={count}
          aria-labelledby="pd-q"
          aria-valuetext={s.valueText(count)}
          onChange={(event) => onChange(event.target.value)}
          onPointerMove={onHover}
          onPointerLeave={clearPreview}
          onPointerCancel={clearPreview}
        />
      </div>

      <div className="pd-bar">
        <div className="pd-steps">
          <button type="button" className="pd-btn" aria-label={s.fewer} disabled={unsure || count === 0} onClick={() => step(-1)}>
            −
          </button>
          <button type="button" className="pd-btn" aria-label={s.more} disabled={unsure || count === OVER} onClick={() => step(1)}>
            +
          </button>
        </div>
        <p className="pd-tip">{s.tip}</p>
        <button type="button" className="ct-pill pd-unsure" aria-pressed={unsure} onClick={() => onChange(unsure ? "" : "unsure")}>
          {s.unsure}
        </button>
      </div>
    </div>
  );
}
