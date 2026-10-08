/**
 * Six small looping scenes for the supplier benefits. Scenes that need several
 * moving parts to stay in step (sun + truck, parcel + checkpoints, jumping box)
 * are written in SMIL, which keeps one clock; the others use CSS keyframes that
 * start once the tile scrolls into view.
 */

const SPARK = "M0-10L2.6-2.6 10 0 2.6 2.6 0 10-2.6 2.6-10 0-2.6-2.6z";
const TRACK = "M24 150C90 150 80 50 150 60C220 70 250 140 300 86C318 66 330 46 336 34";

/* ---------- 1. paid upfront ------------------------------------------- */
export function PayArt() {
  const zigzag = "l-15-10-15 10".repeat(6);
  const rows = [
    [70, 34],
    [54, 34],
    [84, 34],
    [62, 34],
  ];
  return (
    <svg className="art pay" viewBox="0 0 360 300" aria-hidden="true">
      <g className="receipt">
        <path d={`M60 24h180v236${zigzag}z`} fill="#fffdf6" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="88" cy="48" r="9" fill="currentColor" />
        <rect x="106" y="42" width="60" height="12" rx="6" fill="currentColor" opacity="0.85" />
        {rows.map(([w, p], i) => (
          <g key={i}>
            <rect className="row" style={{ "--i": i } as never} x="84" y={80 + i * 26} width={w} height="9" rx="4.5" fill="#9cad9b" />
            <rect className="row" style={{ "--i": i + 0.5 } as never} x={206 - p} y={80 + i * 26} width={p} height="9" rx="4.5" fill="#9cad9b" />
          </g>
        ))}
        <path d="M84 186h132" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
        <rect className="row" style={{ "--i": 4.4 } as never} x="84" y="198" width="46" height="12" rx="6" fill="currentColor" />
        <rect className="row" style={{ "--i": 4.8 } as never} x="168" y="196" width="48" height="16" rx="8" fill="currentColor" />
        <g className="stamp">
          <rect x="100" y="216" width="116" height="38" rx="8" fill="none" stroke="#e3261b" strokeWidth="4" />
          <text x="158" y="246" textAnchor="middle" fontFamily="Bagel Fat One, sans-serif" fontSize="29" fill="#e3261b">
            PAID
          </text>
        </g>
      </g>
      <g className="coins">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 262 - i * 15;
          return (
            <g className="coin" key={i} style={{ "--i": i } as never}>
              <rect x="268" y={y - 10} width="76" height="14" fill="#f6b531" />
              <path d={`M268 ${y - 10}v14a38 10 0 0 0 76 0v-14`} fill="none" stroke="currentColor" strokeWidth="3" />
              <ellipse cx="306" cy={y - 10} rx="38" ry="10" fill="#ffd766" stroke="currentColor" strokeWidth="3" />
              <path d={`M292 ${y - 10}h28`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            </g>
          );
        })}
      </g>
      <path className="art-spark" d={SPARK} transform="translate(330 168)" fill="#f6b531" />
      <path className="art-spark b" d={SPARK} transform="translate(272 150) scale(.7)" fill="#e3261b" />
    </svg>
  );
}

