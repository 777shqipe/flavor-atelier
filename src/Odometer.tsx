import type { CSSProperties } from "react";

/**
 * Mechanical odometer: every digit is a strip that rolls to its new value.
 * Anything that is not a digit ($, ., kg) is printed as is.
 */
export function Odometer({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`odo ${className}`} role="img" aria-label={value}>
      {[...value].map((char, column) =>
        /\d/.test(char) ? (
          <span className="odo-col" key={column} style={{ "--c": column } as CSSProperties}>
            <span className="odo-strip" style={{ translate: `0 ${-Number(char) * 10}%` }}>
              {"0123456789".split("").map((n) => (
                <i key={n}>{n}</i>
              ))}
            </span>
          </span>
        ) : (
          <span className="odo-sym" key={column}>
            {char}
          </span>
        ),
      )}
    </span>
  );
}
