import type { ReactNode, SVGProps } from "react";

/**
 * Seven hand-drawn grocery stickers for the home hero. Each one is plain SVG with a
 * shared ink outline; the white die-cut border comes from one dilate filter
 * (GoodsDefs), so the border follows every silhouette without extra paths.
 */

const INK = "#1c1a17";
const CREAM = "#fff8e7";

/** Serrated edge from x0 to x1 along y; negative `a` points the teeth down. */
function zig(x0: number, x1: number, y: number, a: number, n: number) {
  const step = (x1 - x0) / n;
  let d = "";
  for (let i = 0; i < n; i++) d += `L${x0 + step * (i + 0.5)} ${y - a}L${x0 + step * (i + 1)} ${y}`;
  return d;
}

/** Same as zig, running down a vertical edge at x; teeth point left. */
function zigV(y0: number, y1: number, x: number, a: number, n: number) {
  const step = (y1 - y0) / n;
  let d = "";
  for (let i = 0; i < n; i++) d += `L${x - a} ${y0 + step * (i + 0.5)}L${x} ${y0 + step * (i + 1)}`;
  return d;
}

function Art({ box, children }: { box: string; children: ReactNode }) {
  return (
    <svg viewBox={box} overflow="visible" aria-hidden="true" focusable="false">
      <g filter="url(#hg-die)" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

const T = (props: SVGProps<SVGTextElement>) => (
  <text stroke="none" textAnchor="middle" fontFamily="Anton, sans-serif" {...props} />
);
const Small = (props: SVGProps<SVGTextElement>) => (
  <T fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" letterSpacing="0.6" {...props} />
);

/** Filter + pattern the stickers reference. Render once, anywhere in the page. */
export function GoodsDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="hg-die" x="-12%" y="-12%" width="124%" height="124%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="4.6" result="grown" />
          <feFlood floodColor="#fff" />
          <feComposite in2="grown" operator="in" result="border" />
          <feMerge>
            <feMergeNode in="border" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="hg-ging" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#fff" />
          <rect width="4" height="8" fill="rgb(214 38 58 / 0.5)" />
          <rect width="8" height="4" fill="rgb(214 38 58 / 0.5)" />
        </pattern>
      </defs>
    </svg>
  );
}

export function Soda() {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return { x: 42 + Math.cos(a) * 9.4, y: 81 + Math.sin(a) * 9.4 };
  });
  return (
    <Art box="0 0 84 150">
      <path d="M21 12h42l7 12H14z" fill="#e3e6ea" />
      <rect x="34" y="14.5" width="16" height="6" rx="3" fill="#b4bac2" strokeWidth="1.4" />
      <rect x="14" y="24" width="56" height="5" fill="#bcc2c9" />
      <rect x="14" y="29" width="56" height="98" fill="#ff6a2b" />
      <path d="M14 62c10-6 18 4 28-1s18-6 28-1v40c-10 6-18-4-28 1s-18 6-28 1z" fill={CREAM} stroke="none" />
      <circle cx="42" cy="81" r="13" fill="#ffb03a" strokeWidth="1.6" />
      <circle cx="42" cy="81" r="10" fill="#d4213d" strokeWidth="1.2" />
      <g stroke="#ffd9c7" strokeWidth="1.1">
        {rays.map((p, i) => (
          <line key={i} x1="42" y1="81" x2={p.x} y2={p.y} />
        ))}
      </g>
      <path d="M50 70c4-6 10-6 13-4-3 5-8 7-13 4z" fill="#3f8f3a" strokeWidth="1.4" />
      <T x="42" y="43" fontSize="12" fill={CREAM} letterSpacing="0.8">BLOOD</T>
      <T x="42" y="56" fontSize="12" fill={CREAM} letterSpacing="0.8">ORANGE</T>
      <Small x="42" y="118" fontSize="5.4" fill={CREAM}>SPARKLING · 330ML</Small>
      <g stroke="none">
        <rect x="56" y="29" width="14" height="98" fill="rgb(70 10 0 / 0.2)" />
        <rect x="19" y="31" width="4" height="94" rx="2" fill="rgb(255 255 255 / 0.5)" />
        <rect x="25" y="31" width="1.6" height="94" fill="rgb(255 255 255 / 0.28)" />
      </g>
      <rect x="14" y="29" width="56" height="98" fill="none" />
      <path d="M14 127h56l-6 11H20z" fill="#c9ced4" />
    </Art>
  );
}

