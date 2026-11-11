import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useT } from "./i18n";
import { truckSceneStrings } from "./i18n/strings/TruckScene";
import { pauseWhenOffscreen } from "./offscreen";
import "./truckscene.css";

/*
 * The art is drawn on a 640×400 grid. Every part that moves is its own absolutely
 * placed layer (an SVG cropped to its box, or a plain div), so the whole loop runs
 * on transform and opacity and the drawing itself is never repainted.
 * The 14s story: the truck backs in, the curtain opens, three loads roll out of
 * the warehouse and into the bay, the curtain closes and the truck drives off.
 */
const W = 640;
const H = 400;

const C = {
  g: "#005842",
  g700: "#004734",
  g900: "#00382a",
  sage: "#9cad9b",
  sage200: "#c9d6c8",
  cream: "#f6f0db",
  cream200: "#ebe3c4",
  paper: "#fefcf7",
  sun: "#f6b531",
  sunDk: "#d99a1c",
  tomato: "#e3261b",
  orange: "#ff9a3d",
  tyre: "#1a1f1d",
};
const COND = "'Barlow Condensed', 'Arial Narrow', sans-serif";

type Box = readonly [x: number, y: number, w: number, h: number];
const Frame = createContext<Box>([0, 0, W, H]);
const around = (cx: number, cy: number, r: number): Box => [cx - r, cy - r, r * 2, r * 2];
const pct = (n: number) => `${+(n * 100).toFixed(4)}%`;

/** Where `box` sits inside the layer it is drawn in, as percentages. */
function usePlace([x, y, w, h]: Box): CSSProperties {
  const [fx, fy, fw, fh] = useContext(Frame);
  return { left: pct((x - fx) / fw), top: pct((y - fy) / fh), width: pct(w / fw), height: pct(h / fh) };
}

