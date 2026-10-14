import { JamShelf } from "./JamShelf";
import { Peel } from "./Peel";
import { Suppliers } from "./Suppliers";
import "./about.css";

/** Our story up top, the jam-jar history, then the supplier side of the business. */
export function AboutPage({ onContact }: { onContact: () => void }) {
  return (
    <main>
      <section className="page-hero about-hero" data-surface="green" aria-labelledby="about-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">About us</p>
            <h1 id="about-title">
              Fighting{" "}
              <span className="ah-mark">
                food waste
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength="1" d="M4 13C70 5 160 4 296 9" />
                </svg>
              </span>{" "}
              <em className="ah-italic">since 1995.</em>
            </h1>
            <p className="lead">It started with a simple idea: perfectly good food should never go to waste.</p>
            <div className="ah-story">
              <p>
                We buy close-to-date, past best-before and surplus stock from suppliers all over Australia, then sell it
                for a fraction of the price. Same great brands, same great quality, just a lot cheaper.
              </p>
              <p>
                What began as a small shop selling jam has grown into four much-loved stores. Ridiculous prices, a{" "}
                <em>serious</em> purpose.
              </p>
            </div>
            <ul className="story-pillars">
              <li>
                <b>Up to 70% off</b>
                <span>Big-brand groceries</span>
              </li>
              <li>
                <b>Zero landfill</b>
                <span>Good food gets eaten</span>
              </li>
              <li>
                <b>4 inner-Melb shops</b>
                <span>New stock daily</span>
              </li>
            </ul>
          </header>
          <div className="ah-art">
            <span className="ah-glow" aria-hidden="true" />
            <img className="hero-illo" src="/media/illo-about.png" alt="" />
            {/* peel the seal and the shop is still there */}
            <Peel
              className="ah-seal"
              from="bl"
              bleed={0.04}
              back={{ borderRadius: "50%" }}
              under={
                <span className="ah-under">
                  Still
                  <br />
                  here.
                </span>
              }
            >
              <span className="ah-seal-face">
                <small>Est.</small>
                <b>1995</b>
                <small>Melbourne</small>
              </span>
            </Peel>
          </div>
        </div>
      </section>

      <JamShelf />
      <Suppliers onContact={onContact} />
    </main>
  );
}