export function Ramen() {
  return (
    <Art box="0 0 128 146">
      <path d={`M16 118Q64 124 112 118V130${zig(112, 16, 130, -4, 12)}Z`} fill="#a3170f" />
      <path d={`M12 28V14${zig(12, 116, 14, 4, 13)}V28Q64 22 12 28Z`} fill="#a3170f" />
      <g stroke="rgb(0 0 0 / 0.28)" strokeWidth="1">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`t${i}`} x1={18 + i * 8.4} y1="16" x2={18 + i * 8.4} y2="25" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`b${i}`} x1={21 + i * 8.6} y1="122" x2={21 + i * 8.6} y2="129" />
        ))}
      </g>
      <path d="M12 28Q64 22 116 28L112 118Q64 124 16 118Z" fill="#d9261c" />
      <circle cx="64" cy="95" r="26" fill="#ef4b26" stroke="none" />
      <g fill="none" stroke={CREAM} strokeWidth="1.8">
        <path d="M54 80c-3-4 3-6 0-10" />
        <path d="M64 78c-3-4 3-6 0-10" />
        <path d="M74 80c-3-4 3-6 0-10" />
      </g>
      <path d="M40 91q4-8 8 0q4-8 8 0q4-8 8 0q4-8 8 0q4-8 8 0q4-8 8 0z" fill="#ffd36b" strokeWidth="1.5" />
      <ellipse cx="77" cy="87" rx="7" ry="5" fill="#fff" strokeWidth="1.4" />
      <circle cx="77" cy="87" r="2.8" fill="#ffa51f" stroke="none" />
      <circle cx="50" cy="87" r="1.8" fill="#6fbf4a" strokeWidth="1" />
      <circle cx="56" cy="85" r="1.8" fill="#6fbf4a" strokeWidth="1" />
      <path d="M38 91H90Q89 109 64 111Q39 109 38 91Z" fill={CREAM} />
      <path d={`M43 99${zig(43, 85, 99, 3, 7)}`} fill="none" stroke="#d9261c" strokeWidth="1.4" />
      <rect x="56" y="110" width="16" height="4" rx="1" fill={CREAM} strokeWidth="1.6" />
      <line x1="97" y1="66" x2="68" y2="92" strokeWidth="3.6" />
      <line x1="97" y1="66" x2="68" y2="92" stroke="#e9b97a" strokeWidth="1.6" />
      <line x1="102" y1="70" x2="72" y2="95" strokeWidth="3.6" />
      <line x1="102" y1="70" x2="72" y2="95" stroke="#e9b97a" strokeWidth="1.6" />
      <T x="64" y="44" fontSize="13" fill={CREAM} letterSpacing="2">SPICY</T>
      <T x="64" y="64" fontSize="21" fill="#ffd36b" letterSpacing="0.6">RAMEN</T>
      <g stroke="none">
        <path d="M20 32Q22 75 22 114L26 114Q26 75 25 31Z" fill="rgb(255 255 255 / 0.28)" />
        <path d="M104 30L116 28L112 118L101 119Q104 75 104 30Z" fill="rgb(60 0 0 / 0.2)" />
      </g>
      <path d="M12 28Q64 22 116 28L112 118Q64 124 16 118Z" fill="none" />
    </Art>
  );
}

