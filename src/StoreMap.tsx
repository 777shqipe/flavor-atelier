import { useEffect, useRef, useState, type CSSProperties } from "react";
import L from "leaflet";
import { Glass } from "./Glass";
import {
  ROUTE,
  STORES,
  directionsLink,
  distanceKm,
  formatKm,
  type Store,
} from "./stores";
import { glyphSvg } from "./glyphs";
import { useOpenStatus } from "./useOpenStatus";
import "./storemap.css";

const pinHtml = (store: Store, index: number) => `
  <div class="pin" style="--c:${store.color};--i:${index}">
    <span class="pin-pulse"></span>
    <span class="pin-body"><span class="pin-glyph">${glyphSvg(store.glyph)}</span></span>
    <span class="pin-tag">${store.name}</span>
  </div>`;

const CART_HTML = `
  <div class="cart-dot">
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 14h4.5l3.2 15a1.7 1.7 0 0 0 1.7 1.3h12.3a1.7 1.7 0 0 0 1.7-1.3L37 19H17"/>
      </g>
      <circle cx="21.5" cy="36" r="2.3" fill="currentColor"/><circle cx="32.5" cy="36" r="2.3" fill="currentColor"/>
    </svg>
  </div>`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Near =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; index: number; km: number }
  | { status: "error"; message: string };

