import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { buildGlassMaps, canRefract, type GlassMaps } from "./glassMaps";
import "./glass.css";

/** Peak displacement of the rim in px is `strength / 2`. */
const CHANNELS = [
  { scale: 1, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: 0.93, matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: 0.86, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
] as const;

export function Glass({
  className = "",
  radius,
  bezel,
  strength = 36,
  style,
  children,
}: {
  className?: string;
  /** Corner radius in px. Defaults to a full pill. */
  radius?: number;
  bezel?: number;
  strength?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [maps, setMaps] = useState<GlassMaps | null>(null);
  const measured = useRef<{ w: number; h: number; radius: number; bezel: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const r = radius ?? h / 2;
      const b = bezel ?? Math.min(24, Math.min(w, h) * 0.42);
      const prev = measured.current;
      if (prev && Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2 && prev.radius === r && prev.bezel === b) return;
      measured.current = { w, h, radius: r, bezel: b };
      // Keep the canvas work outside React's state updater, which StrictMode may call twice.
      setMaps(buildGlassMaps(w, h, r, b));
    };
    update();
    const observer = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(update);
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [radius, bezel]);

  const vars = {
    ...(radius === undefined ? null : { borderRadius: radius }),
    ...style,
    ...(maps?.spec ? { "--glass-spec": `url(${maps.spec})` } : null),
    ...(canRefract && maps?.disp ? { "--glass-filter": `url(#${id})` } : null),
  } as CSSProperties;

  return (
    <>
      {canRefract && maps?.disp && (
        <svg className="glass-defs" aria-hidden="true" focusable="false">
          <defs>
            <filter
              id={id}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
              primitiveUnits="userSpaceOnUse"
            >
              <feImage href={maps.disp} x="0" y="0" width={maps.w} height={maps.h} preserveAspectRatio="none" result="map" />
              {CHANNELS.map((channel, index) => (
                <feDisplacementMap
                  key={index}
                  in="SourceGraphic"
                  in2="map"
                  scale={strength * channel.scale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result={`shift${index}`}
                />
              ))}
              {CHANNELS.map((channel, index) => (
                <feColorMatrix key={index} in={`shift${index}`} type="matrix" values={channel.matrix} result={`ch${index}`} />
              ))}
              <feBlend in="ch0" in2="ch1" mode="screen" result="rg" />
              <feBlend in="rg" in2="ch2" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}
      <div ref={ref} className={`glass${canRefract && maps?.disp ? " refract" : ""} ${className}`} style={vars}>
        {children}
      </div>
    </>
  );
}