export function ChocBar() {
  const body = "M22 18H132l-4 6 5 5-4 6 4 5-5 6 4 5-4 6 4 5H22Z";
  return (
    <Art box="0 0 180 80">
      <rect x="126" y="24" width="40" height="33" rx="4" fill="#6b3a1e" />
      <g stroke="none">
        <rect x="130" y="27" width="10" height="27" rx="2" fill="#85502c" />
        <rect x="143" y="27" width="10" height="27" rx="2" fill="#85502c" />
        <rect x="156" y="27" width="7" height="27" rx="2" fill="#85502c" />
      </g>
      <g stroke="#4a2512" strokeWidth="1.2">
        <line x1="141.5" y1="25" x2="141.5" y2="56" />
        <line x1="154.5" y1="25" x2="154.5" y2="56" />
      </g>
      <path d="M124 21H141l3 5-3 5 3 5-3 5 3 5-3 5 3 5-3 4H124Z" fill="#dfe4ea" strokeWidth="1.6" />
      <path d={`M22 18H10${zigV(18, 62, 10, 4, 6)}H22Z`} fill="#4f2aa8" />
      <g stroke="rgb(0 0 0 / 0.3)" strokeWidth="1">
        {[25, 32, 39, 46, 53].map((y) => (
          <line key={y} x1="11" y1={y} x2="21" y2={y} />
        ))}
      </g>
      <path d={body} fill="#6c3fd8" />
      <path d="M22 50c8 6 14-4 22 2s14 6 22 0 14-6 22 0 14 6 22 0 12-4 18 0l-1 10H22Z" fill="#7b4325" stroke="none" />
      <circle cx="40" cy="56" r="1.4" fill="#a8693d" stroke="none" />
      <circle cx="86" cy="57" r="1.4" fill="#a8693d" stroke="none" />
      <rect x="24" y="21" width="102" height="2.4" rx="1.2" fill="rgb(255 255 255 / 0.3)" stroke="none" />
      <T x="74" y="38" fontSize="15" fill="#fff" letterSpacing="0.8">CHOC BISCUIT</T>
      <Small x="74" y="46.5" fontSize="5.4" fill="#e7ddff">MILK CHOCOLATE · WAFER</Small>
      <path d={body} fill="none" />
    </Art>
  );
}

export function OliveOil() {
  const glass =
    "M29 33H43V46Q43 54 51 60Q58 66 58 78V160Q58 168 50 168H22Q14 168 14 160V78Q14 66 21 60Q29 54 29 46Z";
  return (
    <Art box="0 0 72 176">
      <rect x="26" y="8" width="20" height="16" rx="2.5" fill="#d9a62e" />
      <g stroke="rgb(0 0 0 / 0.25)" strokeWidth="1">
        {[30.5, 34.5, 38.5, 42.5].map((x) => (
          <line key={x} x1={x} y1="10.5" x2={x} y2="21.5" />
        ))}
      </g>
      <rect x="27.5" y="24" width="17" height="9" fill="#e9bf4a" />
      <path d={glass} fill="#4f7d2b" />
      <path d="M14 100Q36 90 58 100V146H14Z" fill={CREAM} />
      <path d="M22 114Q35 106 50 104" fill="none" stroke="#4f7d2b" strokeWidth="1.5" />
      <g fill="#86a23f" strokeWidth="1">
        <path d="M27 111q2-6 8-6-2 5-8 6z" />
        <path d="M37 107q3-5 9-4-3 5-9 4z" />
        <path d="M31 112q6-1 8 4-6 1-8-4z" />
        <path d="M42 106q6 0 7 5-6 0-7-5z" />
      </g>
      <ellipse cx="30" cy="117" rx="2.8" ry="3.6" fill="#2d3f12" strokeWidth="1.2" />
      <ellipse cx="44" cy="112" rx="2.8" ry="3.6" fill="#2d3f12" strokeWidth="1.2" />
      <T x="36" y="131" fontSize="8.4" fill="#2f4d18" letterSpacing="0.5">OLIVE OIL</T>
      <Small x="36" y="139" fontSize="5" fill="#8a6a1a">EXTRA VIRGIN</Small>
      <g stroke="none">
        <rect x="18" y="80" width="3.5" height="78" rx="1.75" fill="rgb(255 255 255 / 0.4)" />
        <rect x="31" y="34" width="2.4" height="14" rx="1.2" fill="rgb(255 255 255 / 0.4)" />
        <rect x="49" y="78" width="9" height="82" fill="rgb(0 20 0 / 0.22)" />
      </g>
      <path d={glass} fill="none" />
    </Art>
  );
}