/** A drawing in scene coordinates, cropped to `box` (or drawn in `view` and fitted to it). */
function Art({ box, view, className, style, children }: { box: Box; view?: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  const place = usePlace(box);
  return (
    <svg className={className ? `ts-art ${className}` : "ts-art"} viewBox={view ?? box.join(" ")} style={{ ...place, ...style }} aria-hidden="true">
      {children}
    </svg>
  );
}

/** A div over `box`; anything inside it is placed relative to it, and moves with it. */
function Layer({ box, className, style, children }: { box: Box; className: string; style?: CSSProperties; children?: ReactNode }) {
  const place = usePlace(box);
  return (
    <div className={`ts-layer ${className}`} style={{ ...place, ...style }}>
      {children && <Frame.Provider value={box}>{children}</Frame.Provider>}
    </div>
  );
}

/** A drawing that moves. The div is what gets animated: Chrome keeps transforms on an <svg> off the compositor. */
function Moving({ box, view, className, style, children }: { box: Box; view?: string; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <Layer box={box} className={className} style={style}>
      <Art box={box} view={view}>
        {children}
      </Art>
    </Layer>
  );
}

/** The cart-in-a-circle mark, drawn at any size. */
function Mark({ cx, cy, r, bg, fg }: { cx: number; cy: number; r: number; bg: string; fg: string }) {
  return (
    <g transform={`translate(${cx - r} ${cy - r}) scale(${r / 24})`}>
      <circle cx="24" cy="24" r="24" fill={bg} />
      <path d="M11.5 14.5h4.3l3.2 14.6a1.7 1.7 0 0 0 1.7 1.3h12.2a1.7 1.7 0 0 0 1.7-1.3l2.4-10.4H17.2" fill="none" stroke={fg} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21.8" cy="35.4" r="2" fill={fg} />
      <circle cx="32.6" cy="35.4" r="2" fill={fg} />
    </g>
  );
}

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

/* x is where each cloud sits when the scene is still */
const CLOUDS = [
  { x: 70, y: 92, w: 62, opacity: 0.35, dur: "84s", delay: "-12s" },
  { x: 470, y: 56, w: 50, opacity: 0.3, dur: "84s", delay: "-62s" },
  { x: 60, y: 28, w: 104, opacity: 0.95, dur: "46s", delay: "-8s" },
  { x: 380, y: 70, w: 82, opacity: 0.85, dur: "46s", delay: "-31s" },
];

/** Starts just off the left edge and drifts across; far ones are smaller, fainter and slower. */
function Cloud({ x, y, w, opacity, dur, delay }: (typeof CLOUDS)[number]) {
  return (
    <Moving box={[-w, y, w, w * 0.4]} view="0 0 100 40" className="ts-cloud" style={{ opacity, animationDuration: dur, animationDelay: delay, "--w": w, "--x": x } as CSSProperties}>
      <circle cx="30" cy="24" r="14" fill={C.cream} />
      <circle cx="56" cy="18" r="18" fill={C.cream} />
      <circle cx="79" cy="26" r="11" fill={C.cream} />
      <rect x="4" y="24" width="92" height="16" rx="8" fill={C.cream} />
      <rect x="14" y="34" width="72" height="6" rx="3" fill={C.cream200} />
    </Moving>
  );
}

/** Everything that never moves: hills, warehouse, yard, conveyor and road. */
function Land() {
  const s = useT(truckSceneStrings);
  return (
    <Art box={[0, 0, W, H]} className="ts-land">
      {/* hills and trees */}
      <path d="M0 206C64 170 150 166 232 192S392 174 468 186S596 158 640 172V330H0Z" fill="#2a8667" />
      <path d="M0 232C84 204 172 210 252 230S424 212 502 224S604 204 640 212V330H0Z" fill="#0a5c45" />
      {[[8, 228, 7], [372, 214, 8], [390, 221, 6], [458, 213, 7], [536, 205, 8], [553, 211, 6], [612, 203, 8], [628, 209, 6]].map(([x, y, r]) => (
        <g key={x} fill={C.g700}>
          <rect x={x - 1} y={y} width="2" height={r + 4} />
          <circle cx={x} cy={y} r={r} />
        </g>
      ))}

      {/* yard */}
      <rect y="318" width={W} height="24" fill="#245a49" />
      {[64, 176, 400, 520].map((x) => (
        <rect key={x} x={x} y="318" width="1.4" height="20" fill={C.g900} opacity="0.35" />
      ))}

      {/* warehouse: sawtooth roof with skylights */}
      {[[22, 127], [127, 232], [232, 336]].map(([a, b]) => (
        <g key={a}>
          <path d={`M${a} 127L${b} 98V127Z`} fill={C.g900} />
          <rect x={b - 8} y="101" width="8" height="26" fill="#a3b9ab" />
          <rect x={b - 5.5} y="103" width="2" height="22" fill={C.paper} opacity="0.75" />
        </g>
      ))}
      <rect x="22" y="126" width="314" height="194" fill={C.sage200} />
      {range(34, 330, 10).map((x) => (
        <rect key={x} x={x} y="154" width="1.2" height="150" fill="#b4c4b3" />
      ))}
      <rect x="22" y="304" width="314" height="16" fill={C.sage} />
      {/* sign band */}
      <rect x="22" y="126" width="314" height="28" fill={C.g900} />
      <Mark cx={42} cy={140} r={10} bg={C.sun} fg={C.g900} />
      <text x="58" y="144.6" fill={C.cream} fontFamily={COND} fontWeight="700" fontSize="12.5" letterSpacing="1.8">
        CHEAPER BUY MILES
      </text>
      <text x="326" y="143.8" textAnchor="end" fill={C.sage} fontFamily={COND} fontWeight="600" fontSize="8.5" letterSpacing="1.6">
        {s.distribution}
      </text>
      {/* clerestory windows */}
      {range(34, 286, 42).map((x) => (
        <g key={x}>
          <rect x={x} y="162" width="30" height="14" rx="2" fill={C.g700} />
          <rect x={x + 2} y="164" width="26" height="10" rx="1" fill="#8fa999" />
          <path d={`M${x + 9} 174l6-10h4l-6 10z`} fill={C.paper} opacity="0.5" />
        </g>
      ))}
      <rect x="24" y="154" width="4" height="166" fill={C.sage} />
      {[184, 244, 296].map((y) => (
        <rect key={y} x="22.5" y={y} width="7" height="2" fill="#869985" />
      ))}

      {/* bay 1: closed roller door */}
      <rect x="32" y="196" width="82" height="10" rx="2" fill={C.g700} />
      <rect x="66" y="198" width="14" height="6" rx="1.5" fill={C.sun} />
      <text x="73" y="203.3" textAnchor="middle" fill={C.g900} fontFamily={COND} fontWeight="700" fontSize="6">1</text>
      <rect x="34" y="206" width="78" height="114" fill={C.g900} />
      <rect x="38" y="208" width="70" height="112" fill={C.g} />
      {range(212, 311, 9).map((y) => (
        <rect key={y} x="38" y={y} width="70" height="1.6" fill={C.g900} opacity="0.45" />
      ))}
      <rect x="38" y="313" width="70" height="5" fill={C.g700} />
      <rect x="69" y="306" width="8" height="3" rx="1.5" fill={C.cream200} />

      {/* bay 2: open, racking inside, conveyor running out */}
      <rect x="120" y="196" width="84" height="10" rx="2" fill={C.g700} />
      <rect x="155" y="198" width="14" height="6" rx="1.5" fill={C.sun} />
      <text x="162" y="203.3" textAnchor="middle" fill={C.g900} fontFamily={COND} fontWeight="700" fontSize="6">2</text>
      <rect x="122" y="206" width="80" height="114" fill={C.g900} />
      <rect x="126" y="210" width="72" height="110" fill="#04241b" />
      <path d="M150 218h24l20 78h-64z" fill={C.cream} opacity="0.05" />
      {[132, 160, 188].map((x) => (
        <rect key={x} x={x} y="220" width="3" height="76" fill="#0e3a2e" />
      ))}
      {[238, 266].map((y) => (
        <rect key={y} x="132" y={y} width="59" height="2.5" fill={C.sunDk} opacity="0.45" />
      ))}
      {[[137, 226, 20, 12], [164, 228, 21, 10], [137, 254, 14, 12], [164, 252, 22, 14]].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={C.sage} opacity="0.18" />
      ))}
      <rect x="126" y="208" width="72" height="9" fill={C.g} />
      <rect x="126" y="212" width="72" height="1.4" fill={C.g900} opacity="0.45" />
      <rect x="126" y="215" width="72" height="3" fill={C.g700} />
      <rect x="126" y="298" width="72" height="6" fill="#2b473d" />
      {/* dock signal (its lit lamps are separate layers) */}
      <rect x="205" y="210" width="11" height="26" rx="3" fill={C.g900} />
      <circle cx="210.5" cy="217" r="3.2" fill="#5b231d" />
      <circle cx="210.5" cy="229" r="3.2" fill="#1c4a37" />
      {/* wall lamps */}
      {[64, 153].map((x) => (
        <g key={x} fill={C.g900}>
          <path d={`M${x} 196v-7a4 4 0 0 1 4-4h6`} fill="none" stroke={C.g900} strokeWidth="2" />
          <path d={`M${x + 7} 183h10l-2 4h-6z`} />
        </g>
      ))}

      {/* staff door + bollard */}
      <rect x="222" y="258" width="26" height="62" fill={C.g900} />
      <rect x="225" y="261" width="20" height="59" fill={C.g} />
      <rect x="229" y="266" width="12" height="12" rx="1" fill="#8fa999" />
      <rect x="240" y="290" width="3" height="6" rx="1" fill={C.cream200} />
      <path d="M235 254v-6h6" fill="none" stroke={C.g900} strokeWidth="2" />
      <path d="M238 244h10l-2 4h-6z" fill={C.g900} />
      <rect x="114" y="298" width="6" height="22" rx="3" fill={C.sun} />
      <rect x="114" y="304" width="6" height="3" fill={C.g900} />
      <rect x="114" y="311" width="6" height="3" fill={C.g900} />

      {/* roller conveyor out to the truck */}
      <rect x="198" y="298" width="76" height="6" rx="1.5" fill={C.sage} />
      <rect x="198" y="304" width="76" height="2" fill="#7f937f" />
      {range(202, 270, 8).map((x) => (
        <g key={x}>
          <circle cx={x} cy="297.8" r="2.2" fill={C.cream200} />
          <circle cx={x} cy="297.8" r="0.8" fill={C.sage} />
        </g>
      ))}
      {[211, 257].map((x) => (
        <g key={x} fill={C.g700}>
          <rect x={x} y="306" width="3" height="13" />
          <rect x={x - 3} y="318" width="9" height="2" />
        </g>
      ))}

      {/* road */}
      <rect y="338" width={W} height="4" fill={C.sage} opacity="0.5" />
      <rect y="342" width={W} height="58" fill={C.g900} />
      <path d="M0 372H640" stroke={C.cream} strokeWidth="3.5" strokeDasharray="24 22" opacity="0.4" />
      <path d="M0 395H640" stroke={C.cream} strokeWidth="1.5" opacity="0.12" />
    </Art>
  );
}

