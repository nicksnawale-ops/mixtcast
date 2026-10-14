import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { SVC } from "./servicesConsoleStyles";

/**
 * Services page background: soft signal pulses gliding along the gutters between the cards (turning 90° once at a
 * crossing), routed toward a card on hover (desktop), and one very faint waveform drifting along the bottom.
 * No grid lines. Pulses are clipped dashes moved with Web Animations (transform only), fired one-shot so idle pulses
 * hold no layers; nothing runs while off-screen or the tab is hidden.
 */

export interface SignalFieldHandle {
  route: (card: HTMLElement) => void;
}

interface Props {
  sectionRef: React.RefObject<HTMLElement | null>;
  gridRef: React.RefObject<HTMLDivElement | null>;
  running: boolean;
  reduced: boolean;
  wide: boolean;
  canHover: boolean;
  ref?: React.Ref<SignalFieldHandle>;
}

const P = SVC.pulses;
const THICK = 2;

interface Geo {
  w: number;
  h: number;
  rows: number[];
  cols: number[];
}
interface Seg {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const offsetWithin = (el: HTMLElement, ancestor: HTMLElement) => {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = el; n && n !== ancestor; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
};

const measure = (section: HTMLElement, grid: HTMLDivElement): Geo => {
  const cs = getComputedStyle(grid);
  const colW = cs.gridTemplateColumns.split(" ").map(parseFloat).filter((v) => !Number.isNaN(v));
  const rowH = cs.gridTemplateRows.split(" ").map(parseFloat).filter((v) => !Number.isNaN(v));
  const gx = parseFloat(cs.columnGap) || 0;
  const gy = parseFloat(cs.rowGap) || 0;
  const { x: left, y: top } = offsetWithin(grid, section);
  const m = Math.min(16, left / 2);
  const cols = [left - m];
  let x = left;
  colW.forEach((w, i) => {
    x += w;
    cols.push(i < colW.length - 1 ? x + gx / 2 : x + m);
    x += gx;
  });
  const rows = [top - 16];
  let y = top;
  rowH.forEach((h, i) => {
    y += h;
    rows.push(i < rowH.length - 1 ? y + gy / 2 : y + 16);
    y += gy;
  });
  return { w: section.offsetWidth, h: section.offsetHeight, rows, cols };
};

const dash = (seg: Seg, color: string) => {
  const horizontal = seg.y0 === seg.y1;
  const len = horizontal ? Math.abs(seg.x1 - seg.x0) : Math.abs(seg.y1 - seg.y0);
  const clip = document.createElement("div");
  const flip = horizontal ? seg.x1 < seg.x0 : seg.y1 < seg.y0;
  Object.assign(clip.style, {
    position: "absolute",
    overflow: "hidden",
    left: `${Math.min(seg.x0, seg.x1) - (horizontal ? 0 : THICK / 2)}px`,
    top: `${Math.min(seg.y0, seg.y1) - (horizontal ? THICK / 2 : 0)}px`,
    width: `${horizontal ? len : THICK}px`,
    height: `${horizontal ? THICK : len}px`,
    transform: flip ? (horizontal ? "scaleX(-1)" : "scaleY(-1)") : "",
  });
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${horizontal ? P.dash : THICK}px`,
    height: `${horizontal ? THICK : P.dash}px`,
    borderRadius: "999px",
    background: `linear-gradient(${horizontal ? "90deg" : "180deg"}, rgba(255,255,255,0), ${color})`,
    transform: horizontal ? `translateX(-${P.dash}px)` : `translateY(-${P.dash}px)`,
  });
  clip.appendChild(el);
  return { clip, el, len, axis: horizontal ? "X" : "Y" };
};

// One full-width cycle of a faint waveform, drawn twice so a −50% drift loops seamlessly.
const WAVE_W = 1600;
const WAVE_H = 140;
const WAVE_D = (() => {
  let d = "";
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const env = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * t * 2), 2);
    const y = WAVE_H / 2 - (Math.sin(t * 2 * Math.PI * 9) * 0.6 + Math.sin(t * 2 * Math.PI * 23) * 0.4) * env * (WAVE_H / 2 - 6);
    d += `${i ? "L" : "M"}${(t * WAVE_W).toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
})();

export const ServicesSignalField: React.FC<Props> = ({ sectionRef, gridRef, running, reduced, wide, canHover, ref }) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(section, grid);
        setGeo((g) => (g && JSON.stringify(g) === JSON.stringify(next) ? g : next));
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