export function OatMilk() {
  return (
    <Art box="0 0 100 168">
      <path d="M62 54L86 46V152L62 160Z" fill="#bcd9f0" />
      <path d="M62 120c8-4 16-6 24-8V152L62 160Z" fill="#4f9be0" stroke="none" />
      <g stroke="rgb(31 79 134 / 0.4)" strokeWidth="1.2">
        <line x1="67" y1="76" x2="81" y2="71.3" />
        <line x1="67" y1="82" x2="81" y2="77.3" />
        <line x1="67" y1="88" x2="77" y2="84.6" />
      </g>
      <path d="M62 54L86 46V152L62 160Z" fill="none" />
      <rect x="14" y="54" width="48" height="106" fill={CREAM} />
      <path d="M14 120c8-5 16 3 24-1s16-5 24 0V160H14Z" fill="#6bb8ff" stroke="none" />
      <line x1="38" y1="155" x2="38" y2="128" stroke={CREAM} strokeWidth="1.4" />
      <g fill={CREAM} stroke="none">
        <ellipse cx="38" cy="127" rx="2" ry="3.4" />
        <ellipse cx="34.6" cy="134" rx="2" ry="3.4" transform="rotate(-28 34.6 134)" />
        <ellipse cx="41.4" cy="138" rx="2" ry="3.4" transform="rotate(28 41.4 138)" />
        <ellipse cx="34.6" cy="143" rx="2" ry="3.4" transform="rotate(-28 34.6 143)" />
        <ellipse cx="41.4" cy="147" rx="2" ry="3.4" transform="rotate(28 41.4 147)" />
      </g>
      <Small x="38" y="66" fontSize="5.4" fill="#4f9be0" letterSpacing="1.2">BARISTA</Small>
      <T x="38" y="83" fontSize="15" fill="#1f4f86" letterSpacing="0.6">OAT</T>
      <T x="38" y="100" fontSize="15" fill="#1f4f86" letterSpacing="0.6">MILK</T>
      <rect x="14" y="54" width="48" height="106" fill="none" />
      <path d="M38 28L62 20L86 46L62 54Z" fill="#4f9be0" />
      <path d="M14 54L38 28L62 54Z" fill="#6bb8ff" />
      <path d="M38 28L62 20V13L38 21Z" fill="#e8f2fb" />
      <rect x="58" y="30" width="12" height="7" rx="2" fill="#f6b531" strokeWidth="1.6" />
      <ellipse cx="64" cy="30" rx="6" ry="2.4" fill="#ffd36b" strokeWidth="1.6" />
    </Art>
  );
}

