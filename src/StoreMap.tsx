import { useEffect, useRef, useState, type ReactNode } from "react";
import type * as L from "leaflet";
import { loadLeaflet, type Lib } from "./leaflet";
import { LANDMARKS, landmarkHtml, shopPinSvg } from "./mapArt";
import { STORES, distanceKm, formatKm, type Store } from "./stores";
import { useT } from "./i18n";
import { storeMapStrings } from "./i18n/strings/StoreMap";
import "./storemap.css";

/**
 * The store map, printed on parchment: green-inked streets and water, four light
 * CBM shopfronts for pins and a few faded landmarks for bearings. Picking a
 * store glides the map over to it. Whatever is passed as children floats over
 * the map, above the tiles and below nothing.
 */

/** Name tags hang to the right of the shop, except where a landmark already sits there. */
const TAG_LEFT = new Set(["flemington"]);

const pinHtml = (store: Store) => `
  <div class="pin" style="--c:${store.color}">
    <span class="pin-shadow"></span>
    <span class="pin-art">${shopPinSvg(store)}</span>
    <span class="pin-tag${TAG_LEFT.has(store.id) ? " left" : ""}"><i></i>${store.name}</span>
  </div>`;

/**
 * Gradient map for Esri's light grey tiles, as [luminance, colour] stops: water
 * turns sage, parks pale green, land the page's parchment and streets a faint
 * green ink. Sampled into a 101-step table for the SVG filter below.
 */
const INK_STOPS: [number, string][] = [
  [0, "#2f5a4a"],
  [0.7, "#7d9a86"],
  [0.8, "#a3bba6"],
  [0.85, "#c3cfb5"],
  [0.9, "#dcdfc3"],
  [0.915, "#eee7cf"],
  [0.94, "#eee7cf"],
  [0.975, "#e0e2ca"],
  [1, "#d5dbc2"],
];
const INK_TABLES = [0, 1, 2].map((channel) =>
  Array.from({ length: 101 }, (_, step) => {
    const l = step / 100;
    const k = Math.max(1, INK_STOPS.findIndex(([at]) => at >= l));
    const [a, from] = INK_STOPS[k - 1];
    const [b, to] = INK_STOPS[k];
    const t = (l - a) / (b - a || 1);
    const value = (hex: string) => parseInt(hex.slice(1 + channel * 2, 3 + channel * 2), 16) / 255;
    return (value(from) + (value(to) - value(from)) * t).toFixed(3);
  }).join(" "),
);

/** A px length the stylesheet sets on the map (see --float-room and --inset-l/r in storemap.css). */
const cssPx = (map: L.Map, name: string) => parseFloat(getComputedStyle(map.getContainer()).getPropertyValue(name)) || 0;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type StoreMapText = typeof storeMapStrings.en;
/** A landmark's caption in the given strings; `id` is the landmark's key in them. */
const caption = (text: StoreMapText, id: string) => text.landmarks[id as keyof StoreMapText["landmarks"]];

type Near =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; index: number; km: number }
  | { status: "error"; reason: keyof StoreMapText["locateError"] };

