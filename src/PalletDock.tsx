import { useState, type CSSProperties } from "react";
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

/** The prime mover, nose to the left, roof a little lower than the trailer. */
function Cab() {
  return (
    <svg className="pd-cab" viewBox="0 0 56 74" aria-hidden="true">
      <path d="M8 30c0-4 3-8 8-8h22c3 0 6 2 6 6v36H4V40c0-4 2-8 4-10z" fill="var(--green)" />
      <path d="M12 26h18c2 0 4 2 4 4v12H8V34c0-5 2-8 4-8z" fill="#cfe7df" />
      <path d="M4 46h40v18H4z" fill="var(--green-700)" />
      <rect x="6" y="52" width="10" height="4" rx="1" fill="#f6b531" />
      <path d="M44 20h8v44h-8z" fill="var(--green-900)" />
      <circle cx="18" cy="64" r="7" fill="#17140c" />
      <circle cx="18" cy="64" r="2.6" fill="#cfd5d0" />
    </svg>
  );
}

/** A forklift, forks to the left, drawn flat like the stickers. */
function Forklift() {
  return (
    <svg className="pd-fl-art" viewBox="0 0 72 56" aria-hidden="true">
      <path d="M4 44h18" stroke="#17140c" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 10v34M14 10v34" stroke="#17140c" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 22h30c4 0 8 3 8 8v14H22V26c0-2 2-4 4-4z" fill="#f6b531" />
      <path d="M56 24h8c4 0 8 3 8 8v12h-8z" fill="#d9951a" />
      <path d="M26 24h22v-16c0-2-1-4-4-4H30c-2 0-4 2-4 4z" fill="none" stroke="#17140c" strokeWidth="3" strokeLinejoin="round" />
      <rect x="34" y="18" width="12" height="7" rx="2" fill="#17140c" />
      <circle cx="30" cy="46" r="8" fill="#17140c" />
      <circle cx="30" cy="46" r="3" fill="#cfd5d0" />
      <circle cx="58" cy="46" r="8" fill="#17140c" />
      <circle cx="58" cy="46" r="3" fill="#cfd5d0" />
    </svg>
  );
}

/* ---------- the dock ----------------------------------------------------- */

/**
 * "How many pallets?", answered by loading a truck. Drag anywhere on the trailer (a range input lies over it):
 * pallets drop into the trailer front to back, two high, and the forklift backs out as the load grows.
 * The dispatch tag above counts along; past a full truck it reads 22+.
 */
export function PalletDock({ value, onChange }: { value: DockValue; onChange: (value: DockValue) => void }) {
  const s = useT(palletDockStrings);
  const { lang } = useLang();
  const count = dockCount(value);
  const unsure = value === "unsure";

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

  const hint = hintFor(value, count);
  const shown = unsure ? "?" : count > FULL ? `${FULL}+` : String(count);
  const step = (delta: number) => onChange(String(Math.min(OVER, Math.max(0, count + delta))));

  return (
    <div className="pd" data-unsure={unsure || undefined}>
      <p className="ct-q" id="pd-q">
        {s.q} <small>{s.optional}</small>
      </p>

      <div className="pd-head">
        <div className="pd-tag" aria-hidden="true">
          <b className="pd-num">
            <Odometer value={shown} />
          </b>
          <span className="pd-unit">
            {gap(lang)}
            {s.unit(count)}
          </span>
        </div>
        <p className="pd-hint" key={hint}>
          {s.hints[hint]}
        </p>
      </div>

      <div className="pd-scene" aria-hidden="true">
        <Cab />
        <div className="pd-trailer">
          <div className="pd-slots">
            {Array.from({ length: FULL }, (_, i) => {
              const move = trail.moves[i];
              return (
                <i
                  key={i}
                  className="pd-pal"
                  data-on={i < count || undefined}
                  data-move={move?.dir}
                  style={{ gridColumn: Math.floor(i / 2) + 1, gridRow: i % 2 ? 1 : 2, "--d": `${move?.delay ?? 0}ms` } as CSSProperties}
                />
              );
            })}
          </div>
          <div className="pd-track" style={{ "--p": Math.min(count, FULL) / FULL } as CSSProperties}>
            <span className="pd-fl" key={count}>
              <Forklift />
              {count > FULL && <i className="pd-pal pd-fl-load" data-on />}
            </span>
          </div>
        </div>
        <span className="pd-wheel pd-wheel-a" />
        <span className="pd-wheel pd-wheel-b" />
        <span className="pd-ramp" />
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
        />
      </div>

      <div className="pd-bar">
        <button type="button" className="pd-btn" aria-label={s.fewer} disabled={unsure || count === 0} onClick={() => step(-1)}>
          −
        </button>
        <div className="pd-ruler" aria-hidden="true">
          <span>0</span>
          <span>{SLOTS}</span>
          <span>{FULL}+</span>
        </div>
        <button type="button" className="pd-btn" aria-label={s.more} disabled={unsure || count === OVER} onClick={() => step(1)}>
          +
        </button>
        <button type="button" className="ct-pill pd-unsure" aria-pressed={unsure} onClick={() => onChange(unsure ? "" : "unsure")}>
          {s.unsure}
        </button>
      </div>
    </div>
  );
}
