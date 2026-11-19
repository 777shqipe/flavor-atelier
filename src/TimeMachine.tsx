import { useT } from "./i18n";
import { timeMachineStrings } from "./i18n/strings/TimeMachine";
import "./timemachine.css";

const ERAS = [
  { id: "first", year: "1995", src: "/media/about-1995.jpg" },
  { id: "growing", year: "2005", src: "/media/about-basket.jpg" },
  { id: "more", year: "2015", src: "/media/about-aisle.jpg" },
  { id: "today", year: String(new Date().getFullYear()), src: "/media/about-shelf.jpg" },
] as const;

/** A simple chronological story: one date, one photograph, one short explanation. */
export function TimeMachine() {
  const s = useT(timeMachineStrings);
  return (
    <section className="tm" id="timeline" data-surface="cream" aria-labelledby="tm-title">
      <header className="tm-intro">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="tm-title">{s.historyLabel}</h2>
      </header>
      <ol className="tm-list">
        {ERAS.map((era) => {
          const copy = s.eras[era.id];
          return (
            <li className="tm-event" key={era.id}>
              <div className="tm-picture">
                <img src={era.src} alt={s.photoAlt(copy.title, era.year)} loading="lazy" decoding="async" />
              </div>
              <div className="tm-date"><time dateTime={era.year}>{era.year}</time></div>
              <div className="tm-description">
                <h3>{copy.title}</h3>
                <p>{copy.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
