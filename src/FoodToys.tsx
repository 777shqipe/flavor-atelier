import { useId, useState, type CSSProperties, type ReactNode } from "react";
import "./toys.css";

/**
 * Three pieces of food to play with, standing in for the About page's story pillars.
 * A ripe banana to peel, a cookie to bite and a pea pod to open: each one is a sticker
 * (same ink outline and white die-cut border as the hero), and the pillar's words are
 * what you find once you have done something to it.
 */

const INK = "#1c1a17";

function Sticker({ box, children }: { box: string; children: ReactNode }) {
  const id = `toy-die-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg className="toy-svg" viewBox={box} overflow="visible" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" x="-70" y="-70" width="260" height="280">
          <feMorphology in="SourceAlpha" operator="dilate" radius="4.2" result="grown" />
          <feFlood floodColor="#fff" />
          <feComposite in2="grown" operator="in" result="border" />
          <feMerge>
            <feMergeNode in="border" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

/** Ripe banana: the two halves of the skin fall open and the pale fruit is underneath. */
function Banana() {
  return (
    <Sticker box="0 0 120 140">
      <g className="bn-flesh">
        <path d="M60 22C49 30 46 60 49 88C51 104 55 112 60 114C65 112 69 104 71 88C74 60 71 30 60 22Z" fill="#fff1b8" />
        <path d="M55 40C53 56 53 72 55 86" fill="none" stroke="#f0d87a" strokeWidth="1.8" />
        <circle cx="64" cy="72" r="1.9" fill="#8a5a22" stroke="none" />
        <circle cx="60" cy="98" r="1.5" fill="#8a5a22" stroke="none" />
      </g>
      <g className="bn-half bn-l">
        <path d="M60 22C44 30 38 60 42 90C44 108 52 118 60 120Z" fill="#f4cf3a" />
        <path d="M50 40C46 58 46 76 49 94" fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="3" />
        <g fill="#7a4a1f" stroke="none">
          <circle cx="48" cy="62" r="3" />
          <circle cx="46" cy="84" r="2.3" />
          <circle cx="53" cy="100" r="2" />
          <circle cx="52" cy="46" r="1.6" />
        </g>
      </g>
      <g className="bn-half bn-r">
        <path d="M60 22C76 30 82 60 78 90C76 108 68 118 60 120Z" fill="#eec12e" />
        <path d="M72 42C75 60 75 78 72 96" fill="none" stroke="rgb(150 90 0 / 0.25)" strokeWidth="4" />
        <g fill="#7a4a1f" stroke="none">
          <circle cx="71" cy="54" r="2.4" />
          <circle cx="72" cy="78" r="3.4" />
          <circle cx="66" cy="102" r="2" />
          <circle cx="75" cy="92" r="1.6" />
        </g>
      </g>
      <ellipse cx="60" cy="121" rx="5" ry="3" fill="#4a3418" />
      <path d="M55 28V11Q55 6 60 6Q65 6 65 11V28Z" fill="#8c9a35" />
      <rect x="56" y="3" width="8" height="5" rx="1.5" fill="#4a3418" />
    </Sticker>
  );
}

/** Circles that make up each bite: a big one and two smaller ones, so the edge comes out scalloped. */
const BITES = [
  [[102, 28, 12], [110, 44, 9], [92, 14, 9]],
  [[20, 92, 12], [30, 106, 9], [10, 76, 9]],
  [[14, 40, 12], [28, 24, 9], [8, 56, 9]],
  [[96, 98, 13], [84, 110, 9], [108, 84, 9]],
] as const;

const CRUMBS = [
  { dx: "-9px", dy: "34px" },
  { dx: "5px", dy: "42px" },
  { dx: "13px", dy: "30px" },
  { dx: "-2px", dy: "46px" },
] as const;

const COOKIE = "M60 8C86 6 112 28 112 58C112 90 88 112 58 112C28 112 8 88 8 58C8 28 32 10 60 8Z";

/** Cookie: every tap takes a bite out of it, and after the fourth a fresh one is on the plate. */
function Cookie({ bites }: { bites: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const inkMask = `ck-ink-${uid}`;
  const fillMask = `ck-fill-${uid}`;
  const taken = BITES.slice(0, bites);
  const last = bites > 0 ? BITES[bites - 1][0] : null;

  const maskFor = (id: string, grow: number) => (
    <mask id={id} maskUnits="userSpaceOnUse" x="-30" y="-30" width="180" height="180">
      <rect x="-30" y="-30" width="180" height="180" fill="#fff" />
      {taken.map((bite, i) => (
        <g key={i} className="ck-bite" fill="#000" stroke="none">
          {bite.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r + grow} />
          ))}
        </g>
      ))}
    </mask>
  );

  return (
    <>
      <Sticker box="0 0 120 120">
        <defs>
          {maskFor(inkMask, 0)}
          {maskFor(fillMask, 2.4)}
        </defs>
        {/* The ink layer is masked by the bites and the cookie layer by slightly bigger ones, so the bite edge keeps its outline. */}
        <g mask={`url(#${inkMask})`}>
          <path d={COOKIE} fill={INK} strokeWidth="4.8" />
        </g>
        <g mask={`url(#${fillMask})`} stroke="none">
          <path d={COOKIE} fill="#dc9d50" />
          <path d={COOKIE} fill="none" stroke="#b97a33" strokeWidth="2" strokeDasharray="1 5" transform="translate(60 60) scale(0.86) translate(-60 -60)" />
          <path d="M24 36C28 26 38 18 48 16" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="4" strokeLinecap="round" />
          <g fill="#4b2812">
            <ellipse cx="38" cy="40" rx="7" ry="5.5" transform="rotate(-18 38 40)" />
            <ellipse cx="76" cy="30" rx="6" ry="5" transform="rotate(24 76 30)" />
            <ellipse cx="90" cy="62" rx="6.5" ry="5" transform="rotate(-30 90 62)" />
            <ellipse cx="48" cy="72" rx="7" ry="5.5" transform="rotate(14 48 72)" />
            <ellipse cx="72" cy="90" rx="6" ry="5" transform="rotate(-12 72 90)" />
            <ellipse cx="30" cy="84" rx="5" ry="4" />
            <ellipse cx="62" cy="56" rx="5.5" ry="4.5" transform="rotate(30 62 56)" />
            <ellipse cx="98" cy="88" rx="4.5" ry="4" />
          </g>
          <g fill="rgb(255 255 255 / 0.28)">
            <circle cx="36" cy="38" r="1.8" />
            <circle cx="74" cy="28" r="1.6" />
            <circle cx="46" cy="70" r="1.8" />
          </g>
        </g>
      </Sticker>
      {last && (
        <svg className="toy-svg toy-crumbs" viewBox="0 0 120 120" overflow="visible" aria-hidden="true" focusable="false">
          <g key={bites} stroke={INK} strokeWidth="1.2">
            {CRUMBS.map((c, j) => (
              <circle
                key={j}
                className="ck-crumb"
                cx={last[0] - 4 + j * 4}
                cy={last[1] + 4}
                r={2.6 - j * 0.3}
                fill="#dc9d50"
                style={{ "--dx": c.dx, "--dy": c.dy, "--j": j } as CSSProperties}
              />
            ))}
          </g>
        </svg>
      )}
    </>
  );
}

