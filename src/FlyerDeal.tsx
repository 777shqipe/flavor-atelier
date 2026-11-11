import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useT } from "./i18n";
import { flyerDealStrings } from "./i18n/strings/FlyerDeal";
import { productStrings } from "./i18n/strings/Products";
import { Pack } from "./Pack";
import { pickLook, type Look } from "./flyerLooks";
import type { Item } from "./products";
import { pauseWhenOffscreen } from "./offscreen";

/**
 * One flyer card, in one of eight looks borrowed from real packaging and shop
 * fittings: a split product label, a giant outlined shout, a round portrait
 * flanked by words, ribbon tape, a shelf-edge ticket, a savings panel laid out
 * like a nutrition panel, a case lot, and a words-only card. Sizes vary too, so
 * the grid reads like a laid-out catalogue rather than a wall of tiles.
 */

type Reason = "newLine" | "caseLot" | "limitedRun" | "overstock" | "everyday";

const money = (value: number) => `$${value % 1 ? value.toFixed(2) : value}`;
const offOf = (item: Item) => (item.was ? Math.round((1 - item.price / item.was) * 100) : 0);

/** Why it is on the flyer at all, when the range does not give a note. Placeholder reasons, like the rest of the range. */
const reasonOf = (item: Item): Reason =>
  item.tag === "New" ? "newLine" : item.tag === "Bulk" ? "caseLot" : item.tag === "Limited" ? "limitedRun" : item.was ? "overstock" : "everyday";

function Price({ value, className = "dl-now" }: { value: number; className?: string }) {
  const whole = Math.floor(value);
  const cents = Math.round((value - whole) * 100);
  return (
    <span className={className}>
      <sup>$</sup>
      {whole}
      {cents > 0 && <sup>{String(cents).padStart(2, "0")}</sup>}
    </span>
  );
}

function Art({ item, className = "dl-art" }: { item: Item; className?: string }) {
  return (
    <span className={className}>
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
        item.shape && item.color && item.label && <Pack shape={item.shape} color={item.color} label={item.label} tight />
      )}
    </span>
  );
}

const Tag = ({ item }: { item: Item }) => {
  const p = useT(productStrings);
  return item.tag ? (
    <span className="dl-tag" data-tag={item.tag}>
      {p.tags[item.tag]}
    </span>
  ) : null;
};

function Card({
  item,
  look,
  children,
  style,
  tone,
}: {
  item: Item;
  look: Look;
  children: ReactNode;
  style?: CSSProperties;
  tone?: number;
}) {
  const s = useT(flyerDealStrings);
  const p = useT(productStrings);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (root.current) return pauseWhenOffscreen(root.current);
  }, []);
  return (
    <article className="deal" ref={root} data-look={look} data-tone={tone} style={style}>
      {/* hover runs a till scanner down the card, then the price beeps */}
      <span className="deal-scan" aria-hidden="true" />
      {children}
      <span className="sr-only">
        {s.label(item.name, money(item.price), item.was ? money(item.was) : undefined, p.units[item.id] ?? item.unit)}
      </span>
    </article>
  );
}