  // Ambient pulses: one-shot each, re-fired on their own 6–10s loop; only while running.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !geo || reduced || !running || geo.rows.length < 1 || geo.cols.length < 2) return;
    let s = 11;
    const rand = () => ((s = (s * 9301 + 49297) % 233280), s / 233280);
    const timers = new Set<number>();
    const anims = new Set<Animation>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const count = wide ? P.desktop : P.mobile;
    for (let p = 0; p < count; p++) {
      const rowY = geo.rows[Math.floor(rand() * geo.rows.length)];
      const colX = geo.cols[Math.floor(rand() * geo.cols.length)];
      const h: Seg = { x0: rand() < 0.5 ? 0 : geo.w, y0: rowY, x1: colX, y1: rowY };
      const v: Seg = { x0: colX, y0: rowY, x1: colX, y1: rand() < 0.5 ? geo.h : 0 };
      const hLen = Math.abs(h.x1 - h.x0);
      const vLen = Math.abs(v.y1 - v.y0);
      if (hLen < 40 || vLen < 40) continue;
      const color = p % 2 ? P.navy : P.orange;
      const period = Math.max(6000 + rand() * 4000, ((hLen + vLen + P.dash) / P.speed) * 1000 + 1500);
      const run = (seg: Seg, delay: number) => {
        const d = dash(seg, color);
        layer.appendChild(d.clip);
        const a = d.el.animate([{ transform: `translate${d.axis}(-${P.dash}px)` }, { transform: `translate${d.axis}(${d.len}px)` }], {
          duration: ((d.len + P.dash) / P.speed) * 1000,
          delay,
          easing: "linear",
          fill: "backwards",
        });
        anims.add(a);
        a.onfinish = () => {
          anims.delete(a);
          d.clip.remove();
        };
      };
      const fire = () => {
        run(h, 0);
        run(v, (hLen / P.speed) * 1000); // turns the corner as the head reaches the crossing
        later(fire, period);
      };
      later(fire, p * 1200 + rand() * 600);
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      anims.forEach((a) => a.cancel());
      layer.replaceChildren();
    };
  }, [geo, reduced, running, wide]);

  // Hover routing: 2 brief pulses through the gutters to the card (desktop).
  useImperativeHandle(
    ref,
    () => ({
      route: (card: HTMLElement) => {
        const layer = routeRef.current;
        const section = sectionRef.current;
        if (!layer || !section || reduced || !canHover || !wide || !geo || !running) return;
        layer.getAnimations({ subtree: true }).forEach((a) => a.cancel());
        layer.replaceChildren();
        const sr = section.getBoundingClientRect();
        const c = card.getBoundingClientRect();
        const left = c.left - sr.left;
        const top = c.top - sr.top;
        const segs: Seg[] = [
          { x0: 0, y0: top - 16, x1: left + c.width / 2, y1: top - 16 },
          { x0: geo.w, y0: top + c.height + 16, x1: left + c.width / 2, y1: top + c.height + 16 },
        ];
        segs.forEach((seg, i) => {
          const d = dash(seg, P.route);
          if (d.len < P.dash) return;
          layer.appendChild(d.clip);
          d.el.animate(
            [
              { transform: `translate${d.axis}(-${P.dash}px)`, opacity: 1 },
              { transform: `translate${d.axis}(${d.len - P.dash}px)`, opacity: 1, offset: 0.8 },
              { transform: `translate${d.axis}(${d.len - P.dash}px)`, opacity: 0 },
            ],
            { duration: 700, delay: i * 80, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
          ).onfinish = () => d.clip.remove();
        });
      },
    }),
    [sectionRef, reduced, canHover, wide, geo, running],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {wide && !reduced && (
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: WAVE_H }}>
          <div className="svc-wave absolute left-0 top-0 h-full flex" style={{ width: WAVE_W * 2 }}>
            {[0, 1].map((k) => (
              <svg key={k} width={WAVE_W} height={WAVE_H} viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} fill="none" className="shrink-0">
                <path d={WAVE_D} stroke={`rgba(14,59,140,${SVC.waveform.opacity})`} strokeWidth="1.5" strokeLinejoin="round" />
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
