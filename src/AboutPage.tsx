import { useEffect, useRef } from "react";
import { FoodToys } from "./FoodToys";
import { pauseWhenOffscreen } from "./offscreen";
import { useT } from "./i18n";
import { aboutPageStrings } from "./i18n/strings/AboutPage";
import { Peel } from "./Peel";
import { Suppliers } from "./Suppliers";
import { TimeMachine } from "./TimeMachine";
import { WhyFilm } from "./WhyFilm";
import "./about.css";

/** Our story up top, the time-machine history, then the supplier side of the business. */
export function AboutPage({ onContact }: { onContact: () => void }) {
  const s = useT(aboutPageStrings);
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    if (hero.current) return pauseWhenOffscreen(hero.current);
  }, []);
  return (
    <main>
      <section className="page-hero about-hero" ref={hero} data-surface="green" aria-labelledby="about-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">{s.eyebrow}</p>
            <h1 id="about-title">{s.title}</h1>
            <p className="lead">{s.lead}</p>
            <div className="ah-story">
              <p>{s.storyOne}</p>
              <p>{s.storyTwo}</p>
              <p className="ah-why">{s.why}</p>
            </div>
            <FoodToys pillars={s.pillars} hints={s.toyHints} />
          </header>
          <div className="ah-art">
            <span className="ah-glow" aria-hidden="true" />
            {/* The float is on its own span: two animations on one element (the fade-up and the float) both end up on the main thread. */}
            <span className="ah-bob">
              <img className="hero-illo" src="/media/illo-about.png" alt="" />
            </span>
            {/* peel the seal and the shop is still there */}
            <Peel
              className="ah-seal"
              from="bl"
              bleed={0.04}
              back={{ borderRadius: "50%" }}
              under={<span className="ah-under">{s.sealUnder}</span>}
            >
              <span className="ah-seal-face">
                <small>{s.sealEst}</small>
                <b>1995</b>
                <small>{s.sealPlace}</small>
              </span>
            </Peel>
          </div>
        </div>
      </section>

      <TimeMachine />
      {/* The price explanation follows the timeline, so visitors get the story first. */}
      <WhyFilm />
      <Suppliers onContact={onContact} />
    </main>
  );
}