export function StoreMap({
  active,
  onSelect,
  variant = "full",
  onOpenFinder,
}: {
  active: number | null;
  onSelect: (index: number) => void;
  variant?: "full" | "compact";
  onOpenFinder?: () => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const cart = useRef<L.Marker | null>(null);
  const me = useRef<L.CircleMarker | null>(null);
  const previous = useRef<number | null>(null);
  const frame = useRef(0);
  const onSelectRef = useRef(onSelect);
  const [near, setNear] = useState<Near>({ status: "idle" });
  const status = useOpenStatus();

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Build the map once.
  useEffect(() => {
    const el = node.current;
    if (!el || mapRef.current) return;
    const touch = L.Browser.mobile;
    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: !touch,
      zoomSnap: 0.25,
      minZoom: 9,
      maxZoom: 17,
    });
    L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    }).addTo(map);

    const points = STORES.map((store) => L.latLng(store.lat, store.lon));
    map.fitBounds(L.latLngBounds(points), { padding: [70, 70] });

    L.polyline(
      ROUTE.map((index) => points[index]),
      { className: "route", color: "#004734", weight: 3.5, opacity: 0.9, dashArray: "1 10", lineCap: "round", interactive: false },
    ).addTo(map);

    markers.current = STORES.map((store, index) => {
      const marker = L.marker(points[index], {
        icon: L.divIcon({ className: "sm-marker", html: pinHtml(store, index), iconSize: [0, 0] }),
        title: `${store.name} store`,
        alt: `${store.name} store`,
        riseOnHover: true,
      }).addTo(map);
      marker.on("click", () => onSelectRef.current(index));
      return marker;
    });

    cart.current = L.marker(points[0], {
      icon: L.divIcon({ className: "sm-cart", html: CART_HTML, iconSize: [40, 40], iconAnchor: [20, 20] }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 2000,
    }).addTo(map);

    mapRef.current = map;
    const settle = window.setTimeout(() => map.invalidateSize(), 80);
    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(frame.current);
      map.remove();
      mapRef.current = null;
      markers.current = [];
    };
  }, []);

  // Follow the selection: highlight the pin, send the cart over, fly the camera.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.current.forEach((marker, index) => {
      marker.getElement()?.classList.toggle("active", index === active);
      marker.setZIndexOffset(index === active ? 1000 : 0);
    });
    const from = previous.current;
    previous.current = active;
    if (active === null) return;

    const target = L.latLng(STORES[active].lat, STORES[active].lon);
    const animate = !reduced();
    map.flyTo(target, 14.5, { animate, duration: 1.3, easeLinearity: 0.2 });

    const cartMarker = cart.current;
    if (animate && cartMarker && from !== null && from !== active) {
      const a = L.latLng(STORES[from].lat, STORES[from].lon);
      const start = performance.now();
      const ms = 1300;
      cartMarker.setLatLng(a);
      cartMarker.getElement()?.classList.add("go");
      cancelAnimationFrame(frame.current);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const k = ease(t);
        cartMarker.setLatLng([a.lat + (target.lat - a.lat) * k, a.lng + (target.lng - a.lng) * k]);
        if (t < 1) frame.current = requestAnimationFrame(step);
        else cartMarker.getElement()?.classList.remove("go");
      };
      frame.current = requestAnimationFrame(step);
    }
  }, [active]);

  const overview = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyToBounds(L.latLngBounds(STORES.map((store) => L.latLng(store.lat, store.lon))), {
      padding: [70, 70],
      duration: 1.1,
    });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setNear({ status: "error", message: "Location isn’t available in this browser." });
      return;
    }
    setNear({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        let best = 0;
        let bestKm = Infinity;
        STORES.forEach((store, index) => {
          const km = distanceKm(coords.latitude, coords.longitude, store.lat, store.lon);
          if (km < bestKm) {
            bestKm = km;
            best = index;
          }
        });
        const map = mapRef.current;
        if (map) {
          me.current?.remove();
          me.current = L.circleMarker([coords.latitude, coords.longitude], {
            className: "me",
            radius: 8,
            color: "#fff",
            weight: 3,
            fillColor: "#2f80ed",
            fillOpacity: 1,
          }).addTo(map);
        }
        setNear({ status: "ok", index: best, km: bestKm });
        onSelect(best);
      },
      (error) =>
        setNear({
          status: "error",
          message: error.code === 1 ? "Location permission was declined." : "Couldn’t work out where you are.",
        }),
      { timeout: 8000 },
    );
  };

  const store = active === null ? null : STORES[active];
  const others = store
    ? STORES.map((other, index) => ({ other, index, km: distanceKm(store.lat, store.lon, other.lat, other.lon) }))
        .filter((entry) => entry.index !== active)
        .sort((a, b) => a.km - b.km)
    : [];
  const step = (direction: number) => onSelect(((active ?? 0) + direction + STORES.length) % STORES.length);

  return (
    <div className={`finder ${variant}`}>
      <div className="finder-stage">
        <div
          ref={node}
          className="finder-map"
          role="region"
          aria-label="Map of the four Cheaper Buy Miles stores in inner Melbourne"
        />

        {variant === "full" ? (
          <>
            <div className="finder-top left">
              <Glass className="fglass" radius={26}>
                <button className="locate" type="button" onClick={locate} disabled={near.status === "loading"}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
                  </svg>
                  {near.status === "loading" ? "Locating…" : "Find my nearest"}
                </button>
              </Glass>
              {near.status === "error" && <p className="finder-note">{near.message}</p>}
              {near.status === "ok" && (
                <p className="finder-note ok">
                  Nearest: <b>{STORES[near.index].name}</b> · {formatKm(near.km)} away
                </p>
              )}
            </div>
            <div className="finder-top right">
              <Glass className="fglass zoom" radius={26}>
                <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
                  +
                </button>
                <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
                  −
                </button>
                <button type="button" className="all" aria-label="Show all stores" onClick={overview}>
                  All
                </button>
              </Glass>
            </div>

            {store && (
              <Glass className="finder-card" radius={30} style={{ "--c": store.color } as CSSProperties}>
                <div className="fc" key={store.id}>
                  <div className="fc-photo">
                    <img src={store.src} alt={`${store.name} storefront`} style={{ objectPosition: store.pos }} />
                    <span className="fc-badge" dangerouslySetInnerHTML={{ __html: glyphSvg(store.glyph) }} />
                  </div>
                  <div className="fc-body">
                    <p className={`fc-status${status.open ? " open" : ""}`}>
                      <i /> {status.label}
                    </p>
                    <h3>{store.name}</h3>
                    <p className="fc-address">{store.address}</p>
                    <p className="fc-line">{store.line}</p>
                    <div className="fc-actions">
                      <a className="fc-primary" href={directionsLink(store)} target="_blank" rel="noreferrer">
                        Directions
                      </a>
                      <a href={`tel:${store.phone.replaceAll(" ", "")}`}>{store.phone}</a>
                    </div>
                  </div>
                  <div className="fc-nav">
                    <button type="button" aria-label="Previous store" onClick={() => step(-1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 12H5M11 6l-6 6 6 6" />
                      </svg>
                    </button>
                    <button type="button" aria-label="Next store" onClick={() => step(1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 12h15M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="fc-near">
                  Next closest: <b>{others[0].other.name}</b> · {formatKm(others[0].km)}
                </p>
              </Glass>
            )}
          </>
        ) : (
          onOpenFinder && (
            <button className="finder-open" type="button" onClick={onOpenFinder}>
              Open the store finder
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
          )
        )}
      </div>

      {variant === "full" && (
        <ul className="finder-chips">
          {STORES.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active === index}
                style={{ "--c": item.color } as CSSProperties}
                onClick={() => onSelect(index)}
              >
                <span className="chip-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(item.glyph) }} />
                <span>
                  <b>{item.name}</b>
                  <small>{item.address.split(",")[0]}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
