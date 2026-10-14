import { useEffect, useRef, useState, type ReactNode } from "react";
import L from "leaflet";
import { CART_SVG, LANDMARKS, bow, landmarkHtml, shopPinSvg } from "./mapArt";
import { ROUTE, STORES, distanceKm, formatKm, type Store } from "./stores";
import "./storemap.css";

/**
 * The store map, drawn as a night-time city: dark green streets, little CBM
 * shopfronts for pins, sticker landmarks, and a trolley that drives a bowed
 * loop to whichever store you pick. Whatever is passed as children floats
 * over the map, above the tiles and below nothing.
 */

/** Loop order of the stores (ROUTE ends where it started). */
const LOOP = ROUTE.slice(0, -1);
/** Zoom level the route maths is done at, in projected pixels. */
const Z = 15;
const CBD = L.latLng(-37.8136, 144.9631);

/** Name tags hang to the right of the shop, except where a landmark already sits there. */
const TAG_LEFT = new Set(["flemington"]);

const pinHtml = (store: Store, index: number) => `
  <div class="pin" style="--c:${store.color};--i:${index}">
    <span class="pin-shadow"></span>
    <span class="pin-pulse"></span>
    <span class="pin-pulse two"></span>
    <span class="pin-art">${shopPinSvg(store)}</span>
    <span class="pin-tag${TAG_LEFT.has(store.id) ? " left" : ""}"><b>0${index + 1}</b>${store.name}</span>
  </div>`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Near =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; index: number; km: number }
  | { status: "error"; message: string };