export function StoreMap({
  active,
  onSelect,
  children,
}: {
  active: number;
  onSelect: (index: number) => void;
  children?: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const overviewRef = useRef<(() => void) | null>(null);
  const me = useRef<L.Marker | null>(null);
  const meLine = useRef<L.Polyline | null>(null);
  const fromMe = useRef<L.LatLng | null>(null);
  const previous = useRef<number | null>(null);
  const onSelectRef = useRef(onSelect);
  const lib = useRef<Lib | null>(null);
  // Leaflet arrives after the page does; the effects that need it run again once it has.
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState<Near>({ status: "idle" });
  const s = useT(storeMapStrings);
  // The map build and the geolocation callback run outside render, so they read the language from here.
  const text = useRef(s);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Leaflet writes its own markup, so the labels in it are updated in place when the language changes.
  useEffect(() => {
    text.current = s;
    markers.current.forEach((marker, index) => marker.getElement()?.setAttribute("title", s.pinTitle(STORES[index].name)));
    LANDMARKS.forEach((lm) => node.current?.querySelector(`.lm-${lm.id} .lm-cap`)?.replaceChildren(caption(s, lm.id)));
    node.current?.querySelector(".me-pin span")?.replaceChildren(s.you);
  }, [s]);

  // Build the map (once Leaflet is here). Returns what takes it down again.
  const build = (L: Lib, el: HTMLDivElement, box: HTMLDivElement) => {
    const CBD = L.latLng(-37.8136, 144.9631);
    const touch = L.Browser.mobile;
    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: !touch,
      zoomSnap: 0.25,
      minZoom: 10,
      maxZoom: 17,
    });
    // Attribution is printed under the map instead (.finder-credit): the map's edges fade out.
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 16,
      maxZoom: 19,
    }).addTo(map);

    const points = STORES.map((store) => L.latLng(store.lat, store.lon));
    const wide = () => box.clientWidth > 760;
    const overview = (animate = false) => {
      const bounds = L.latLngBounds([...points, CBD]);
      const opts: L.FitBoundsOptions = {
        paddingTopLeft: [60 + cssPx(map, "--inset-l"), 110],
        paddingBottomRight: [(wide() ? 150 : 80) + cssPx(map, "--inset-r"), cssPx(map, "--float-room")],
      };
      if (animate) map.flyToBounds(bounds, { ...opts, duration: 1.1 });
      else map.fitBounds(bounds, opts);
    };
    overview();

    // ---- landmarks, then the pins on top -----------------------------------------
    LANDMARKS.forEach((lm) =>
      L.marker([lm.lat, lm.lon], {
        icon: L.divIcon({ className: "sm-lm", html: landmarkHtml(lm, caption(text.current, lm.id)), iconSize: [0, 0] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: -1000,
      }).addTo(map),
    );

    markers.current = STORES.map((store, index) => {
      const marker = L.marker(points[index], {
        icon: L.divIcon({ className: "sm-marker", html: pinHtml(store), iconSize: [0, 0] }),
        title: text.current.pinTitle(store.name),
        alt: text.current.pinTitle(store.name),
        riseOnHover: true,
      }).addTo(map);
      marker.on("click", () => onSelectRef.current(index));
      return marker;
    });

    // Zoomed far out, the small landmarks and their captions would pile up.
    const crowd = () => box.toggleAttribute("data-far", map.getZoom() < 13.4);
    map.on("zoomend", crowd);

    // Leaflet only measures its box once, so tell it when the box changes size.
    let refit = 0;
    let lastWidth = box.clientWidth;
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      window.clearTimeout(refit);
      refit = window.setTimeout(() => {
        map.invalidateSize();
      }, 120);
    });
    ro.observe(box);

    overviewRef.current = () => overview(true);
    mapRef.current = map;
    const settle = window.setTimeout(() => {
      map.invalidateSize();
      overview();
      crowd();
    }, 80);
    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(refit);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markers.current = [];
      overviewRef.current = null;
    };
  };

  useEffect(() => {
    const el = node.current;
    const box = wrap.current;
    if (!el || !box || mapRef.current) return;
    let disposed = false;
    let teardown = () => {};
    loadLeaflet().then((leaflet) => {
      if (disposed) return;
      lib.current = leaflet;
      teardown = build(leaflet, el, box);
      setReady(true);
    });
    return () => {
      disposed = true;
      teardown();
    };
    // build only uses refs, so it never needs to run again.
  }, []);

  // Follow the selection: light the pin and glide over to it (to it and you, after "Find my nearest").
  useEffect(() => {
    const map = mapRef.current;
    const L = lib.current;
    if (!map || !L) return;
    markers.current.forEach((marker, index) => {
      marker.getElement()?.classList.toggle("active", index === active);
      marker.setZIndexOffset(index === active ? 1000 : 0);
    });
    const first = previous.current === null;
    previous.current = active;
    if (first) return; // the overview already shows every store

    const target = L.latLng(STORES[active].lat, STORES[active].lon);
    const wideMap = map.getSize().x > 760;
    const left = cssPx(map, "--inset-l");
    const right = cssPx(map, "--inset-r");
    const room = cssPx(map, "--float-room");
    const me = fromMe.current;
    fromMe.current = null;
    if (me) {
      map.flyToBounds(L.latLngBounds([me, target]), {
        paddingTopLeft: [70 + left, 110],
        paddingBottomRight: [(wideMap ? 140 : 70) + right, Math.max(60, room - 10)],
        maxZoom: 15,
        animate: !reduced(),
        duration: 1,
      });
      return;
    }
    // Park the store a little up and right of the visible middle, clear of whatever floats bottom left.
    const shift = L.point((wideMap ? -150 : 0) + (right - left) / 2, Math.max(0, room / 2 - 45));
    const centre = map.unproject(map.project(target, 14.75).add(shift), 14.75);
    map.flyTo(centre, 14.75, { animate: !reduced(), duration: 1 });
  }, [active, ready]);

  const locate = () => {
    if (!navigator.geolocation) {
      setNear({ status: "error", reason: "unsupported" });
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
        const L = lib.current;
        me.current?.remove();
        meLine.current?.remove();
        if (map && L && bestKm < 40) {
          const here = L.latLng(coords.latitude, coords.longitude);
          me.current = L.marker(here, {
            icon: L.divIcon({ className: "sm-me", html: `<div class="me-pin"><i></i><span>${text.current.you}</span></div>`, iconSize: [0, 0] }),
            interactive: false,
            keyboard: false,
            zIndexOffset: 2500,
          }).addTo(map);
          meLine.current = L.polyline([here, L.latLng(STORES[best].lat, STORES[best].lon)], {
            className: "me-line",
            color: "#6bb8ff",
            weight: 3,
            dashArray: "2 9",
            lineCap: "round",
            interactive: false,
          }).addTo(map);
          fromMe.current = here;
        }
        setNear({ status: "ok", index: best, km: bestKm });
        onSelect(best);
      },
      (error) =>
        setNear({
          status: "error",
          reason: error.code === 1 ? "denied" : "failed",
        }),
      { timeout: 8000 },
    );
  };

  return (
    <div className="finder" ref={wrap}>
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <filter id="parch-map" colorInterpolationFilters="sRGB">
          <feColorMatrix values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues={INK_TABLES[0]} />
            <feFuncG type="table" tableValues={INK_TABLES[1]} />
            <feFuncB type="table" tableValues={INK_TABLES[2]} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="finder-stage">
        <div
          ref={node}
          className="finder-map"
          role="region"
          aria-label={s.mapLabel}
        />
        <svg className="finder-compass" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="20" />
          <path d="M22 9l4.5 13h-9z" />
          <path d="M22 35l-4.5-13h9z" />
          <text x="22" y="7.6">{s.north}</text>
        </svg>

        <div className="finder-top left">
          <button className="locate" type="button" onClick={locate} disabled={near.status === "loading"}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
            </svg>
            {near.status === "loading" ? s.locating : s.findNearest}
          </button>
          {near.status === "error" && <p className="finder-note">{s.locateError[near.reason]}</p>}
          {near.status === "ok" && <p className="finder-note ok">{s.nearest(STORES[near.index].name, formatKm(near.km))}</p>}
        </div>
        <div className="finder-top right">
          <div className="zoom">
            <button type="button" aria-label={s.zoomIn} onClick={() => mapRef.current?.zoomIn()}>
              +
            </button>
            <button type="button" aria-label={s.zoomOut} onClick={() => mapRef.current?.zoomOut()}>
              −
            </button>
            <button type="button" className="all" aria-label={s.showAll} onClick={() => overviewRef.current?.()}>
              {s.all}
            </button>
          </div>
        </div>

        {children}
        <p className="finder-credit">Esri, HERE, Garmin, © OpenStreetMap contributors</p>
      </div>
    </div>
  );
}