export function Deal({ item, index }: { item: Item; index: number }) {
  const [look, , note] = pickLook(item);
  const off = offOf(item);
  const s = useT(flyerDealStrings);
  const p = useT(productStrings);
  const cat = p.cats[item.cat];
  const line = p.lines[item.id] ?? item.line;
  const unit = p.units[item.id] ?? item.unit;
  const why = s.notes[note ?? reasonOf(item)];

  switch (look) {
    /* Dark label beside a sun panel, huge cream name, spec cells, price bar (Bucks-style). */
    case "split":
      return (
        <Card item={item} look={look}>
          <div className="dl-split-art">
            <Tag item={item} />
            <Art item={item} />
          </div>
          <div className="dl-split-body" aria-hidden="true">
            <p className="dl-kicker">
              {cat} · {s.no(String(index + 1).padStart(2, "0"))}
            </p>
            <h4 className="dl-split-name">{item.name}</h4>
            <p className="dl-split-line">{line}</p>
            <dl className="dl-cells">
              <div>
                <dt>{s.size}</dt>
                <dd>{unit}</dd>
              </div>
              <div>
                <dt>{s.rrp}</dt>
                <dd>{item.was ? money(item.was) : "—"}</dd>
              </div>
              <div>
                <dt>{s.whyCheap}</dt>
                <dd>{why}</dd>
              </div>
            </dl>
            <div className="dl-bar">
              <span>{off ? s.save(`${off}%`) : s.inStore}</span>
              <Price value={item.price} />
            </div>
          </div>
        </Card>
      );

    /* Giant outlined word behind the product, little rotated labels (CRAV-style). */
    case "shout": {
      const word = item.img ? item.name.split(" ")[0] : (item.label ?? [item.name]).join(" ");
      return (
        <Card item={item} look={look} style={{ "--fs": `${Math.min(30, 190 / word.length)}cqw` } as CSSProperties}>
          <b className="dl-shout" aria-hidden="true" data-word={word}>
            {word}
          </b>
          <Art item={item} />
          <span className="dl-sticker one" aria-hidden="true">
            {off ? s.percentOff(off) : item.tag ? p.tags[item.tag] : s.newIn}
          </span>
          <span className="dl-sticker two" aria-hidden="true">
            {unit}
          </span>
          <div className="dl-foot" aria-hidden="true">
            <div>
              <h4 className="dl-name">{item.name}</h4>
              <p className="dl-line">{line}</p>
            </div>
            <div className="dl-pricebox">
              {item.was && <s>{money(item.was)}</s>}
              <Price value={item.price} />
            </div>
          </div>
        </Card>
      );
    }

    /* Product in a round frame, two big words either side (bánh mì-style). */
    case "portrait": {
      const [left, right = ""] = item.label ?? [item.name];
      return (
        <Card item={item} look={look}>
          <div className="dl-top" aria-hidden="true">
            <span>{cat}</span>
            <span>{unit}</span>
            <span>{off ? s.save(money((item.was ?? 0) - item.price)) : why}</span>
          </div>
          <div className="dl-row" aria-hidden="true">
            <b className="dl-word">{left}</b>
            <span className="dl-disc">
              <Art item={item} />
            </span>
            <b className="dl-word">{right}</b>
          </div>
          <div className="dl-foot" aria-hidden="true">
            <p className="dl-line">{line}</p>
            <span className="dl-serif-price">
              {money(item.price)}
              {item.was && <s>{money(item.was)}</s>}
            </span>
          </div>
        </Card>
      );
    }

    /* Floating product wrapped in offset ribbons of tape (cookie-style). */
    case "ribbon": {
      const tapes = [
        item.tag ? s.rescuedTape(p.tags[item.tag]) : s.rescued,
        item.name,
        `${money(item.price)}${item.was ? ` · ${s.wasPrice(money(item.was))}` : ""}`,
      ];
      return (
        <Card item={item} look={look}>
          <Art item={item} />
          <div className="dl-tapes" aria-hidden="true">
            {tapes.map((text, i) => (
              <span key={i} className="dl-tape" data-n={i}>
                <i>
                  {text} ✦ {text} ✦ {text} ✦{" "}
                </i>
              </span>
            ))}
          </div>
          <p className="dl-line" aria-hidden="true">
            {line}
          </p>
        </Card>
      );
    }

    /* A real shelf-edge label; a clearance sticker slides over it on hover. */
    case "ticket":
      return (
        <Card item={item} look={look}>
          <div className="dl-shelf" aria-hidden="true">
            <Tag item={item} />
            <Art item={item} />
            <h4 className="dl-name">{item.name}</h4>
          </div>
          <div className="dl-label" aria-hidden="true">
            <Price value={item.price} />
            <span className="dl-label-meta">
              <b>{unit}</b>
              <span>{item.was ? s.wasPrice(money(item.was)) : s.everyDay}</span>
            </span>
            <i className="dl-code" />
          </div>
          {off > 0 && (
            <span className="dl-clear" aria-hidden="true">
              <b>−{off}%</b> {s.reducedToClear}
            </span>
          )}
        </Card>
      );

    /* Savings laid out like a nutrition information panel. */
    case "panel":
      return (
        <Card item={item} look={look}>
          <div className="dl-panel-head" aria-hidden="true">
            <Art item={item} />
            <div>
              <h4 className="dl-name">{item.name}</h4>
              <p className="dl-line">{line}</p>
            </div>
          </div>
          <table className="dl-table" aria-hidden="true">
            <caption>{s.savings}</caption>
            <tbody>
              <tr>
                <th>{s.packSize}</th>
                <td>{unit}</td>
              </tr>
              <tr>
                <th>{s.usualPrice}</th>
                <td>{item.was ? money(item.was) : "—"}</td>
              </tr>
              <tr>
                <th>{s.ourPrice}</th>
                <td>{money(item.price)}</td>
              </tr>
              <tr className="dl-save-row">
                <th>{s.youSave}</th>
                <td>{item.was ? `${money(item.was - item.price)} (${off}%)` : "—"}</td>
              </tr>
              <tr>
                <th>{s.whyHere}</th>
                <td>{why}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      );

    /* The whole case: a tray of six, stencilled like a carton. */
    case "case":
      return (
        <Card item={item} look={look}>
          <div className="dl-tray" aria-hidden="true" data-tray={s.tray}>
            {Array.from({ length: 6 }, (_, i) => (
              <Art key={i} item={item} className="dl-unit" />
            ))}
          </div>
          <div className="dl-case-body" aria-hidden="true">
            <p className="dl-stencil">{unit}</p>
            <h4 className="dl-name">{item.name}</h4>
            <p className="dl-line">{line}</p>
            <div className="dl-case-price">
              <Price value={item.price} />
              {item.was && <s>{money(item.was)}</s>}
            </div>
          </div>
        </Card>
      );

    /* Just the word. The pack peeks up from the bottom edge on hover. */
    case "words":
      return (
        <Card item={item} look={look} tone={index % 3}>
          <p className="dl-kicker" aria-hidden="true">
            {cat}
          </p>
          <b className="dl-big-word" aria-hidden="true">
            {s.bigWord(note ? s.notes[note] : item.name.toLowerCase())}
          </b>
          <p className="dl-line" aria-hidden="true">
            {line}
          </p>
          <div className="dl-foot" aria-hidden="true">
            <Price value={item.price} />
            <span className="dl-unit-chip">{unit}</span>
          </div>
          <Art item={item} className="dl-peek" />
        </Card>
      );
  }
}