/** Pea pod: the lid swings open and four peas hop up, one for each shop. */
function PeaPod() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const lid = "M8 52Q70 14 132 50Q70 60 8 52Z";
  const bowl = "M8 52Q70 58 132 50Q122 88 70 90Q18 88 8 52Z";
  const bumps = [
    [34, 47],
    [57, 42],
    [81, 42],
    [104, 46],
  ] as const;
  return (
    <Sticker box="0 -14 140 112">
      <defs>
        <clipPath id={`pd-lid-${uid}`}>
          <path d={lid} />
        </clipPath>
        <clipPath id={`pd-bowl-${uid}`}>
          <path d={bowl} />
        </clipPath>
      </defs>
      <path d="M130 50Q138 46 139 36" fill="none" strokeWidth="6.4" />
      <path d="M130 50Q138 46 139 36" fill="none" stroke="#5fae34" strokeWidth="2.4" />
      <path className="pd-bowl" d={bowl} fill="#5fae34" />
      <g clipPath={`url(#pd-bowl-${uid})`} fill="rgb(0 40 0 / 0.14)" stroke="none">
        {bumps.map(([x]) => (
          <ellipse key={x} cx={x} cy="84" rx="12" ry="9" />
        ))}
      </g>
      <g className="pd-in">
        <path d="M17 54Q70 60 123 53Q114 76 70 78Q26 76 17 54Z" fill="#c6ec92" />
        {[34, 57, 81, 104].map((x, i) => (
          <g key={x} className="pd-pea" style={{ "--i": i } as CSSProperties}>
            <circle cx={x} cy={i % 2 ? 59 : 60} r="11" fill="#86d24a" />
            <circle cx={x - 3.6} cy={i % 2 ? 55 : 56} r="2.6" fill="#fff" fillOpacity="0.6" stroke="none" />
          </g>
        ))}
      </g>
      <g className="pd-lid">
        <path d={lid} fill="#6fc13f" />
        <g clipPath={`url(#pd-lid-${uid})`} stroke="none">
          {bumps.map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="11" ry="8" fill="rgb(255 255 255 / 0.2)" />
          ))}
        </g>
        <path d="M16 50Q70 24 124 48" fill="none" stroke="#a8e070" strokeWidth="3" />
        <path d="M8 52Q-2 46 4 36" fill="none" />
      </g>
    </Sticker>
  );
}

function Toy({
  kind,
  hint,
  big,
  small,
  on,
  onToggle,
  children,
}: {
  kind: string;
  hint: string;
  big: string;
  small: string;
  on: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <li className="toy" data-kind={kind} data-on={on || undefined}>
      <button type="button" className="toy-btn" aria-pressed={on} onClick={onToggle}>
        <span className="toy-art" aria-hidden="true">
          <span className="toy-bob">{children}</span>
        </span>
        <span className="toy-copy">
          <span className="toy-hint">{hint}</span>
          <span className="toy-say">
            <b>{big}</b>
            <span>{small}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function FoodToys({ pillars, hints }: { pillars: readonly (readonly string[])[]; hints: readonly string[] }) {
  const [peeled, setPeeled] = useState(false);
  const [bites, setBites] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <ul className="toys">
      <Toy kind="banana" hint={hints[0]} big={pillars[0][0]} small={pillars[0][1]} on={peeled} onToggle={() => setPeeled((v) => !v)}>
        <Banana />
      </Toy>
      <Toy kind="cookie" hint={hints[1]} big={pillars[1][0]} small={pillars[1][1]} on={bites > 0} onToggle={() => setBites((n) => (n + 1) % (BITES.length + 1))}>
        <Cookie bites={bites} />
      </Toy>
      <Toy kind="pod" hint={hints[2]} big={pillars[2][0]} small={pillars[2][1]} on={open} onToggle={() => setOpen((v) => !v)}>
        <PeaPod />
      </Toy>
    </ul>
  );
}
