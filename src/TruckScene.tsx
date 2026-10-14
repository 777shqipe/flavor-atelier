import type { CSSProperties } from "react";

/** Flat, looping illustration: pallets roll out of the warehouse door into the truck. */
export function TruckScene() {
  return (
    <svg className="truck-scene" viewBox="0 0 640 380" role="img" aria-label="Pallets being loaded into a Cheaper Buy Miles truck outside a warehouse">
      <defs>
        <clipPath id="door-clip">
          <rect x="118" y="196" width="76" height="114" />
        </clipPath>
      </defs>

      <circle className="sun" cx="548" cy="78" r="44" fill="#f6b531" />
      <g className="cloud c1" fill="#f6f0db" opacity="0.9">
        <rect x="40" y="52" width="92" height="22" rx="11" />
        <rect x="64" y="38" width="48" height="26" rx="13" />
      </g>
      <g className="cloud c2" fill="#f6f0db" opacity="0.7">
        <rect x="330" y="30" width="74" height="18" rx="9" />
        <rect x="348" y="20" width="36" height="20" rx="10" />
      </g>

      <g className="hills" fill="#0a6b4f" opacity="0.55">

        <ellipse cx="120" cy="128" rx="200" ry="46" />

        <ellipse cx="470" cy="136" rx="240" ry="40" />

      </g>

      {/* warehouse */}
      <rect x="22" y="112" width="316" height="198" rx="6" fill="#c9d6c8" />
      <rect x="22" y="104" width="316" height="22" rx="6" fill="#00382a" />
      <circle cx="180" cy="152" r="17" fill="#00382a" />
      <g fill="none" stroke="#f6f0db" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M171 146h3l2 9h8l1.6-6.5h-12" />
      </g>
      <circle cx="178" cy="160" r="1.5" fill="#f6f0db" />
      <circle cx="184" cy="160" r="1.5" fill="#f6f0db" />
      {[44, 224].map((x) => (
        <g key={x}>
          <rect x={x} y="196" width="76" height="114" fill="#005842" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={x} y={196 + i * 19} width="76" height="2.5" fill="#00382a" opacity="0.55" />
          ))}
        </g>
      ))}
      {/* open door with a stack inside */}
      <rect x="118" y="196" width="76" height="114" fill="#00382a" />
      <g clipPath="url(#door-clip)">
        <rect x="126" y="270" width="26" height="40" fill="#f6b531" />
        <rect x="154" y="282" width="30" height="28" fill="#ebe3c4" />
        <rect x="132" y="244" width="22" height="26" fill="#ebe3c4" />
      </g>

      {/* ground + moving road dashes */}
      <rect x="0" y="310" width="640" height="70" fill="#00382a" />
      <line className="road-dash" x1="-60" y1="350" x2="700" y2="350" stroke="#f6f0db" strokeWidth="4" strokeDasharray="26 26" opacity="0.55" />

      {/* conveyor + crates rolling into the trailer */}
      <rect x="196" y="296" width="120" height="8" rx="4" fill="#9cad9b" />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="crate" x="198" y="262" width="34" height="32" rx="3" fill={["#f6b531", "#f6f0db", "#9cad9b"][i]} style={{ animationDelay: `${i * 1.25}s` }} />
      ))}

      {/* truck */}
      <g className="truck-arrive">
      <g className="truck">
        <rect x="292" y="176" width="236" height="134" rx="10" fill="#f6f0db" />
        <rect x="292" y="270" width="236" height="12" fill="#f6b531" />
        <circle cx="410" cy="226" r="26" fill="#005842" />
        <g fill="none" stroke="#f6f0db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M397 217h5l4 17h15l3-12h-22" />
        </g>
        <circle cx="408" cy="241" r="2.2" fill="#f6f0db" />
        <circle cx="421" cy="241" r="2.2" fill="#f6f0db" />
        {/* loading flap */}
        <rect x="292" y="176" width="14" height="134" rx="4" fill="#ebe3c4" />
        {/* cab */}
        <path d="M528 214h52a14 14 0 0 1 11 5l24 32a14 14 0 0 1 3 8v51H528z" fill="#f6b531" />
        <path d="M546 228h30l22 28h-52z" fill="#f6f0db" opacity="0.95" />
        <path d="M528 262h86" stroke="#d99a1c" strokeWidth="3" />
        <rect x="528" y="298" width="86" height="12" rx="3" fill="#00382a" />
        {[330, 392, 560].map((cx) => (
          <g key={cx} className="wheel" style={{ transformOrigin: `${cx}px 312px` }}>
            <circle cx={cx} cy="312" r="24" fill="#1a1f1d" />
            <circle cx={cx} cy="312" r="10" fill="#f6f0db" />
            <path d={`M${cx - 10} 312h20M${cx} 302v20`} stroke="#9cad9b" strokeWidth="2" />
            <path d={`M${cx - 7} 305l14 14M${cx - 7} 319l14-14`} stroke="#9cad9b" strokeWidth="2" />
          </g>
        ))}
      </g>
      <g className="exhaust" fill="#f6f0db">
        {[0, 1, 2].map((i) => (
          <circle key={i} className="puff" cx="538" cy="208" r={5 + i * 2} style={{ "--i": i } as CSSProperties} />
        ))}
      </g>
      </g>
    </svg>
  );
}
