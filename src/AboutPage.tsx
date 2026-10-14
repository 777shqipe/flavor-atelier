import type { CSSProperties } from "react";
import { DateCheck } from "./DateCheck";
import { JamShelf } from "./JamShelf";
import { Peel } from "./Peel";
import { WasteNumbers } from "./WasteNumbers";
import "./about.css";

const YEARS = new Date().getFullYear() - 1995;

export function AboutPage() {
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
            <dl className="ah-facts">
              <div>
                <dt>Years at it</dt>
                <dd>{YEARS}</dd>
              </div>
              <div>
                <dt>Stores</dt>
                <dd>4</dd>
              </div>
              <div>
                <dt>Food rescued</dt>
                <dd>Millions of kg</dd>
              </div>
            </dl>
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

      <section className="story" data-surface="cream" aria-labelledby="story-title">
        <div className="story-lead rv">
          <div className="story-card">
            <span className="sc-kicker">SINCE 1995</span>
            <span className="sc-num" aria-hidden="true">
              {YEARS}
            </span>
            <p>years of bargains, challenges and positive change.</p>
            <span className="sc-stamp" aria-hidden="true">
              STILL SAVING
            </span>
          </div>
        </div>
        <div className="story-copy rv" style={{ "--rv": "120ms" } as CSSProperties}>
          <span className="chapter" aria-hidden="true">01</span>
          <p className="eyebrow">Our story</p>
          <h2 id="story-title">
            Ridiculous prices.
            <br />A <em>serious</em> purpose.
          </h2>
          <p>
            Cheaper Buy Miles has been fighting food waste since 1995. We buy close-to-date, past best-before and
            surplus stock from suppliers all over Australia, then sell it for a fraction of the price.
          </p>
          <p>
            Same great brands, same great quality, just a lot cheaper. What began as a small shop selling jam has grown
            into four much-loved stores.
          </p>
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
        </div>
      </section>

      <JamShelf />
      <WasteNumbers />
      <DateCheck />
    </main>
  );
}