/* ---------- 2. same-day: one sun, one truck --------------------------- */
export function SpeedArt() {
  const arc = "M40 150Q260 -46 480 150";
  return (
    <svg className="art speed-art" viewBox="0 0 520 220" aria-hidden="true">
      <path d={arc} fill="none" stroke="#9cad9b" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" opacity="0.7" />
      <g>
        <circle r="26" fill="#f6b531" opacity="0.22" />
        <circle r="14" fill="#f6b531" />
        <animateMotion dur="8s" repeatCount="indefinite" path={arc} keyPoints="0;1;1" keyTimes="0;0.86;1" calcMode="linear" />
      </g>

      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 190V116l48-24 48 24v74" />
        <rect x="34" y="144" width="52" height="46" rx="3" />
        <path d="M34 160h52M34 176h52" opacity="0.5" />
        <path d="M418 190v-62l46-26 46 26v62" />
        <rect x="448" y="150" width="32" height="40" rx="3" />
        <path d="M0 192h520" />
      </g>

      <g>
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="0" y="-40" width="66" height="44" rx="4" />
          <path d="M66-26h22l16 18v12H66" />
          <path d="M-12-30h-22M-8-18h-30M-12-6h-18" opacity="0.6" />
        </g>
        {[16, 48, 92].map((cx) => (
          <g className="wheel" key={cx}>
            <circle cx={cx} cy="6" r="9" fill="currentColor" />
            <path d={`M${cx - 6} 6h12M${cx} 0v12`} stroke="#00382a" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
        <rect x="8" y="-32" width="14" height="14" rx="2" fill="#f6b531" />
        <rect x="26" y="-32" width="14" height="14" rx="2" fill="#f6f0db" opacity="0.9" />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="94 190;94 190;330 190;330 190"
          keyTimes="0;0.1;0.86;1"
          calcMode="spline"
          keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1"
          dur="8s"
          repeatCount="indefinite"
        />
      </g>

      <g>
        <rect x="108" y="24" width="112" height="30" rx="15" fill="#f6f0db" />
        <text x="164" y="44" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="13" fill="#00382a">
          Deal sealed
        </text>
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.04;0.5;0.58;1" dur="8s" repeatCount="indefinite" />
      </g>
      <g>
        <rect x="340" y="24" width="124" height="30" rx="15" fill="#f6b531" />
        <text x="402" y="44" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="13" fill="#00382a">
          Collected ✓
        </text>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.86;0.9;0.98;1" dur="8s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

/* ---------- 3. tracked door to door ----------------------------------- */
const CHECKS: Array<[number, number, number]> = [
  [101.7, 77.9, 0.2016],
  [199.1, 77.6, 0.396],
  [289.1, 96.1, 0.576],
];

export function TrackArt() {
  return (
    <svg className="art track" viewBox="0 0 360 190" aria-hidden="true">
      <path d={TRACK} fill="none" stroke="#9cad9b" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity="0.75" />
      <path d={TRACK} fill="none" stroke="#f6b531" strokeWidth="4.5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1">
        <animate attributeName="stroke-dashoffset" values="1;1;0;0" keyTimes="0;0.02;0.72;1" dur="7s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.95;1" dur="7s" repeatCount="indefinite" />
      </path>
      <circle cx="24" cy="150" r="8" fill="currentColor" />
      {CHECKS.map(([x, y, t], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx={x} cy={y} r="0" fill="#f6b531">
            <animate attributeName="r" values={`0;0;7;5;5;0`} keyTimes={`0;${t};${t + 0.03};${t + 0.06};0.95;1`} dur="7s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <g>
        <circle r="16" fill="#f6b531" opacity="0.28">
          <animate attributeName="r" values="12;20;12" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <rect x="-11" y="-9" width="22" height="18" rx="3" fill="#f6b531" stroke="#00382a" strokeWidth="2.5" />
        <path d="M-11-1h22M-3-9v18M5-9v18" stroke="#00382a" strokeWidth="2" opacity="0.55" />
        <animateMotion dur="7s" repeatCount="indefinite" path={TRACK} keyPoints="0;1;1" keyTimes="0;0.72;1" calcMode="linear" />
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.72;0.75;1" dur="7s" repeatCount="indefinite" />
      </g>
      <g transform="translate(336 34)">
        <g>
          <path d="M0 0C-8-10-14-16-14-24a14 14 0 0 1 28 0C14-16 8-10 0 0z" fill="#f6f0db" />
          <circle cx="0" cy="-24" r="5.5" fill="#00382a" />
          <animateTransform attributeName="transform" type="scale" values="0;0;1.25;1;1;0" keyTimes="0;0.7;0.76;0.8;0.96;1" dur="7s" repeatCount="indefinite" />
        </g>
      </g>
      <g>
        <rect x="186" y="150" width="104" height="28" rx="14" fill="#f6b531" />
        <text x="238" y="169" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="13" fill="#00382a">
          Delivered ✓
        </text>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.74;0.8;0.95;1" dur="7s" repeatCount="indefinite" />
      </g>
      <g>
        <rect x="40" y="20" width="96" height="28" rx="14" fill="#f6f0db" opacity="0.14" />
        <text x="88" y="39" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="13" fill="currentColor">
          On the way
        </text>
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.04;0.66;0.72;1" dur="7s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

/* ---------- 4. second life: bin to shelf ------------------------------ */
export function SecondArt() {
  return (
    <svg className="art second" viewBox="0 0 360 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36 82h64l-7 78H43z" opacity="0.55" />
        <path d="M30 70h76" opacity="0.55" />
        <path d="M54 96v52M68 96v52M82 96v52" opacity="0.28" />
        <path d="M214 160h132M214 106h132M220 106v54M340 106v54" />
      </g>
      <g fill="#f6f0db" fillOpacity="0.14" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
        <rect x="228" y="132" width="30" height="28" rx="3" />
        <rect x="262" y="138" width="26" height="22" rx="3" />
        <animateTransform attributeName="transform" type="rotate" values="0 280 160;0 280 160;-4 280 160;3 280 160;0 280 160;0 280 160" keyTimes="0;0.43;0.47;0.51;0.55;1" dur="6s" repeatCount="indefinite" />
      </g>

      <g stroke="#e3261b" strokeWidth="5" strokeLinecap="round">
        <path d="M54 100l28 28M82 100l-28 28" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.08;0.14;0.36;0.4;1" dur="6s" repeatCount="indefinite" />
        </path>
      </g>

      <g>
        <g>
          <rect x="-15" y="-28" width="30" height="28" rx="3" fill="#f6b531" stroke="#00382a" strokeWidth="2.5" />
          <path d="M-15-17h30" stroke="#00382a" strokeWidth="2" opacity="0.5" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 0;0 -60;0 64;0 64;0 64"
            keyTimes="0;0.2;0.31;0.43;0.9;1"
            calcMode="spline"
            keySplines="0 0 1 1;0.15 0.6 0.4 1;0.6 0 0.85 0.4;0 0 1 1;0 0 1 1"
            dur="6s"
            repeatCount="indefinite"
          />
        </g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="68 96;68 96;309 96;309 96"
          keyTimes="0;0.2;0.43;1"
          calcMode="linear"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="1;1;0;1" keyTimes="0;0.9;0.95;1" dur="6s" repeatCount="indefinite" />
      </g>

      <g transform="translate(309 150)">
        <path d={SPARK} fill="#f6b531">
          <animateTransform attributeName="transform" type="scale" values="0;0;1.4;0;0" keyTimes="0;0.43;0.5;0.6;1" dur="6s" repeatCount="indefinite" />
        </path>
      </g>

      <g transform="translate(180 44)" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <g>
          <g transform="translate(-14 -14) scale(1.15)">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.490 15a9 9 0 1 1-2.120-9.360L23 10" />
          </g>
          <animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite" />
        </g>
      </g>
    </svg>
  );
}

/* ---------- 5. any size: the truck fills up ---------------------------- */
export function MinArt() {
  return (
    <svg className="art min" viewBox="0 0 440 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="30" width="318" height="120" rx="8" />
        <path d="M332 62h38l28 30v58h-66" />
        <path d="M0 160h440" opacity="0.5" />
      </g>
      <circle cx="64" cy="156" r="14" fill="currentColor" />
      <circle cx="296" cy="156" r="14" fill="currentColor" />
      <circle cx="376" cy="156" r="14" fill="currentColor" />
      {Array.from({ length: 12 }).map((_, k) => {
        const col = k % 6;
        const row = Math.floor(k / 6);
        const x = 26 + col * 50;
        const y = 98 - row * 52;
        return (
          <g className="pal" key={k} style={{ "--k": k } as never}>
            <rect x={x} y={y} width="44" height="44" rx="5" fill="#f6b531" stroke="#00382a" strokeWidth="2.5" />
            <path d={`M${x} ${y + 15}h44M${x} ${y + 30}h44`} stroke="#00382a" strokeWidth="2.2" opacity="0.5" />
            <path d={`M${x + 15} ${y}v44`} stroke="#00382a" strokeWidth="2.2" opacity="0.28" />
          </g>
        );
      })}
      <g fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="15" fill="currentColor" textAnchor="end">
        <text className="lab l1" x="424" y="26">A few pallets</text>
        <text className="lab l2" x="424" y="26">Half a truck</text>
        <text className="lab l3" x="424" y="26">A full truckload</text>
      </g>
    </svg>
  );
}

/* ---------- 6. impact: the basket catches it --------------------------- */
export function ImpactArt() {
  return (
    <svg className="art impact" viewBox="0 0 360 210" aria-hidden="true">
      <defs>
        <clipPath id="basket-clip">
          <rect x="-40" y="-220" width="260" height="236" />
        </clipPath>
      </defs>
      <g opacity="0.4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 104h52l-6 74H36z" />
        <path d="M24 92h64" />
        <path d="M44 124l32 32M76 124l-32 32" stroke="#e3261b" />
      </g>

      <g transform="translate(150 118)">
        <g className="basket">
          <g clipPath="url(#basket-clip)">
            <g className="it apple">
              <circle cx="40" cy="0" r="14" fill="#e3261b" />
              <path d="M40-12c0-7 5-10 9-10" stroke="#00382a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <ellipse cx="48" cy="-18" rx="7" ry="4" fill="#6fd3b0" />
            </g>
            <g className="it milk">
              <rect x="66" y="-26" width="20" height="30" rx="3" fill="#f6f0db" stroke="#00382a" strokeWidth="2.5" />
              <path d="M66-26l10-8 10 8z" fill="#6bb8ff" stroke="#00382a" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            <g className="it loaf">
              <rect x="94" y="-14" width="46" height="20" rx="10" fill="#f6b531" stroke="#00382a" strokeWidth="2.5" />
              <path d="M104-14l5 20M118-14l5 20M132-14l-2 8" stroke="#00382a" strokeWidth="2" opacity="0.5" />
            </g>
          </g>
          <path d="M0 0h160l-20 68H20z" fill="#f6f0db" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 0l-6 68M80 0v68M120 0l6 68M10 24h140M16 46h128" stroke="currentColor" strokeWidth="2" opacity="0.35" />
          <path d="M34 0c0-40 92-40 92 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="sprout">
          <path className="stem" d="M148-2C150-24 142-40 152-60" fill="none" stroke="#6fd3b0" strokeWidth="4" strokeLinecap="round" pathLength="1" />
          <ellipse className="leaf a" cx="140" cy="-46" rx="11" ry="5.5" fill="#6fd3b0" transform="rotate(-30 140 -46)" />
          <ellipse className="leaf b" cx="162" cy="-62" rx="11" ry="5.5" fill="#6fd3b0" transform="rotate(30 162 -62)" />
        </g>
      </g>
      <path className="art-spark c" d={SPARK} transform="translate(326 52)" fill="#f6b531" />
      <path className="art-spark d" d={SPARK} transform="translate(60 40) scale(.7)" fill="#f6f0db" />
    </svg>
  );
}