/* the truck, parked at the dock */
const TRUCK: Box = [250, 172, 352, 176];
const BAY: Box = [280, 192, 210, 104];
const WHEELS = [322, 368, 562];

function Wheel({ cx }: { cx: number }) {
  const cy = 322;
  return (
    <Moving box={around(cx, cy, 20)} className="ts-wheel">
      <circle cx={cx} cy={cy} r="20" fill={C.tyre} />
      <circle cx={cx} cy={cy} r="16.5" fill="none" stroke="#2d3632" strokeWidth="2" />
      <path d={`M${cx - 8} ${cy - 15.4}a17.4 17.4 0 0 1 9.6 -2`} fill="none" stroke="#56615c" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="10" fill={C.cream} />
      <circle cx={cx} cy={cy} r="4" fill={C.sage} />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={cx + 7 * Math.cos((a * Math.PI) / 180)} cy={cy + 7 * Math.sin((a * Math.PI) / 180)} r="1.3" fill={C.g900} />
      ))}
    </Moving>
  );
}

/** A pallet of sun-yellow cartons; it goes in first, deepest. */
function LoadCartons() {
  return (
    <Moving box={[412, 246, 56, 50]} className="ts-load l1">
      <rect x="412" y="290" width="56" height="2.4" fill="#b8a77c" />
      {[414, 437, 460].map((x) => (
        <rect key={x} x={x} y="292" width="6" height="4" fill="#b8a77c" />
      ))}
      {[[413, 248], [440, 248], [413, 269], [440, 269]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="27" height="21" fill={C.sun} />
          <rect x={x} y={y + 18} width="27" height="3" fill={C.sunDk} />
          <rect x={x + 11} y={y} width="5" height="18" fill="#ffd36b" />
          <rect x={x} y={y} width="0.8" height="21" fill={C.sunDk} />
        </g>
      ))}
      <rect x="444" y="274" width="10" height="7" fill={C.cream} />
      <rect x="445.5" y="276" width="7" height="1" fill={C.g900} opacity="0.5" />
      <rect x="445.5" y="278.2" width="5" height="1" fill={C.g900} opacity="0.5" />
    </Moving>
  );
}

