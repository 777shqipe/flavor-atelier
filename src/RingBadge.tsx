import { useId } from "react";

/** Slowly spinning text-on-a-circle sticker. */
export function RingBadge({ text, center, label, className = "" }: { text: string; center: string; label: string; className?: string }) {
  const id = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <div className={`ring-badge ${className}`} role="img" aria-label={label}>
      {/* The span turns, not the svg: Chrome runs a turning <div> or <span> on the GPU but keeps an <svg> on the main thread. */}
      <span className="ring-turn" aria-hidden="true">
        <svg viewBox="0 0 120 120" focusable="false">
          <defs>
            <path id={id} d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
          </defs>
          <text>
            <textPath href={`#${id}`} textLength="268" lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </svg>
      </span>
      <strong aria-hidden="true">{center}</strong>
    </div>
  );
}
