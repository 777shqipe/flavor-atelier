import { useId, type CSSProperties, type ReactNode } from "react";

/**
 * Fresh produce in the same sticker style as Pack.tsx: flat colour, a thin ink
 * outline and a thick white die-cut border.
 */

const INK = "#141414";

function Sticker({ box, body, extra }: { box: string; body: ReactNode; extra?: ReactNode }) {
  const shadeId = `pr-shade-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg viewBox={box} aria-hidden="true" focusable="false">
      <defs>
        {/* Each sticker owns its light map, even while another grocery is hidden at the till. */}
        <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor={INK} stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round" strokeLinecap="round">
        <g fill="#fff" stroke="#fff" strokeWidth="10">
          {body}
        </g>
        <g stroke={INK} strokeWidth="2.4">
          {body}
        </g>
        <g className="pr-shade" stroke="none" style={{ "--pr-shade": `url(#${shadeId})` } as CSSProperties}>
          {body}
        </g>
        {extra}
      </g>
    </svg>
  );
}

export function Apple() {
  return (
    <Sticker
      box="4 6 92 92"
      body={
        <>
          <path d="M56 18c5-9 16-11 22-7-4 8-14 11-22 7z" fill="#3f9b4b" />
          <path d="M50 30C40 20 14 20 12 46c-2 24 14 44 28 44 5 0 7-3 10-3s5 3 10 3c14 0 30-20 28-44C86 20 60 20 50 30z" fill="#e3261b" />
        </>
      }
      extra={
        <>
          <path d="M50 30c0-9 3-15 8-19" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M25 46c1-7 5-11 10-12" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" />
        </>
      }
    />
  );
}

export function Banana() {
  return (
    <Sticker
      box="3 6 136 56"
      body={<path d="M12 16c14 26 64 38 108 10 5-3 9-1 9 3-2 6-8 12-16 17-38 22-86 16-104-16-3-6 0-15 3-14z" fill="#f9d548" />}
      extra={
        <>
          <path d="M22 27c20 17 58 20 92 3" fill="none" stroke={INK} strokeOpacity="0.18" strokeWidth="2.4" />
          <path d="M125 28l8-6" fill="none" stroke={INK} strokeWidth="4" />
        </>
      }
    />
  );
}

export function Bread() {
  return (
    <Sticker
      box="4 8 132 74"
      body={<path d="M10 58c0-26 26-44 60-44s60 18 60 44v8c0 6-4 10-10 10H20c-6 0-10-4-10-10z" fill="#d9913a" />}
      extra={<path d="M44 30l10 14M66 26l10 14M88 30l10 14" fill="none" stroke="#9c561a" strokeWidth="3" />}
    />
  );
}

export function Carrot() {
  return (
    <Sticker
      box="0 2 148 50"
      body={
        <>
          <path d="M30 22c-10-8-18-16-24-14 2 8 10 14 22 18M30 30c-12 0-20 4-24 10 8 2 16-2 24-6" fill="#3f9b4b" />
          <path d="M30 18c30-4 70-2 104 8 6 2 6 8 0 10-34 10-74 12-104 8-10-2-14-24 0-26z" fill="#f07a22" />
        </>
      }
      extra={<path d="M60 22v14M84 24v12M106 26v9" fill="none" stroke="#b9501a" strokeWidth="2.4" />}
    />
  );
}

export function Lemon() {
  return (
    <Sticker
      box="3 6 94 64"
      body={<path d="M10 38c0-5 4-8 8-10 8-16 56-18 66 0 4 2 8 5 8 10s-4 8-8 10c-10 18-58 16-66 0-4-2-8-5-8-10z" fill="#ffd93b" />}
      extra={<path d="M30 28c6-5 14-7 22-6" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" />}
    />
  );
}