/** A stack of plain cartons, marked this way up. */
function LoadBoxes() {
  return (
    <Moving box={[354, 232, 50, 64]} className="ts-load l2">
      {[[354, 274, 50, 22], [356, 253, 46, 21], [359, 232, 41, 21]].map(([x, y, w, h]) => (
        <g key={y}>
          <rect x={x} y={y} width={w} height={h} fill={C.cream} />
          <rect x={x} y={y + h - 2.5} width={w} height="2.5" fill={C.cream200} />
          <rect x={x + w / 2 - 2.5} y={y} width="5" height={h - 2.5} fill={C.cream200} />
        </g>
      ))}
      <g fill="none" stroke={C.g} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M362 289v-8m-2.6 2.6 2.6-2.6 2.6 2.6M369 289v-8m-2.6 2.6 2.6-2.6 2.6 2.6" />
      </g>
      <rect x="384" y="258" width="12" height="8" fill={C.sun} />
    </Moving>
  );
}

/** Two produce crates on a pallet, tomatoes on top. */
function LoadCrates() {
  return (
    <Moving box={[294, 238, 54, 58]} className="ts-load l3">
      <rect x="294" y="290" width="54" height="2.4" fill="#b8a77c" />
      {[296, 318, 340].map((x) => (
        <rect key={x} x={x} y="292" width="6" height="4" fill="#b8a77c" />
      ))}
      {[[299, 243, 5], [308, 241, 5.5], [318, 243, 5], [327, 241, 5.5], [337, 243, 5]].map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y + 4} r={r} fill={C.tomato} />
      ))}
      {[[296, 268, 50, 22], [298, 248, 46, 20]].map(([x, y, w, h]) => (
        <g key={y}>
          <rect x={x} y={y} width={w} height={h} rx="1.5" fill={C.g} />
          <rect x={x} y={y + h / 2 - 1} width={w} height="2" fill={C.cream} opacity="0.55" />
          <rect x={x + w / 2 - 6} y={y + 4} width="12" height="3.4" rx="1.7" fill={C.g900} />
          <rect x={x} y={y + h - 2.5} width={w} height="2.5" fill={C.g700} />
        </g>
      ))}
      {[303, 311, 319, 327, 335].map((x) => (
        <circle key={x} cx={x} cy="282" r="3" fill={C.orange} opacity="0.85" />
      ))}
    </Moving>
  );
}

