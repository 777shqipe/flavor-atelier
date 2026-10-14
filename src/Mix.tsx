import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { revealIn } from "./reveal";
import "./mix.css";

export type MixTab = { id: string; label: string; render: () => ReactNode };

/**
 * Several sections sharing one slot. Only the picked one is on the page; a
 * pill dock floats at the bottom of the screen while the slot is in view and
 * swaps between them, so the page stays short and nothing is said twice.
 */
export function Mix({ id, label, tabs }: { id: string; label: string; tabs: MixTab[] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // The page-level reveal only ran once, so sections swapped in get their own.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const panel = root.current?.querySelector(".mix-panel");
    return panel ? revealIn(panel) : undefined;
  }, [active]);

  const pick = (next: number) => {
    if (next === active) return;
    setActive(next);
    // Scrolled past the top of the slot: start the new section from its beginning.
    const el = root.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "instant" });
  };

  const onKey = (event: KeyboardEvent) => {
    const last = tabs.length - 1;
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = Math.min(last, Math.max(0, keys[event.key]));
    pick(next);
    bar.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <div className="mix" id={id} ref={root}>
      <div className="mix-panel" key={tabs[active].id} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
        {tabs[active].render()}
      </div>
      <div className="mix-dock">
        <div
          className="mix-bar"
          ref={bar}
          role="tablist"
          aria-label={label}
          onKeyDown={onKey}
          style={{ "--i": active, "--n": tabs.length } as CSSProperties}
        >
          <span className="mix-lens" aria-hidden="true" />
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === active}
              aria-controls={`${id}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => pick(index)}
            >
              <small>0{index + 1}</small>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
