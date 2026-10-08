import type { CSSProperties } from "react";
import "./stamp.css";

/**
 * Rubber stamp in speckled ink. It slams down (overshoot, ink settles) the
 * moment `on` turns true. Purely decorative: say the same thing in text nearby.
 */
export function Stamp({
  on,
  text,
  sub,
  tone = "red",
  className = "",
  style,
}: {
  on: boolean;
  text: string;
  sub?: string;
  tone?: "red" | "green" | "ink";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`ink-stamp ${className}`} data-on={on || undefined} data-tone={tone} style={style} aria-hidden="true">
      <span className="ink-stamp-in">
        <b>{text}</b>
        {sub && <small>{sub}</small>}
      </span>
    </span>
  );
}
