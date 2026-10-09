import { CutLine } from "./Flyer";
import { RingBadge } from "./RingBadge";
import "./insta.css";

const PROFILE = "https://www.instagram.com/cheaperbuymiles/";

/** Issue number is the week of the year, dated from this week's Monday. Same count the flyer uses. */
const TODAY = new Date();
const MONDAY = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - ((TODAY.getDay() + 6) % 7));
const ISSUE = Math.ceil(((+MONDAY - +new Date(MONDAY.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
const WEEK = MONDAY.toLocaleDateString("en-AU", { day: "numeric", month: "short" });

type Hero = {
  id: string;
  href: string;
  img: string;
  alt: string;
  when: string;
  aisle: string;
  where: string;
  name: string;
  line: string;
  price: string;
  size: string;
};

type Ticket = {
  id: string;
  href: string;
  img: string;
  alt: string;
  name: string;
  meta: string;
  price: string;
  /** Spoken price when the printed one is a phrase, not a single figure. */
  priceLabel?: string;
};

const HEROES: Hero[] = [
  {
    id: "lasagne",
    href: "https://www.instagram.com/p/DeLjrMMmlVI",
    img: "/media/ig/lasagne.jpg",
    alt: "Ready Chef pork and beef lasagne, a 2 kilogram family bake priced at $8",
    when: "7 Oct",
    aisle: "Frozen",
    where: "Selected stores",
    name: "Pork & beef lasagne",
    line: "A 2kg family bake. Use by 9 Oct, so it is priced to move.",
    price: "$8",
    size: "2kg",
  },
  {
    id: "icecream",
    href: "https://www.instagram.com/p/DeQtNqlGlu6",
    img: "/media/ig/icecream.jpg",
    alt: "Bulla Speculoos Biscuit ice cream, a 5 litre tub priced at $12",
    when: "9 Oct",
    aisle: "Frozen",
    where: "Four stores",
    name: "Speculoos ice cream",
    line: "Bulla family dairy, five litres. A second flavour is in the post.",
    price: "$12",
    size: "5L",
  },
];

const TICKETS: Ticket[] = [
  {
    id: "tempeh",
    href: "https://www.instagram.com/p/DeJAYIEGtn8",
    img: "/media/ig/tempeh.jpg",
    alt: "Murni authentic Indonesian tempeh, 200 grams, three for $5",
    name: "Murni tempeh",
    meta: "6 Oct · 200g",
    price: "3 for $5",
    priceLabel: "3 for $5",
  },
  {
    id: "mikeike",
    href: "https://www.instagram.com/p/DeQsJFAGspS",
    img: "/media/ig/mikeike.jpg",
    alt: "Mike and Ike sour blue raspberry chews, 120 grams, priced at $2",
    name: "Mike and Ike",
    meta: "9 Oct · 120g",
    price: "$2",
  },
  {
    id: "water",
    href: "https://www.instagram.com/p/DeNzpaOGk3Z",
    img: "/media/ig/water.jpg",
    alt: "Melbourne Springs natural spring water, 1 litre, priced at $1",
    name: "Spring water",
    meta: "8 Oct · 1L",
    price: "$1",
  },
  {
    id: "almond",
    href: "https://www.instagram.com/p/DeLrKMPmnE8",
    img: "/media/ig/almond.jpg",
    alt: "Nuttelex barista almond milk, 1 litre, priced at $2",
    name: "Almond milk",
    meta: "7 Oct · 1L",
    price: "$2",
  },
  {
    id: "nuttelex",
    href: "https://www.instagram.com/p/DeQTZ7sk0o_",
    img: "/media/ig/nuttelex.jpg",
    alt: "Nuttelex Buttery spread, 500 grams, priced at $3",
    name: "Nuttelex Buttery",
    meta: "9 Oct · 500g",
    price: "$3",
  },
  {
    id: "bleach",
    href: "https://www.instagram.com/p/DeI2lwNGqJ0",
    img: "/media/ig/bleach.jpg",
    alt: "White King premium lavender bleach, 1.25 litres, priced at $3",
    name: "White King bleach",
    meta: "6 Oct · 1.25L",
    price: "$3",
  },
];

function Price({ value }: { value: string }) {
  const match = /^\$(\d+)$/.exec(value);
  if (!match) return <span className="ig-price ig-price-long">{value}</span>;
  return (
    <span className="ig-price">
      <sup>$</sup>
      {match[1]}
    </span>
  );
}

export function InstaShelf() {
  return (
    <section className="ig-shelf" id="instagram" data-surface="cream" aria-labelledby="ig-title">
      <CutLine />
      <header className="ig-head rv">
        <p className="ig-mast" aria-hidden="true">
          <span>No. {ISSUE}</span>
          <span>Week of {WEEK}</span>
          <span>@cheaperbuymiles</span>
        </p>
        <div className="ig-headline">
          <h2 id="ig-title" className="ig-title">
            The weekly <em>feed.</em>
          </h2>
          <RingBadge className="ig-ring" text="FOLLOW ALONG • @CHEAPERBUYMILES • " center="@" label="Follow @cheaperbuymiles on Instagram" />
        </div>
        <div className="ig-dek-row">
          <p className="ig-dek">
            The same finds, the way we post them. Prices are from the posts. Stock moves, and once it’s gone, it’s gone.
          </p>
          <a className="button outline" href={PROFILE} target="_blank" rel="noopener noreferrer">
            Follow on Instagram
          </a>
        </div>
      </header>

      <div className="ig-feature">
        {HEROES.map((post) => (
          <a key={post.id} className="ig-card ig-hero" href={post.href} target="_blank" rel="noopener noreferrer">
            <span className="ig-scan" aria-hidden="true" />
            <figure>
              <img src={post.img} alt={post.alt} width={1080} height={1440} />
            </figure>
            <div className="ig-body">
              <p className="ig-kicker">
                <span>{post.when}</span>
                <span>{post.aisle}</span>
              </p>
              <h3>{post.name}</h3>
              <p className="ig-line">{post.line}</p>
              <dl className="ig-cells">
                <div>
                  <dt>Size</dt>
                  <dd>{post.size}</dd>
                </div>
                <div>
                  <dt>Where</dt>
                  <dd>{post.where}</dd>
                </div>
                <div>
                  <dt>From</dt>
                  <dd>Instagram</dd>
                </div>
              </dl>
              <div className="ig-bar">
                <span>See the post</span>
                <Price value={post.price} />
              </div>
            </div>
            <span className="sr-only">Opens the Instagram post in a new tab.</span>
          </a>
        ))}
      </div>

      <ul className="ig-grid">
        {TICKETS.map((post) => (
          <li key={post.id}>
            <a className="ig-card ig-ticket" href={post.href} target="_blank" rel="noopener noreferrer">
              <span className="ig-scan" aria-hidden="true" />
              <figure>
                <img src={post.img} alt={post.alt} width={1080} height={1440} />
              </figure>
              <div className="ig-label">
                <Price value={post.price} />
                <span className="ig-label-meta">
                  <b>{post.name}</b>
                  {post.meta}
                </span>
                <span className="ig-code" aria-hidden="true" />
              </div>
              <span className="sr-only">
                {post.priceLabel ? `${post.priceLabel}. ` : ""}
                Opens the Instagram post in a new tab.
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
