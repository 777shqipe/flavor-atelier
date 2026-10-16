import { useId, useState } from "react";

/**
 * Interactive "rescued apple" sticker replacing the old spinning '95 badge.
 * The apple has a dark overripe spot on its upper-right cheek and a small
 * paring knife poised at the seam: clicking slices off just that dark bit and
 * reveals the message underneath while keeping the rest of the apple.
 */

const INK = "#1c1a17";
const CREAM = "#fff8e7";

const APPLE_BODY =
  "M68 44C56 32 26 34 20 68C14 100 34 132 55 132C62 132 65 128 68 128C71 128 74 132 81 132C102 132 122 100 116 68C110 34 80 32 68 44Z";

export interface AppleCutCopy {
  stampTop: string;
  stampYear: string;
  stampSub: string;
  fleshTop: string;
  fleshBottom: string;
  underTitle: string;
  underSub: string;
  hint: string;
  ariaLabel: string;
}

export function AppleCut({ copy, className = "" }: { copy: AppleCutCopy; className?: string }) {
  const [sliced, setSliced] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `ac-die-${uid}`;
  const keepClipId = `ac-keep-${uid}`;
  const pieceClipId = `ac-piece-${uid}`;
  const bodyClipId = `ac-body-${uid}`;
  const pinkGradId = `ac-pink-${uid}`;

  return (
    <button
      type="button"
      className={`apple-cut ${className}`}
      data-sliced={sliced || undefined}
      aria-pressed={sliced}
      aria-label={copy.ariaLabel}
      onClick={() => setSliced((prev) => !prev)}
    >
      <svg className="ac-svg" viewBox="0 -34 160 184" overflow="visible" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-28%" y="-28%" width="165%" height="165%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="4.4" result="grown" />
            <feFlood floodColor="#fff" />
            <feComposite in2="grown" operator="in" result="border" />
            <feMerge>
              <feMergeNode in="border" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Left of the cut plane (74,34) -> (117,99): the healthy apple that stays. */}
          <clipPath id={keepClipId}>
            <polygon points="-20,-20 74,34 117,99 130,170 -20,170" />
          </clipPath>

          {/* Right of the cut plane (74,34) -> (117,99): the overripe spot that gets sliced off. */}
          <clipPath id={pieceClipId}>
            <polygon points="74,34 170,-10 180,140 117,99" />
          </clipPath>

          {/* Silhouette of the full apple, for shading & bruise clipping. */}
          <clipPath id={bodyClipId}>
            <path d={APPLE_BODY} />
          </clipPath>

          {/* Vibrant sparkling pink gradient for the toy knife handle */}
          <linearGradient id={pinkGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff7ad0" />
            <stop offset="30%" stopColor="#ff1493" />
            <stop offset="70%" stopColor="#d6006e" />
            <stop offset="100%" stopColor="#940047" />
          </linearGradient>
        </defs>

        <g filter={`url(#${filterId})`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          {/* --- HEALTHY APPLE + EXPOSED INNER FLESH (revealed when sliced) --- */}
          <g className="ac-apple">
            {/* Stem */}
            <path d="M67 45C67 33 71 24 78 19" fill="none" stroke="#5a3315" strokeWidth="4.4" />
            <path d="M67 45C67 33 71 24 78 19" fill="none" stroke={INK} strokeWidth="2" />

            {/* Leaf tilting left so the right shoulder stays open for the knife */}
            <path d="M66 31C56 18 37 17 29 25C37 36 54 38 66 31Z" fill="#3f9b4b" />
            <path d="M63 30C53 26 42 25 34 25" fill="none" stroke="#1e5928" strokeWidth="1.5" />

            {/* Exposed crisp cream flesh along the cut line (underneath the dark piece) */}
            <path
              className="ac-flesh"
              d="M75 36L115 96C104 99 90 88 81 74C72 60 69 45 75 36Z"
              fill="#fff3c4"
            />
            <path
              d="M77 39L112 92"
              fill="none"
              stroke="#f2c968"
              strokeWidth="2"
              strokeDasharray="3 4"
            />

            {/* Healthy red apple body (clipped to the left of the slice plane) */}
            <g clipPath={`url(#${keepClipId})`}>
              <path d={APPLE_BODY} fill="#e3261b" />
              <g clipPath={`url(#${bodyClipId})`} stroke="none">
                {/* Warm bottom/right shading */}
                <path d="M16 104C42 126 92 126 120 96L120 140L16 140Z" fill="rgb(95 5 5 / 0.24)" />
                {/* Glossy highlight on left cheek */}
                <path
                  d="M32 58C27 72 28 90 34 102"
                  fill="none"
                  stroke="rgb(255 255 255 / 0.52)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx="38" cy="48" r="2.6" fill="rgb(255 255 255 / 0.52)" />
              </g>
              <path d={APPLE_BODY} fill="none" />
            </g>

            {/* Cut seam outline along the healthy apple edge */}
            <line x1="75" y1="36" x2="115" y2="96" stroke={INK} strokeWidth="2.2" />

            {/* Revealed writing right on the fresh cut flesh ("sotto appare la scritta") */}
            <g className="ac-flesh-copy" transform="translate(88 69) rotate(56.5)">
              <text
                x="0"
                y="-2"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="9.8"
                letterSpacing="0.6"
                fill="#004734"
              >
                {copy.fleshTop}
              </text>
              <text
                x="0"
                y="7.4"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="9.2"
                letterSpacing="0.6"
                fill="#141414"
              >
                {copy.fleshBottom}
              </text>
            </g>

            {/* Writing ON the apple itself ("anche sulla mela ci sarà la scritta") - high contrast */}
            <g className="ac-stamp" transform="translate(54 88) rotate(-8)">
              {/* Crisp white badge oval with high-contrast double border */}
              <ellipse cx="0" cy="0" rx="26" ry="20" fill="#ffffff" stroke={INK} strokeWidth="2.2" />
              <ellipse
                cx="0"
                cy="0"
                rx="22.5"
                ry="16.5"
                fill="none"
                stroke="#004734"
                strokeWidth="1.4"
                strokeDasharray="2.4 2"
              />
              <text
                x="0"
                y="-6.8"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="7.5"
                letterSpacing="1.2"
                fill="#004734"
              >
                {copy.stampTop}
              </text>
              <text
                x="0"
                y="7.6"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="17.5"
                letterSpacing="0.4"
                fill="#141414"
              >
                {copy.stampYear}
              </text>
              {/* High-contrast solid pill for the subtitle */}
              <rect x="-17" y="10.2" width="34" height="6.6" rx="3.3" fill="#004734" stroke="none" />
              <text
                x="0"
                y="15.2"
                stroke="none"
                textAnchor="middle"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="800"
                fontSize="5.2"
                letterSpacing="0.8"
                fill="#ffffff"
              >
                {copy.stampSub}
              </text>
            </g>
          </g>

          {/* --- OVERRIPE / BRUISED SPOT PIECE ("leggermente matura su un punto quindi più scura") --- */}
          <g className="ac-piece">
            {/* Inner flesh of the detached wedge (visible once sliced) */}
            <path
              className="ac-piece-flesh"
              d="M75 36L115 96C109 100 98 92 88 77C78 62 72 44 75 36Z"
              fill="#e9d296"
            />
            <g clipPath={`url(#${pieceClipId})`}>
              <path d={APPLE_BODY} fill="#c82219" />
              {/* Darker overripe / bruised patch on this spot */}
              <g clipPath={`url(#${bodyClipId})`} stroke="none">
                <ellipse
                  cx="104"
                  cy="64"
                  rx="22"
                  ry="27"
                  transform="rotate(-24 104 64)"
                  fill="#7c2314"
                />
                <ellipse
                  cx="106"
                  cy="63"
                  rx="15"
                  ry="19"
                  transform="rotate(-24 106 63)"
                  fill="#4d140b"
                />
                {/* Subtle bruise speckles */}
                <circle cx="98" cy="54" r="2" fill="#320a04" opacity="0.7" />
                <circle cx="107" cy="68" r="2.4" fill="#320a04" opacity="0.7" />
                <circle cx="101" cy="74" r="1.6" fill="#320a04" opacity="0.65" />
                <circle cx="111" cy="57" r="1.7" fill="#320a04" opacity="0.65" />
              </g>
              <path d={APPLE_BODY} fill="none" />
            </g>
            {/* Dashed cut guide line before slicing */}
            <line
              className="ac-cut-guide"
              x1="75"
              y1="36"
              x2="115"
              y2="96"
              stroke={CREAM}
              strokeWidth="1.8"
              strokeDasharray="3.2 3.2"
            />
          </g>

          {/* --- CUTE PLAYFUL TOY KNIFE ("il coltellino fallo più cute, giocoso non così che fa paura") --- */}
          <g className="ac-knife">
            {/* Poised playfully near the cut seam: rounded butter/spreader toy blade */}
            <g transform="translate(86 28) rotate(123)">
              {/* Rounded, friendly butter/pastry blade - NO sharp stabbing point! */}
              <path
                d="M -22 -6.5 L 2 -6.5 Q 11 -6.5 11 0 Q 11 6.5 2 6.5 L -22 6.5 Z"
                fill="#eaf1f7"
              />
              {/* Cheerful white gleam highlight on blade */}
              <path
                d="M -18 -3.5 L 0 -3.5 Q 7 -3.5 7 0"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Cute little twinkle sparkle on the blade */}
              <path
                d="M -5 -0.5 Q -5 -3 -7 -3 Q -5 -3 -5 -5.5 Q -5 -3 -3 -3 Q -5 -3 -5 -0.5 Z"
                fill="#ffd15c"
                stroke="none"
              />
              {/* Shiny golden collar ring */}
              <rect x="-24.5" y="-7" width="3.5" height="14" rx="1.5" fill="#ffd768" />
              {/* Chubby, rounded vibrant pink handle ("rosa sgargiante") */}
              <path
                d="M -56 -8.5 H -25 Q -21 -8.5 -21 -4.5 V 4.5 Q -21 8.5 -25 8.5 H -56 Q -63 8.5 -63 0 Q -63 -8.5 -56 -8.5 Z"
                fill={`url(#${pinkGradId})`}
              />
              {/* Glossy top gleam highlight on handle */}
              <path
                d="M -54 -5.5 Q -39 -7.2 -26 -5.5"
                fill="none"
                stroke="rgb(255 255 255 / 0.85)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Sparkling stars & glitter dust on the pink handle ("scintilloso") */}
              <g stroke="none" className="ac-knife-sparkles">
                {/* Big white sparkle star */}
                <path
                  className="ac-sparkle-star ac-sp-1"
                  d="M -50 -6 Q -50 -3 -53.2 -3 Q -50 -3 -50 0 Q -50 -3 -46.8 -3 Q -50 -3 -50 -6 Z"
                  fill="#ffffff"
                />
                {/* Medium white sparkle star */}
                <path
                  className="ac-sparkle-star ac-sp-2"
                  d="M -37 0.5 Q -37 3 -39.5 3 Q -37 3 -37 5.5 Q -37 3 -34.5 3 Q -37 3 -37 0.5 Z"
                  fill="#ffffff"
                />
                {/* Golden mini sparkle star */}
                <path
                  className="ac-sparkle-star ac-sp-3"
                  d="M -28 -4 Q -28 -2 -30 -2 Q -28 -2 -28 0 Q -28 -2 -26 -2 Q -28 -2 -28 -4 Z"
                  fill="#ffd768"
                />
                {/* Glitter flecks */}
                <circle cx="-56" cy="2.2" r="0.9" fill="#ffffff" opacity="0.95" />
                <circle cx="-43" cy="-4" r="0.8" fill="#ffe4f2" opacity="0.9" />
                <circle cx="-32" cy="4" r="0.8" fill="#ffffff" opacity="0.95" />
                <circle cx="-58" cy="-2.5" r="0.75" fill="#ffd768" opacity="0.9" />
                <circle cx="-44" cy="4.2" r="0.7" fill="#ffffff" opacity="0.9" />
                <circle cx="-33" cy="-2.5" r="0.8" fill="#ffe4f2" opacity="0.9" />
              </g>
              {/* Cute crystal gem rivets */}
              <g stroke="none">
                <circle cx="-48" cy="0" r="2.4" fill="#ffd768" />
                <circle cx="-48" cy="0" r="1.5" fill="#ffffff" />
                <circle cx="-34" cy="0" r="2.4" fill="#ffd768" />
                <circle cx="-34" cy="0" r="1.5" fill="#ffffff" />
              </g>
            </g>
          </g>
        </g>

        {/* Slice sparkles when cut */}
        <g className="ac-sparks" stroke="none">
          <circle className="sp-1" cx="118" cy="48" r="3.2" fill="#f6b531" />
          <circle className="sp-2" cx="132" cy="64" r="2.4" fill="#fff8e7" />
          <circle className="sp-3" cx="124" cy="104" r="2.8" fill="#f6b531" />
        </g>
      </svg>

      {/* Hint pill before click / Revealed message pill underneath after click */}
      <span className="ac-under" aria-hidden="true">
        <span className="ac-hint">
          {/* Cute mini rounded butter knife icon with pink handle */}
          <svg className="ac-mini-knife" viewBox="0 0 16 10" width="15" height="10" aria-hidden="true">
            <path d="M1 3h6q1.5 0 1.5 2t-1.5 2H1q-1.5 0-1.5-2T1 3z" fill="#ff1493" stroke="#1c1a17" strokeWidth="1" />
            <circle cx="2.5" cy="4.2" r="0.75" fill="#ffffff" stroke="none" />
            <circle cx="5.2" cy="5.8" r="0.6" fill="#ffd768" stroke="none" />
            <path d="M8.5 3.5h4q2.5 0 2.5 1.5t-2.5 1.5h-4z" fill="#eaf1f7" stroke="#1c1a17" strokeWidth="1" />
          </svg>
          {copy.hint}
        </span>
        <span className="ac-reveal">
          <strong>{copy.underTitle}</strong>
          <small>{copy.underSub}</small>
        </span>
      </span>
    </button>
  );
}
