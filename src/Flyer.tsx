import { useMemo, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { Pack } from "./Pack";
import { CATEGORIES, ITEMS, type CatId, type Item } from "./products";
import "./flyer.css";

type Sort = "featured" | "price" | "saving";
type CatFilter = CatId | "all";

const COLOR = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color])) as Record<CatId, string>;
const saving = (item: Item) => (item.was ? 1 - item.price / item.was : 0);
const money = (value: number) => `$${value % 1 ? value.toFixed(2) : value}`;

/** Animates the grid between two states with the View Transitions API where it exists. */
function morph(update: () => void) {
  if (!("startViewTransition" in document) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  // A newer click skips the running transition; that is expected, not an error.
  const ignore = () => {};
  transition.ready.catch(ignore);
  transition.finished.catch(ignore);
  transition.updateCallbackDone.catch(ignore);
}

function CatIcon({ id }: { id: CatFilter }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {id === "all" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </>
      )}
      {id === "drinks" && <path d="M10 3h4v4l2 3v10a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V10l2-3zM8 13h8" />}
      {id === "pantry" && <path d="M7 4h10v3H7zM6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM6 12h12" />}
      {id === "noodles" && <path d="M3 12h18a9 9 0 0 1-18 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4" />}
      {id === "snacks" && <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM5 9h14M5 15h14M12 3v18" />}
      {id === "breakfast" && <path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6v3M5.5 9.5l2 2M18.5 9.5l-2 2" />}
      {id === "fridge" && <path d="M7 9l5-5 5 5v11H7zM7 9h10M10 14h4" />}
      {id === "frozen" && <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5" />}
      {id === "household" && <path d="M8 11h7v10H8zM9 8h5v3M14 6h4l1.5 2.5" />}
    </svg>
  );
}

function Price({ value }: { value: number }) {
  const whole = Math.floor(value);
  const cents = Math.round((value - whole) * 100);
  return (
    <span className="now">
      <sup>$</sup>
      {whole}
      {cents > 0 && <sup>{String(cents).padStart(2, "0")}</sup>}
    </span>
  );
}

function Deal({ item }: { item: Item }) {
  const off = item.was ? Math.round(saving(item) * 100) : 0;
  return (
    <article className="deal" style={{ "--c": COLOR[item.cat] } as CSSProperties}>
      <div className="deal-art">
        {item.tag && (
          <span className="deal-tag" data-tag={item.tag}>
            {item.tag}
          </span>
        )}
        {off > 0 && (
          <span className="deal-save" aria-label={`${off}% off`}>
            <b>-{off}%</b>
          </span>
        )}
        {item.img ? (
          <img
            src={item.img.src}
            width={item.img.w}
            height={item.img.h}
            alt={item.name}
            data-wide={item.img.w / item.img.h > 1.5 || undefined}
            loading="lazy"
            draggable={false}
          />
        ) : (
          item.shape && item.color && item.label && <Pack shape={item.shape} color={item.color} label={item.label} />
        )}
      </div>
      <div className="deal-info">
        <h4>{item.name}</h4>
        <p className="deal-line">{item.line}</p>
        <div className="deal-price">
          <Price value={item.price} />
          {item.was && <s>was {money(item.was)}</s>}
          <span className="unit">{item.unit}</span>
        </div>
      </div>
    </article>
  );
}

const SORTS: Array<[Sort, string]> = [
  ["featured", "Featured"],
  ["price", "Price ↑"],
  ["saving", "Best saving"],
];

export function Flyer() {
  const [cat, setCat] = useState<CatFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [special, setSpecial] = useState(false);

  const q = query.trim().toLowerCase();
  const base = useMemo(
    () =>
      ITEMS.filter(
        (item) =>
          (!special || item.was) && (!q || item.name.toLowerCase().includes(q) || item.line.toLowerCase().includes(q)),
      ),
    [special, q],
  );
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: base.length };
    for (const item of base) map[item.cat] = (map[item.cat] ?? 0) + 1;
    return map;
  }, [base]);
  const visible = useMemo(() => {
    const list = cat === "all" ? base : base.filter((item) => item.cat === cat);
    if (sort === "price") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "saving") return [...list].sort((a, b) => saving(b) - saving(a));
    return list;
  }, [base, cat, sort]);

  const filtered = cat !== "all" || q !== "" || special || sort !== "featured";
  const reset = () =>
    morph(() => {
      setCat("all");
      setQuery("");
      setSort("featured");
      setSpecial(false);
    });

  return (
    <section className="flyer" id="flyer" data-surface="cream" aria-labelledby="flyer-title">
      <div className="flyer-head rv">
        <div>
          <p className="eyebrow">Every aisle, every week</p>
          <h2 id="flyer-title" className="flyer-title">
            <span>The weekly</span>
            <span className="fun">flyer</span>
          </h2>
        </div>
        <div className="flyer-stamp" aria-hidden="true">
          <b>While</b>
          <b>stock</b>
          <b>lasts</b>
        </div>
      </div>

      <div className="flyer-tools" role="search">
        <label className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <input
            type="search"
            placeholder="Search the aisles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search the flyer"
          />
        </label>
        <button
          type="button"
          className="toggle"
          aria-pressed={special}
          onClick={() => morph(() => setSpecial((value) => !value))}
        >
          On special
        </button>
        <div className="sorts" role="group" aria-label="Sort">
          {SORTS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={sort === id} onClick={() => morph(() => setSort(id))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flyer-bar">
        <div className="chips" role="group" aria-label="Filter by aisle">
          {[{ id: "all" as const, label: "All aisles", color: "#f6b531" }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={cat === c.id}
              style={{ "--c": c.color } as CSSProperties}
              onClick={() => morph(() => setCat(c.id))}
            >
              <CatIcon id={c.id} />
              {c.label}
              <b>{counts[c.id] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      <p className="flyer-meta" aria-live="polite">
        <strong>{visible.length}</strong> {visible.length === 1 ? "find" : "finds"}
        {cat !== "all" && <> in {CATEGORIES.find((c) => c.id === cat)?.label}</>}
        {filtered && (
          <button type="button" onClick={reset}>
            Clear all
          </button>
        )}
        <span className="flyer-foot">Preview range · names and prices are placeholders</span>
      </p>

      {visible.length > 0 ? (
        <ul className="flyer-grid">
          {visible.map((item) => (
            <li
              key={item.id}
              className={item.big ? "big" : undefined}
              style={{ viewTransitionName: `deal-${item.id}` }}
            >
              <Deal item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flyer-empty">
          <strong>Nothing on this shelf.</strong>
          <p>Stock moves fast. Try another aisle or clear the filters.</p>
          <button className="button dark" type="button" onClick={reset}>
            Show everything
          </button>
        </div>
      )}
    </section>
  );
}