export function Jam() {
  return (
    <Art box="0 0 112 128">
      <path d="M22 48H90V54Q100 58 100 70V108Q100 122 86 122H26Q12 122 12 108V70Q12 58 22 54Z" fill="#c41d38" />
      <rect x="20" y="44" width="72" height="10" rx="3" fill="#9c1229" />
      <path
        d="M14 34Q20 18 56 16Q92 18 98 34L102 48Q95 52 89 47Q82 53 74 48Q65 53 56 48Q47 53 38 48Q30 53 23 47Q17 52 10 48Z"
        fill="url(#hg-ging)"
      />
      <path d="M14 41Q56 47 98 41" fill="none" strokeWidth="4.4" />
      <path d="M14 41Q56 47 98 41" fill="none" stroke="#f3e2b8" strokeWidth="2.2" />
      <path d="M78 44c-7-8-14-2-9 3zM80 44c6-8 14-3 9 3z" fill="#f3e2b8" strokeWidth="1.4" />
      <path d="M78 45l-5 8M80 45l4 8" stroke="#f3e2b8" strokeWidth="1.6" />
      <circle cx="56" cy="87" r="23" fill={CREAM} />
      <path
        d="M56 92C47 86 47 76 50 74C52 72 54 73 56 74C58 73 60 72 62 74C65 76 65 86 56 92Z"
        fill="#e8323f"
        strokeWidth="1.4"
      />
      <path d="M50 74l3-3 3 2 3-2 3 3-3 1-3-1-3 1z" fill="#3f9a3a" strokeWidth="1.2" />
      <g fill="#ffd36b" stroke="none">
        <circle cx="53" cy="79" r="0.9" />
        <circle cx="59" cy="79" r="0.9" />
        <circle cx="56" cy="83" r="0.9" />
        <circle cx="52.5" cy="85" r="0.9" />
        <circle cx="59.5" cy="85" r="0.9" />
      </g>
      <Small x="56" y="99" fontSize="5" fill="#9c1229">STRAWBERRY</Small>
      <T x="56" y="107.5" fontSize="8" fill="#9c1229" letterSpacing="1">JAM</T>
      <g stroke="none">
        <path d="M20 66Q20 60 25 58V110Q20 108 20 102Z" fill="rgb(255 255 255 / 0.45)" />
        <rect x="28" y="62" width="2" height="40" rx="1" fill="rgb(255 255 255 / 0.3)" />
        <path d="M88 60Q96 62 96 72V106Q96 116 88 118Z" fill="rgb(60 0 10 / 0.22)" />
      </g>
    </Art>
  );
}

export function Gelato() {
  const body = "M18 32H106L97 100Q62 108 27 100Z";
  return (
    <Art box="0 0 124 116">
      <path d={body} fill="#ffb3c9" />
      <path d="M19.5 46H104.5L101 84H23Z" fill={CREAM} stroke="none" />
      <line x1="19.5" y1="46" x2="104.5" y2="46" strokeWidth="1.4" />
      <line x1="23" y1="84" x2="101" y2="84" strokeWidth="1.4" />
      <path d="M34 66L40 82L46 66Z" fill="#e6a656" strokeWidth="1.4" />
      <path d="M36 70l7 6M44 70l-7 6" stroke="#b77a32" strokeWidth="1" />
      <circle cx="40" cy="62" r="6" fill="#ff8fb1" strokeWidth="1.4" />
      <circle cx="40" cy="54.5" r="5" fill="#fff1d6" strokeWidth="1.4" />
      <T x="75" y="66" fontSize="15" fill="#c2185b" letterSpacing="1">GELATO</T>
      <Small x="74" y="75" fontSize="4.5" fill="#c2185b" letterSpacing="0.3">STRAWBERRY &amp; CREAM</Small>
      <g stroke="none">
        <path d="M92 34H106L97 100Q95 101 89 102Z" fill="rgb(120 0 40 / 0.16)" />
        <path d="M24 36H28L33 98H30Z" fill="rgb(255 255 255 / 0.45)" />
      </g>
      <path d={body} fill="none" />
      <path d="M27 100Q62 108 97 100L96 106Q62 114 28 106Z" fill="#e2457a" />
      <rect x="10" y="18" width="104" height="16" rx="6" fill="#e2457a" />
      <path d="M30 34v6a3 3 0 0 0 6 0v-2a3 3 0 0 0 6 0v-4z" fill="#e2457a" strokeWidth="1.6" />
      <rect x="16" y="21" width="70" height="2.4" rx="1.2" fill="rgb(255 255 255 / 0.45)" stroke="none" />
    </Art>
  );
}