/** Side curtain: closed it carries the brand, open it gathers up against the cab. */
function Curtain() {
  return (
    <Moving box={[281, 191, 207, 106]} className="ts-curtain">
      <rect x="281" y="191" width="207" height="106" fill={C.cream} />
      {range(292, 480, 14).map((x) => (
        <rect key={x} x={x} y="194" width="1.2" height="96" fill={C.cream200} />
      ))}
      <rect x="281" y="276" width="207" height="9" fill={C.sun} />
      <Mark cx={385} cy={229} r={23} bg={C.g} fg={C.cream} />
      <text x="385" y="268" textAnchor="middle" fill={C.g} fontFamily={COND} fontWeight="700" fontSize="11" letterSpacing="2.2">
        CHEAPER BUY MILES
      </text>
      {range(292, 480, 28).map((x) => (
        <g key={x} fill={C.g900} opacity="0.8">
          <rect x={x} y="288" width="4" height="7" rx="1" />
        </g>
      ))}
    </Moving>
  );
}

/** Frame, chassis and cab: drawn over the bay, the loads and the curtain. */
function Body() {
  return (
    <Art box={TRUCK}>
      {/* roof rail and sill */}
      <rect x="268" y="182" width="230" height="11" rx="4" fill={C.cream} />
      <rect x="272" y="183.2" width="222" height="1.6" rx="0.8" fill={C.paper} />
      <rect x="268" y="190" width="230" height="3" fill={C.cream200} />
      <rect x="268" y="295" width="230" height="15" rx="2" fill={C.cream} />
      <rect x="268" y="295" width="230" height="1.6" fill={C.paper} />
      <rect x="268" y="306" width="230" height="4" fill={C.cream200} />
      {/* posts, hinges, rear lights */}
      <rect x="267" y="182" width="14" height="128" rx="3" fill={C.cream200} />
      {[200, 236].map((y) => (
        <rect key={y} x="270" y={y} width="5" height="9" rx="1" fill={C.sage} />
      ))}
      <rect x="265" y="268" width="4" height="8" rx="1.5" fill="#d9d3bd" />
      <rect x="265" y="279" width="4" height="12" rx="1.5" fill="#a3241b" />
      <rect x="487" y="182" width="11" height="128" rx="2" fill={C.cream200} />
      {/* chassis, wheel arches, guard, tank */}
      <rect x="268" y="308" width="326" height="8" fill={C.g900} />
      {WHEELS.map((cx) => (
        <path key={cx} d={`M${cx - 25} 322a25 25 0 0 1 50 0z`} fill={C.g900} />
      ))}
      <rect x="290" y="314" width="5" height="22" rx="1.5" fill={C.g900} />
      <rect x="396" y="314" width="68" height="3" rx="1.5" fill={C.sage} />
      <rect x="396" y="322" width="68" height="3" rx="1.5" fill={C.sage} />
      <rect x="470" y="310" width="38" height="18" rx="5" fill={C.sage200} />
      <rect x="474" y="313" width="30" height="2" rx="1" fill={C.paper} opacity="0.7" />
      {/* exhaust stack */}
      <rect x="490" y="186" width="7" height="100" rx="2" fill={C.sage} />
      <rect x="489" y="232" width="9" height="30" rx="2" fill={C.sage200} />
      {[236, 244, 252].map((y) => (
        <rect key={y} x="491" y={y} width="5" height="3" rx="1" fill={C.sage} />
      ))}
      <rect x="489" y="181" width="9" height="5" rx="1.5" fill={C.g900} />
      {/* cab */}
      <path d="M499 222V196a10 10 0 0 1 10-10h10l30 36z" fill={C.sunDk} />
      <path d="M498 222h56a14 14 0 0 1 11 5l26 34a14 14 0 0 1 3 8v47H498z" fill={C.sun} />
      <path d="M498 298h96v18H498z" fill={C.sunDk} />
      <path d="M512 232h40a6 6 0 0 1 4.8 2.4L576 260H512z" fill="#e4ece2" />
      <path d="M531 232h7l-15 28h-7zM542 232h3l-15 28h-3z" fill={C.paper} opacity="0.85" />
      <path d="M504 266h88" stroke={C.sunDk} strokeWidth="2" />
      <path d="M506 228v68" stroke={C.sunDk} strokeWidth="1.6" />
      <rect x="512" y="271" width="10" height="3" rx="1.5" fill={C.sunDk} />
      <Mark cx={550} cy={283} r={9} bg={C.g} fg={C.cream} />
      <path d="M572 241l10-3" stroke={C.g900} strokeWidth="2" />
      <rect x="581" y="229" width="5" height="18" rx="2" fill={C.g900} />
      <rect x="589" y="276" width="6" height="6" rx="1.5" fill="#c9792a" />
      <rect x="587" y="285" width="8" height="9" rx="2.5" fill={C.cream} />
      <rect x="562" y="303" width="36" height="13" rx="3" fill={C.g900} />
      <rect x="512" y="316" width="24" height="4" rx="1.5" fill={C.sage} />
    </Art>
  );
}

