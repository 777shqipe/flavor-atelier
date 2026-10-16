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

  return (
    <button
      type="button"
      className={`apple-cut ${className}`}
      data-sliced={sliced || undefined}
      aria-pressed={sliced}
      aria-label={copy.ariaLabel}
      onClick={() => setSliced((prev) => !prev)}
    >
      <svg className="ac-svg" viewBox="0 0 184 176" overflow="visible" aria-hidden="true" focusable="false">
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
                fontSize="8.8"
                letterSpacing="0.5"
                fill="#1b6b3a"
              >
                {copy.fleshTop}
              </text>
              <text
                x="0"
                y="6.8"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="8.2"
                letterSpacing="0.5"
                fill={INK}
              >
                {copy.fleshBottom}
              </text>
            </g>

            {/* Writing ON the apple itself ("anche sulla mela ci sarà la scritta") */}
            <g className="ac-stamp" transform="translate(55 88) rotate(-8)">
              <ellipse cx="0" cy="0" rx="26" ry="20" fill={CREAM} stroke={INK} strokeWidth="2" />
              <ellipse
                cx="0"
                cy="0"
                rx="22.5"
                ry="16.5"
                fill="none"
                stroke="#005842"
                strokeWidth="1"
                strokeDasharray="2.2 2.2"
              />
              <text
                x="0"
                y="-6.5"
                stroke="none"
                textAnchor="middle"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="700"
                fontSize="6.8"
                letterSpacing="1.1"
                fill="#005842"
              >
                {copy.stampTop}
              </text>
              <text
                x="0"
                y="7.5"
                stroke="none"
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize="16"
                letterSpacing="0.4"
                fill={INK}
              >
                {copy.stampYear}
              </text>
              <text
                x="0"
                y="14.2"
                stroke="none"
                textAnchor="middle"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="700"
                fontSize="5.4"
                letterSpacing="0.8"
                fill="#c41d38"
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
              strokeWidth="1.7"
              strokeDasharray="3.2 3.2"
            />
          </g>

          {/* --- PARING KNIFE ("un coltellino") --- */}
          <g className="ac-knife">
            {/* Knife is drawn along its local X axis with blade tip at (0,0) pointing left-down */}
            <g transform="translate(88 26) rotate(123)">
              {/* Steel blade */}
              <path
                d="M-34 -8L6 -2C8 4 -2 9 -16 9C-25 9 -32 3 -34 -8Z"
                fill="#dfe5ec"
              />
              {/* Blade edge glint */}
              <path
                d="M-31 -5C-22 3 -8 5 4 1"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
              />
              {/* Wooden handle */}
              <rect x="-64" y="-9.5" width="31" height="12" rx="5.5" fill="#7c4722" />
              <path d="M-61 -5.5H-36" stroke="#a5683c" strokeWidth="1.8" strokeLinecap="round" />
              {/* Brass rivets */}
              <circle cx="-54" cy="-3.5" r="1.7" fill="#f6b531" strokeWidth="1.2" />
              <circle cx="-42" cy="-3.5" r="1.7" fill="#f6b531" strokeWidth="1.2" />
            </g>
          </g>
        </g>

        {/* Slice sparkles when cut */}
        <g className="ac-sparks" stroke="none">
          <circle className="sp-1" cx="118" cy="48" r="2.8" fill="#f6b531" />
          <circle className="sp-2" cx="132" cy="64" r="2.2" fill="#fff8e7" />
          <circle className="sp-3" cx="124" cy="104" r="2.4" fill="#f6b531" />
        </g>
      </svg>

      {/* Hint pill before click / Revealed message pill underneath after click */}
      <span className="ac-under" aria-hidden="true">
        <span className="ac-hint">
          <i className="ac-scissors">🔪</i> {copy.hint}
        </span>
        <span className="ac-reveal">
          <strong>{copy.underTitle}</strong>
          <small>{copy.underSub}</small>
        </span>
      </span>
    </button>
  );
}