/** Moves the trolley marker along polylines in projected space, frame by frame. */
function makeDriver(map: L.Map, cart: L.Marker) {
  type Leg = { pts: L.Point[]; cum: number[]; ms: number; done?: () => void };
  let leg: Leg | null = null;
  let elapsed = 0;
  let wait = 0;
  let after: (() => void) | null = null;
  let raf = 0;
  let last = 0;
  let running = false;
  const art = () => cart.getElement()?.querySelector<HTMLElement>(".cart");
  const place = (p: L.Point) => cart.setLatLng(map.unproject(p, Z));

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(48, now - last);
    last = now;
    if (leg) {
      elapsed += dt;
      const t = Math.min(1, elapsed / leg.ms);
      const d = ease(t) * leg.cum[leg.cum.length - 1];
      let i = 1;
      while (i < leg.cum.length - 1 && leg.cum[i] < d) i += 1;
      const a = leg.pts[i - 1];
      const b = leg.pts[i];
      const k = (d - leg.cum[i - 1]) / (leg.cum[i] - leg.cum[i - 1] || 1);
      place(L.point(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k));
      if (Math.abs(b.x - a.x) > 0.5) art()?.setAttribute("data-dir", b.x < a.x ? "l" : "r");
      if (t >= 1) {
        const done = leg.done;
        leg = null;
        art()?.removeAttribute("data-moving");
        done?.();
      }
    } else if (wait > 0) {
      wait -= dt;
      if (wait <= 0 && after) {
        const fn = after;
        after = null;
        fn();
      }
    }
    if (running && (leg || wait > 0)) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (raf || !running || !(leg || wait > 0)) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  return {
    place,
    drive(pts: L.Point[], ms: number, done?: () => void) {
      const cum = [0];
      for (let i = 1; i < pts.length; i += 1) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
      leg = { pts, cum, ms, done };
      elapsed = 0;
      wait = 0;
      after = null;
      art()?.removeAttribute("data-in");
      art()?.setAttribute("data-moving", "");
      kick();
    },
    pause(ms: number, fn: () => void) {
      wait = ms;
      after = fn;
      kick();
    },
    setRunning(on: boolean) {
      running = on;
      if (on) kick();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    stop() {
      leg = null;
      wait = 0;
      after = null;
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

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
  const api = useRef<{
    driver: ReturnType<typeof makeDriver>;
    between: (from: number, to: number) => L.Point[];
    at: (index: number) => L.Point;
    overview: () => void;
  } | null>(null);
  const me = useRef<L.Marker | null>(null);
  const meLine = useRef<L.Polyline | null>(null);
  const fromMe = useRef<L.LatLng | null>(null);
  const previous = useRef<number | null>(null);
  const onSelectRef = useRef(onSelect);
  const [near, setNear] = useState<Near>({ status: "idle" });

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Build the map once.
  useEffect(() => {
    const el = node.current;
    const box = wrap.current;
    if (!el || !box || mapRef.current) return;
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
    L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
      maxNativeZoom: 16,
      maxZoom: 19,
    }).addTo(map);

    const points = STORES.map((store) => L.latLng(store.lat, store.lon));
    const wide = () => box.clientWidth > 760;
    const overview = (animate = false) => {
      const bounds = L.latLngBounds([...points, CBD]);
      const opts: L.FitBoundsOptions = { paddingTopLeft: [60, 110], paddingBottomRight: [wide() ? 150 : 80, wide() ? 230 : 250] };
      if (animate) map.flyToBounds(bounds, { ...opts, duration: 1.1 });
      else map.fitBounds(bounds, opts);
    };
    overview();

    // ---- the loop, bowed outwards so it reads as a drawn route ---------------
    const P = points.map((point) => map.project(point, Z));
    const centre = { x: P.reduce((s, p) => s + p.x, 0) / P.length, y: P.reduce((s, p) => s + p.y, 0) / P.length };
    const segs = LOOP.map((from, k) =>
      bow(P[from], P[LOOP[(k + 1) % LOOP.length]], centre, 0.17).map((p) => L.point(p.x, p.y)),
    );
    const loop = segs.flatMap((seg, k) => (k ? seg.slice(1) : seg)).map((p) => map.unproject(p, Z));
    L.polyline(loop, { className: "route-glow", color: "#f6b531", weight: 12, opacity: 0.12, interactive: false }).addTo(map);
    const drawn = L.polyline(loop, { className: "route-line", color: "#f6b531", weight: 2.5, opacity: 0.85, interactive: false }).addTo(map);
    L.polyline(loop, { className: "route-dots", color: "#fffaf0", weight: 4, opacity: 0.95, dashArray: "0.1 14", lineCap: "round", interactive: false }).addTo(map);
    drawn.getElement()?.setAttribute("pathLength", "1");

    const between = (from: number, to: number) => {
      const n = LOOP.length;
      const ia = LOOP.indexOf(from);
      const forward = (LOOP.indexOf(to) - ia + n) % n;
      const out: L.Point[] = [];
      if (forward <= n - forward) {
        for (let s = 0; s < forward; s += 1) out.push(...segs[(ia + s) % n].slice(s ? 1 : 0));
      } else {
        for (let s = 0; s < n - forward; s += 1) out.push(...[...segs[(ia - 1 - s + n) % n]].reverse().slice(s ? 1 : 0));
      }
      return out;
    };

    // ---- landmarks, pins, trolley ---------------------------------------------
    LANDMARKS.forEach((lm, index) =>
      L.marker([lm.lat, lm.lon], {
        icon: L.divIcon({ className: "sm-lm", html: landmarkHtml(lm, index), iconSize: [0, 0] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: -1000,
      }).addTo(map),
    );

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

    const start = previous.current ?? 0;
    const cart = L.marker(points[start], {
      icon: L.divIcon({ className: "sm-cart", html: `<div class="cart" data-dir="r" data-in>${CART_SVG}</div>`, iconSize: [0, 0] }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 3000,
    }).addTo(map);
    const driver = makeDriver(map, cart);

    // Everything drops in the first time the map is on screen; the trolley only runs while it is.
    let seen = false;
    let visible = false;
    const sync = () => driver.setRunning(visible && !document.hidden);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !seen) {
          seen = true;
          box.dataset.live = "";
        }
        sync();
      },
      { threshold: 0.25 },
    );
    io.observe(box);
    document.addEventListener("visibilitychange", sync);

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

    api.current = { driver, between, at: (index) => P[index], overview: () => overview(true) };
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
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      driver.stop();
      map.remove();
      mapRef.current = null;
      markers.current = [];
      api.current = null;
    };
  }, []);

  // Follow the selection: light the pin, drive the trolley round the loop, then close in.
  useEffect(() => {
    const map = mapRef.current;
    const tools = api.current;
    if (!map || !tools) return;
    markers.current.forEach((marker, index) => {
      marker.getElement()?.classList.toggle("active", index === active);
      marker.setZIndexOffset(index === active ? 1000 : 0);
    });
    const from = previous.current;
    previous.current = active;

    const target = L.latLng(STORES[active].lat, STORES[active].lon);
    const cartEl = () => map.getContainer().querySelector(".sm-cart .cart");
    // Park the store a little up and right of centre, clear of whatever floats bottom left.
    const closeIn = () => {
      const wideMap = map.getSize().x > 760;
      const centre = map.unproject(map.project(target, 14.75).add([wideMap ? -150 : 0, wideMap ? 70 : 110]), 14.75);
      map.flyTo(centre, 14.75, { animate: !reduced(), duration: 1.1 });
    };

    if (reduced() || from === null) {
      tools.driver.place(tools.at(active));
      if (from !== null) closeIn();
      return;
    }

    const me = fromMe.current;
    fromMe.current = null;
    const path = me ? [map.project(me, Z), tools.at(active)] : from === active ? [] : tools.between(from, active);
    if (path.length < 2) {
      closeIn();
      return;
    }
    let length = 0;
    for (let i = 1; i < path.length; i += 1) length += path[i].distanceTo(path[i - 1]);
    const bounds = L.latLngBounds(path.map((p) => map.unproject(p, Z)));
    const wideMap = map.getSize().x > 760;
    map.flyToBounds(bounds, {
      paddingTopLeft: [70, 110],
      paddingBottomRight: [wideMap ? 140 : 70, wideMap ? 220 : 240],
      maxZoom: 15,
      duration: 0.9,
    });
    tools.driver.setRunning(true);
    tools.driver.drive(path, Math.min(2600, Math.max(1500, length / 0.55)), () => {
      cartEl()?.setAttribute("data-in", "");
      const pin = markers.current[active]?.getElement();
      pin?.classList.remove("hop");
      void pin?.offsetWidth;
      pin?.classList.add("hop");
      closeIn();
    });
  }, [active]);

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
        const here = L.latLng(coords.latitude, coords.longitude);
        me.current?.remove();
        meLine.current?.remove();
        if (map && bestKm < 40) {
          me.current = L.marker(here, {
            icon: L.divIcon({ className: "sm-me", html: '<div class="me-pin"><i></i><span>You</span></div>', iconSize: [0, 0] }),
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
          message: error.code === 1 ? "Location permission was declined." : "Couldn’t work out where you are.",
        }),
      { timeout: 8000 },
    );
  };

  return (
    <div className="finder" ref={wrap}>
      <div className="finder-stage">
        <div
          ref={node}
          className="finder-map"
          role="region"
          aria-label="Map of the four Cheaper Buy Miles stores in inner Melbourne"
        />
        <span className="finder-plate" aria-hidden="true">
          Inner Melbourne · <b>04</b> shops
        </span>
        <svg className="finder-compass" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="20" />
          <g className="needle">
            <path d="M22 9l4.5 13h-9z" />
            <path d="M22 35l-4.5-13h9z" />
          </g>
          <text x="22" y="7.6">N</text>
        </svg>

        <div className="finder-top left">
          <button className="locate" type="button" onClick={locate} disabled={near.status === "loading"}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
            </svg>
            {near.status === "loading" ? "Locating…" : "Find my nearest"}
          </button>
          {near.status === "error" && <p className="finder-note">{near.message}</p>}
          {near.status === "ok" && (
            <p className="finder-note ok">
              Nearest: <b>{STORES[near.index].name}</b> · {formatKm(near.km)} away
            </p>
          )}
        </div>
        <div className="finder-top right">
          <div className="zoom">
            <button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()}>
              +
            </button>
            <button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()}>
              −
            </button>
            <button type="button" className="all" aria-label="Show all stores" onClick={() => api.current?.overview()}>
              All
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
