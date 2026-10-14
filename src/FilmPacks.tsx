/**
 * The two packs in the film's label scene, drawn in three-quarter view: a
 * box of corn flakes and a carton of milk. Same ink outline as the rest of
 * the site's art, but with a real front, side and top, so they read as
 * products on a shelf rather than flat icons. Made-up brand, no logos.
 */

const INK = "#141414";
const CREAM = "#fffaf0";

/** Sun rays behind the bowl, as thin wedges around (88, 206). */
const RAYS = Array.from({ length: 14 }, (_, k) => {
  const a = (k * 360) / 14;
  const p = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return `${(88 + 180 * Math.cos(r)).toFixed(1)} ${(206 + 180 * Math.sin(r)).toFixed(1)}`;
  };
  return `M88 206L${p(a - 4.5)}L${p(a + 4.5)}Z`;
}).join("");

/** Flakes heaped in the bowl, and a few falling into it. */
const HEAP = [
  { d: "M50 212l9-10 13 3-2 9z", fill: "#e98f2c" },
  { d: "M64 205l11-11 14 5-5 11z", fill: "#f5b043" },
  { d: "M84 203l8-12 16 2-1 13z", fill: "#e98f2c" },
  { d: "M101 206l12-9 10 7-7 9z", fill: "#f8c25a" },
  { d: "M74 212l10-7 13 4-3 6z", fill: "#f0a238" },
  { d: "M112 213l9-6 8 6z", fill: "#e98f2c" },
];
const FALLING = [
  { d: "M70 170l7-5 7 3-4 6z", fill: "#f5b043" },
  { d: "M104 178l6-6 7 4-5 5z", fill: "#e98f2c" },
  { d: "M88 160l5-6 7 2-3 6z", fill: "#f8c25a" },
];

export function CerealBox() {
  return (
    <svg className="pk" viewBox="0 0 220 300" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="cb-front">
          <rect x="18" y="46" width="140" height="240" rx="3" />
        </clipPath>
        <linearGradient id="cb-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc843" />
          <stop offset="1" stopColor="#f2a51d" />
        </linearGradient>
        <linearGradient id="cb-side" x1="0" x2="1">
          <stop offset="0" stopColor="#dd951b" />
          <stop offset="1" stopColor="#bd7a0f" />
        </linearGradient>
      </defs>

      {/* top and side */}
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M18 46L58 32H198L158 46Z" fill="#ffd977" />
        <path d="M158 46L198 32V272L158 286Z" fill="url(#cb-side)" />
        <path d="M158 46L198 32V70L158 84Z" fill="#00382a" />
        <path d="M58 32L62 40H186" fill="none" strokeWidth="1.4" opacity="0.5" />
      </g>
      <g stroke={CREAM} strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M168 112l20-7M168 124l20-7M168 136l14-5M168 160l20-7M168 172l20-7M168 184l11-4" />
      </g>

      {/* front */}
      <rect x="18" y="46" width="140" height="240" rx="3" fill="url(#cb-face)" />
      <g clipPath="url(#cb-front)">
        <path d={RAYS} fill="#ffdc7a" opacity="0.55" />
        <circle cx="88" cy="206" r="56" fill="#ffe399" />
        <rect x="18" y="46" width="140" height="40" fill="#00382a" />
        <rect x="18" y="86" width="140" height="3" fill={CREAM} />
        <rect x="18" y="270" width="140" height="16" fill="#00382a" />
        <path d="M18 46H66L18 156Z" fill="#fff" opacity="0.14" />
      </g>

      {/* wordmark */}
      <text className="pk-caps" x="88" y="72" textAnchor="middle" fill={CREAM}>
        CORN
      </text>
      <g transform="rotate(-6 88 130)">
        <text className="pk-word" x="88" y="140" textAnchor="middle" fill="none" stroke={CREAM} strokeWidth="9" strokeLinejoin="round">
          Flakes
        </text>
        <text className="pk-word" x="88" y="140" textAnchor="middle" fill="#e3261b" stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
          Flakes
        </text>
      </g>

      {/* the bowl, with flakes falling into it */}
      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        {FALLING.map((f) => (
          <path key={f.d} d={f.d} fill={f.fill} />
        ))}
        <path d="M42 214Q46 258 88 258Q130 258 134 214Z" fill={CREAM} strokeWidth="2.4" />
        <ellipse cx="88" cy="214" rx="46" ry="9" fill="#efe3c3" />
        {HEAP.map((f) => (
          <path key={f.d} d={f.d} fill={f.fill} />
        ))}
        <path d="M42 214Q88 230 134 214" fill="none" strokeWidth="2.4" />
        <path d="M52 236Q88 248 124 236" fill="none" stroke="#005842" strokeWidth="3.4" strokeLinecap="round" />
      </g>

      <text className="pk-small" x="26" y="282" fill={CREAM}>
        725 G
      </text>
      <rect x="18" y="46" width="140" height="240" rx="3" fill="none" stroke={INK} strokeWidth="2.6" />
    </svg>
  );
}

export function MilkCarton() {
  return (
    <svg className="pk" viewBox="0 0 160 300" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="mk-front">
          <path d="M20 96L62 62L104 96V286H20Z" />
        </clipPath>
      </defs>

      {/* side, roof and the sealed fin on top */}
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M104 96L140 84V274L104 286Z" fill="#d8d3c2" />
        <path d="M62 62L98 50L140 84L104 96Z" fill="#4f98e3" />
        <path d="M62 62V50L98 38V50Z" fill="#eef1f4" />
      </g>
      <path d="M104 238Q122 230 140 228V274L104 286Z" fill="#4f98e3" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />

      {/* front */}
      <path d="M20 96L62 62L104 96V286H20Z" fill="#f7f4ea" />
      <g clipPath="url(#mk-front)">
        <path d="M20 96L62 62L104 96Z" fill="#6bb8ff" />
        <path d="M20 240C36 228 52 250 68 238S96 228 104 234V286H20Z" fill="#6bb8ff" />
        <path d="M20 262C40 252 60 272 104 256V286H20Z" fill="#2f7fd8" />
        <path d="M20 96H42L20 176Z" fill="#fff" opacity="0.35" />
      </g>
      <path d="M20 96H104" stroke={INK} strokeWidth="2" />

      <text className="pk-caps pk-caps-sm" x="62" y="128" textAnchor="middle" fill="#1f5fae">
        FRESH
      </text>
      <text className="pk-word pk-word-sm" x="62" y="168" textAnchor="middle" fill="none" stroke={CREAM} strokeWidth="8" strokeLinejoin="round">
        Milk
      </text>
      <text className="pk-word pk-word-sm" x="62" y="168" textAnchor="middle" fill="#2f6fd1" stroke={INK} strokeWidth="1.4" strokeLinejoin="round">
        Milk
      </text>
      <text className="pk-small" x="62" y="280" textAnchor="middle" fill={CREAM}>
        1 L
      </text>
      <path d="M20 96L62 62L104 96V286H20Z" fill="none" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}
