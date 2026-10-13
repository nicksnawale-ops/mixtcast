import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * "Signal-routing matrix": the decorative layer behind the service cards.
 *  - a fine hairline grid fading out toward the section edges (static CSS background);
 *  - signal pulses travelling along the gutters between the cards, each turning 90° once at a gutter crossing;
 *  - a very faint waveform drifting along the bottom (desktop);
 *  - on card hover, brief pulses routed through the gutters to that card (desktop).
 * Pulses are clipped dashes moved with Web Animations (transform only, compositor-run) and paused when off-screen.
 */

export interface SignalMatrixHandle {
  /** Route 2–3 brief pulses to `card` (desktop only). */
  route: (card: HTMLElement) => void;
}

interface SignalMatrixProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  gridRef: React.RefObject<HTMLDivElement | null>;
  /** False while the section is off-screen or the tab is hidden: all loops pause. */
  running: boolean;
  reduced: boolean;
  /** md+ viewport: 6 pulses + waveform; below: 2 pulses, no waveform. */
  wide: boolean;
  /** Hover-capable device: hover routing enabled. */
  canHover: boolean;
  ref?: React.Ref<SignalMatrixHandle>;
}

const DASH = 80; // px
const SPEED = 240; // px/s
const THICKNESS = 2;
const ORANGE = "rgba(255, 90, 31, 0.3)";
const NAVY = "rgba(14, 59, 140, 0.24)";
const ROUTE_ORANGE = "rgba(255, 90, 31, 0.5)";

interface Geometry {
  w: number;
  h: number;
  /** Gutter lines between/around the cards (section coordinates). */
  rows: number[];
  cols: number[];
}