export function TruckScene() {
  const s = useT(truckSceneStrings);
  const ref = useRef<HTMLDivElement>(null);

  // Hold the loop wherever it is while the scene is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return pauseWhenOffscreen(el, "0px");
  }, []);

  return (
    <div ref={ref} className="truck-scene" role="img" aria-label={s.label}>
      {/* sky */}
      <Layer box={around(566, 74, 64)} className="ts-halo" />
      <Moving box={around(566, 74, 50)} className="ts-rays">
        <g stroke={C.sun} strokeWidth="3" strokeLinecap="round" opacity="0.5">
          {range(0, 330, 30).map((a) => (
            <path key={a} d="M566 35v-8" transform={`rotate(${a} 566 74)`} />
          ))}
        </g>
      </Moving>
      <Art box={around(566, 74, 31)}>
        <circle cx="566" cy="74" r="30" fill={C.sun} />
        <path d="M547 66a21 21 0 0 1 17-13" fill="none" stroke="#ffd77a" strokeWidth="4" strokeLinecap="round" />
      </Art>
      {CLOUDS.map((cloud) => (
        <Cloud key={cloud.delay} {...cloud} />
      ))}

      <Land />
      <Layer box={around(210.5, 217, 9)} className="ts-lamp red" />
      <Layer box={around(210.5, 229, 9)} className="ts-lamp green" />

      <Layer box={TRUCK} className="ts-drive">
        <Art box={TRUCK}>
          <ellipse cx="432" cy="343" rx="178" ry="4.5" fill="#001f17" opacity="0.5" />
        </Art>
        <Layer box={TRUCK} className="ts-body">
          <Art box={BAY}>
            <rect x="280" y="192" width="210" height="104" fill="#0c3328" />
            {range(290, 480, 20).map((x) => (
              <rect key={x} x={x} y="192" width="2" height="104" fill="#143f33" />
            ))}
            <path d="M330 199h110l26 94H304z" fill={C.cream} opacity="0.04" />
            <rect x="280" y="238" width="210" height="3" fill={C.sage} opacity="0.22" />
            {range(288, 482, 12).map((x) => (
              <rect key={x} x={x} y="238.8" width="4" height="1.4" fill="#06221a" />
            ))}
            <rect x="280" y="192" width="210" height="7" fill="#06221a" />
            <rect x="280" y="293" width="210" height="3" fill="#2b473d" />
          </Art>
          <LoadCartons />
          <LoadBoxes />
          <LoadCrates />
          <Curtain />
          <Body />
          <Layer box={around(266, 272, 12)} className="ts-light ts-rev" />
          <Layer box={around(266, 285, 15)} className="ts-light ts-brake" />
          <Layer box={around(592, 279, 10)} className="ts-light ts-ind" />
          <Layer box={[594, 274, 72, 32]} className="ts-beam" />
          <Layer box={around(592, 289.5, 10)} className="ts-light ts-head" />
          <Layer box={[512, 232, 64, 28]} className="ts-glass">
            <Layer box={[488, 226, 12, 40]} className="ts-glint" />
          </Layer>
        </Layer>
        {WHEELS.map((cx) => (
          <Wheel key={cx} cx={cx} />
        ))}
      </Layer>

      {/* exhaust and dust stay where they were puffed out */}
      <Layer box={[444, 120, 80, 80]} className="ts-idle">
        {[0, 1, 2].map((i) => (
          <Layer key={i} box={around(494, 178, 9)} className="ts-puff" style={{ "--i": i } as CSSProperties} />
        ))}
      </Layer>
      {[0, 1, 2].map((i) => (
        <Layer key={i} box={around(494, 178, 12)} className="ts-puff ts-burst" style={{ "--i": i } as CSSProperties} />
      ))}
      {[300, 346].map((x) => (
        <Layer key={x} box={[x - 14, 329, 28, 14]} className="ts-dust" />
      ))}
    </div>
  );
}