/** Position of `el` inside `ancestor` from layout offsets (ignores the cards' transforms). */
const offsetWithin = (el: HTMLElement, ancestor: HTMLElement) => {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

const measure = (section: HTMLElement, grid: HTMLDivElement): Geometry => {
  const cs = getComputedStyle(grid);
  const colW = cs.gridTemplateColumns.split(" ").map(parseFloat);
  const rowH = cs.gridTemplateRows.split(" ").map(parseFloat);
  const gapX = parseFloat(cs.columnGap) || 0;
  const gapY = parseFloat(cs.rowGap) || 0;
  const { x: left, y: top } = offsetWithin(grid, section);
  const margin = Math.min(12, left / 2);

  const cols = [left - margin];
  let x = left;
  colW.forEach((cw, i) => {
    x += cw;
    cols.push(i < colW.length - 1 ? x + gapX / 2 : x + margin);
    x += gapX;
  });
  const rows = [top - 12];
  let y = top;
  rowH.forEach((rh, i) => {
    y += rh;
    rows.push(i < rowH.length - 1 ? y + gapY / 2 : y + 12);
    y += gapY;
  });
  return { w: section.offsetWidth, h: section.offsetHeight, rows, cols };
};

// Small deterministic PRNG, so the layout of pulses is stable between renders.
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

interface Segment {
  /** Start and end of the travelled segment (one coordinate is shared: horizontal or vertical). */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A dash clipped to `seg`; returns the clip element and the dash to animate, and the segment length. */
const makeDash = (seg: Segment, color: string) => {
  const horizontal = seg.y0 === seg.y1;
  const len = horizontal ? Math.abs(seg.x1 - seg.x0) : Math.abs(seg.y1 - seg.y0);
  const clip = document.createElement("div");
  const flip = horizontal ? seg.x1 < seg.x0 : seg.y1 < seg.y0;
  Object.assign(clip.style, {
    position: "absolute",
    overflow: "hidden",
    left: `${Math.min(seg.x0, seg.x1) - (horizontal ? 0 : THICKNESS / 2)}px`,
    top: `${Math.min(seg.y0, seg.y1) - (horizontal ? THICKNESS / 2 : 0)}px`,
    width: `${horizontal ? len : THICKNESS}px`,
    height: `${horizontal ? THICKNESS : len}px`,
    transform: flip ? (horizontal ? "scaleX(-1)" : "scaleY(-1)") : "",
  });
  const dash = document.createElement("div");
  Object.assign(dash.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${horizontal ? DASH : THICKNESS}px`,
    height: `${horizontal ? THICKNESS : DASH}px`,
    borderRadius: "999px",
    background: `linear-gradient(${horizontal ? "90deg" : "180deg"}, rgba(255,255,255,0), ${color})`,
    transform: horizontal ? `translateX(-${DASH}px)` : `translateY(-${DASH}px)`,
  });
  clip.appendChild(dash);
  const axis = horizontal ? "X" : "Y";
  return { clip, dash, len, axis };
};

// One full-width cycle of a faint waveform; drawn twice so a −50% drift loops seamlessly.
const WAVE_W = 1600;
const WAVE_H = 140;
const wavePath = () => {
  let d = "";
  const n = 400;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * t * 2), 2);
    const y = WAVE_H / 2 - (Math.sin(t * 2 * Math.PI * 9) * 0.6 + Math.sin(t * 2 * Math.PI * 23) * 0.4) * env * (WAVE_H / 2 - 6);
    d += `${i ? "L" : "M"}${(t * WAVE_W).toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
};
const WAVE_D = wavePath();

export const SignalMatrix: React.FC<SignalMatrixProps> = ({ sectionRef, gridRef, running, reduced, wide, canHover, ref }) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const [geo, setGeo] = useState<Geometry | null>(null);

  // Passive effect: the grid is a later sibling, so its ref is only attached once the whole tree has committed.
  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(section, grid);
        setGeo((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(section);
    observer.observe(grid);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sectionRef, gridRef]);

  // Ambient pulses: each pulse is fired as a one-shot animation and removed when it finishes, then re-fired after its
  // period — so only the pulses actually travelling hold a compositor layer. Rebuilt when the geometry changes;
  // nothing is scheduled while the section is off-screen or the tab is hidden.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !geo || reduced || !running || geo.rows.length < 1 || geo.cols.length < 2) return;
    const rand = rng(7);
    const count = wide ? 6 : 2;
    const timers = new Set<number>();
    const inFlight = new Set<Animation>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    for (let p = 0; p < count; p++) {
      // A horizontal run along a gutter row into a gutter column, then a vertical run to the section edge.
      const rowY = geo.rows[Math.floor(rand() * geo.rows.length)];
      const colX = geo.cols[Math.floor(rand() * geo.cols.length)];
      const fromLeft = rand() < 0.5;
      const down = rand() < 0.5;
      const h: Segment = { x0: fromLeft ? 0 : geo.w, y0: rowY, x1: colX, y1: rowY };
      const v: Segment = { x0: colX, y0: rowY, x1: colX, y1: down ? geo.h : 0 };
      const hLen = Math.abs(h.x1 - h.x0);
      const vLen = Math.abs(v.y1 - v.y0);
      if (hLen < 40 || vLen < 40) continue;
      const color = p % 2 ? NAVY : ORANGE;
      const travel = ((hLen + vLen + DASH) / SPEED) * 1000;
      const period = Math.max(6000 + rand() * 4000, travel + 1500);

      const run = (seg: Segment, delay: number, onDone?: () => void) => {
        const d = makeDash(seg, color);
        layer.appendChild(d.clip);
        const anim = d.dash.animate(
          [{ transform: `translate${d.axis}(-${DASH}px)` }, { transform: `translate${d.axis}(${d.len}px)` }],
          { duration: ((d.len + DASH) / SPEED) * 1000, delay, easing: "linear", fill: "backwards" },
        );
        inFlight.add(anim);
        anim.onfinish = () => {
          inFlight.delete(anim);
          d.clip.remove();
          onDone?.();
        };
      };
      const fire = () => {
        run(h, 0);
        // The vertical run starts as the head of the dash reaches the crossing, so the signal turns the corner.
        run(v, (hLen / SPEED) * 1000);
        later(fire, period);
      };
      later(fire, p * 1300 + rand() * 600);
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      inFlight.forEach((a) => a.cancel());
      layer.replaceChildren();
    };
  }, [geo, reduced, wide, running]);

  // Waveform drift along the bottom (40 s loop), paused while the section is off-screen or the tab is hidden.
  const drift = useRef<Animation | null>(null);
  useEffect(() => {
    const wave = waveRef.current;
    if (!wave || reduced || !wide) return;
    const anim = wave.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], {
      duration: 40000,
      iterations: Infinity,
      easing: "linear",
    });
    if (!runningRef.current) anim.pause();
    drift.current = anim;
    return () => {
      anim.cancel();
      drift.current = null;
    };
  }, [reduced, wide]);
  useEffect(() => {
    runningRef.current = running;
    if (running) drift.current?.play();
    else drift.current?.pause();
  }, [running]);

  // Hover routing: brief pulses through the gutters to the hovered card.
  useImperativeHandle(
    ref,
    () => ({
      route: (card: HTMLElement) => {
        const layer = routeRef.current;
        const section = sectionRef.current;
        if (!layer || !section || reduced || !canHover || !wide || !geo) return;
        layer.getAnimations({ subtree: true }).forEach((a) => a.cancel());
        layer.replaceChildren();
        const s = section.getBoundingClientRect();
        const c = card.getBoundingClientRect();
        const left = c.left - s.left;
        const top = c.top - s.top;
        const cx = left + c.width / 2;
        const cy = top + c.height / 2;
        const segments: Segment[] = [
          { x0: 0, y0: top - 12, x1: cx, y1: top - 12 }, // along the gutter above, from the left edge
          { x0: left - 12, y0: 0, x1: left - 12, y1: cy }, // down the gutter on its left
          { x0: geo.w, y0: top + c.height + 12, x1: cx, y1: top + c.height + 12 }, // along the gutter below, from the right
        ];
        segments.forEach((seg, i) => {
          const d = makeDash(seg, ROUTE_ORANGE);
          if (d.len < DASH) return;
          layer.appendChild(d.clip);
          const anim = d.dash.animate(
            [
              { transform: `translate${d.axis}(-${DASH}px)`, opacity: 1 },
              { transform: `translate${d.axis}(${d.len - DASH}px)`, opacity: 1, offset: 0.8 },
              { transform: `translate${d.axis}(${d.len - DASH}px)`, opacity: 0 },
            ],
            { duration: 700, delay: i * 70, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
          );
          anim.onfinish = () => d.clip.remove();
        });
      },
    }),
    [sectionRef, reduced, canHover, wide, geo],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Hairline grid (64px), fading out toward the edges. The fade is a vignette in the section colour rather than a
          CSS mask: a masked full-section layer would be repainted every time a pulse moves over it. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(250,248,245,0) 35%, #FAF8F5 100%), linear-gradient(rgba(14,59,140,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,59,140,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
          backgroundPosition: "center, center, center",
        }}
      />
      {wide && (
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: WAVE_H }}>
          <div ref={waveRef} className="absolute left-0 top-0 h-full flex" style={{ width: WAVE_W * 2 }}>
            {[0, 1].map((k) => (
              <svg key={k} width={WAVE_W} height={WAVE_H} viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} fill="none" className="shrink-0">
                <path d={WAVE_D} stroke="rgba(14,59,140,0.05)" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        </div>
      )}
      <div ref={layerRef} className="absolute inset-0" />
      <div ref={routeRef} className="absolute inset-0" />
    </div>
  );
};
