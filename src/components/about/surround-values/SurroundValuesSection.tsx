import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Cpu, Headphones, ShieldCheck, Users } from "lucide-react";
import { COMPANY_INFO } from "../../../data/company";
import { LogoMark } from "../../brand/Logo";

/**
 * About "Guiding Principles — Our Core Values": "Surround Sound". The four values sit around a central MIXTCAST mark
 * like FL / FR / RL / RR speakers (lg+); wavefronts radiate from the centre and light each value in turn.
 * Below lg: the mark on top, then the values stacked. All motion is CSS transform/opacity/SVG stroke; loops pause
 * off-screen or when the tab is hidden. Tuning: SV below.
 */

export const SV = {
  field: { maxW: 1080, h: 560, centre: 200 }, // px
  disc: { size: 140 }, // px; the mark inside is 72px wide (56px on smaller screens)
  entrance: { disc: 0, bars: 0.2, rings: 0.3, ringStagger: 0.15, wave: 0.7, waveS: 1.4, light: 1.0, lightStagger: 0.3 },
  idle: { everyS: 6, firstAt: 3 }, // s
};

const ICONS: Record<string, React.FC<{ className?: string }>> = { ShieldCheck, Cpu, Users, Headphones };
// Clockwise from top-left: values are in data order TL, TR, BL, BR → light order TL(0), TR(1), BR(3), BL(2).
const LIGHT_ORDER = [0, 1, 3, 2];
const E = SV.entrance;

const CSS = `
.sv-disc { transform: scale(0.9); opacity: 0; }
[data-on] .sv-disc { animation: sv-disc 500ms cubic-bezier(0.22, 1, 0.36, 1) ${E.disc}s both; }
@keyframes sv-disc { to { transform: scale(1); opacity: 1; } }
.sv-mark .waveform-left, .sv-mark .waveform-right { transform-box: fill-box; transform-origin: center; }
[data-on] .sv-mark .waveform-left, [data-on] .sv-mark .waveform-right { animation: sv-bars 600ms ease-in-out ${E.bars}s both; }
@keyframes sv-bars { 0%, 100% { transform: scaleY(1); } 40% { transform: scaleY(1.35); } 70% { transform: scaleY(0.85); } }

.sv-cring { transform-box: fill-box; transform-origin: center; transform: scale(0.4); opacity: 0; }
[data-on] .sv-cring { animation: sv-cring 700ms cubic-bezier(0.22, 1, 0.36, 1) var(--d) both; }
@keyframes sv-cring { to { transform: scale(1); opacity: 1; } }

.sv-wave { transform-box: fill-box; transform-origin: center; transform: scale(0.05); opacity: 0; }
[data-on] .sv-wave-in { animation: sv-wave ${E.waveS}s cubic-bezier(0.25, 0.6, 0.3, 1) ${E.wave}s both; }
@keyframes sv-wave { 0% { transform: scale(0.05); opacity: 0.55; } 100% { transform: scale(1); opacity: 0; } }
[data-on] .sv-wave-idle { animation: sv-wave-idle ${SV.idle.everyS}s linear ${SV.idle.firstAt}s infinite both; }
@keyframes sv-wave-idle { 0% { transform: scale(0.05); opacity: 0.22; } ${((E.waveS / SV.idle.everyS) * 100).toFixed(1)}% { transform: scale(1); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }

/* A value lights up when the wavefront reaches it */
.sv-draw { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
[data-on] .sv-lit .sv-draw, [data-on].sv-lit .sv-draw { animation: sv-draw 600ms cubic-bezier(0.22, 1, 0.36, 1) var(--d) both; }
@keyframes sv-draw { to { stroke-dashoffset: 0; } }
.sv-icon, .sv-text { opacity: 0; }
.sv-text { transform: translateY(12px); }
[data-on] .sv-lit .sv-icon, [data-on].sv-lit .sv-icon { animation: sv-fade 400ms ease-out calc(var(--d) + 200ms) both; }
[data-on] .sv-lit .sv-text, [data-on].sv-lit .sv-text { animation: sv-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--d) + 150ms) both; }
@keyframes sv-fade { to { opacity: 1; } }
@keyframes sv-rise { to { opacity: 1; transform: translateY(0); } }

/* Idle "receive" pulse as the idle wavefront passes each speaker */
.sv-glyph { transform-origin: center; }
[data-on] .sv-glyph-idle { animation: sv-receive ${SV.idle.everyS}s ease-out var(--rd) infinite; }
@keyframes sv-receive { 0% { transform: scale(1); } 4% { transform: scale(1.08); } 10%, 100% { transform: scale(1); } }

/* Decorative hover (desktop) */
.sv-icon-svg { transition: color 300ms ease; color: var(--color-brand-navy); }
.sv-title { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (hover: hover) {
  .sv-value:hover .sv-icon-svg { color: var(--color-brand-orange); }
  .sv-value:hover .sv-title { transform: translateX(var(--out)); }
  .sv-value:hover .sv-glyph { animation: sv-hover-pulse 600ms ease-out; }
}
@keyframes sv-hover-pulse { 0% { transform: scale(1); } 35% { transform: scale(1.1); } 100% { transform: scale(1); } }
.sv-hot { stroke-dasharray: 0.18 1.2; stroke-dashoffset: 0.18; animation: sv-hot 650ms cubic-bezier(0.45, 0, 0.2, 1) both; }
@keyframes sv-hot { to { stroke-dashoffset: -1; } }

[data-paused] .sv-wave-idle, [data-paused] .sv-glyph-idle { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .sv-disc, .sv-cring, .sv-icon, .sv-text { animation: none !important; opacity: 1; transform: none; }
  .sv-draw { animation: none !important; stroke-dashoffset: 0; }
  .sv-wave, .sv-hot { display: none; }
  .sv-glyph, .sv-mark .waveform-left, .sv-mark .waveform-right { animation: none !important; }
  .sv-title { transition: none; }
}
`;

/** Speaker-ring glyph: outer navy ring, inner orange ring, the value's icon in the middle. */
const SpeakerGlyph: React.FC<{ icon: string; delay: number; receiveDelay?: number; size?: number }> = ({ icon, delay, receiveDelay, size = 64 }) => {
  const Icon = ICONS[icon] ?? ShieldCheck;
  return (
    <span
      className={`sv-glyph ${receiveDelay !== undefined ? "sv-glyph-idle" : ""} relative shrink-0 inline-flex items-center justify-center`}
      style={{ width: size, height: size, ["--d" as string]: `${delay}s`, ["--rd" as string]: `${receiveDelay ?? 0}s` }}
    >
      <svg aria-hidden="true" className="absolute inset-0" width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle className="sv-draw" cx="32" cy="32" r="31" pathLength={1} stroke="rgba(14,59,140,0.2)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <circle className="sv-draw" cx="32" cy="32" r="22" pathLength={1} stroke="rgba(255,90,31,0.3)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="sv-icon relative">
        <Icon className="sv-icon-svg w-6 h-6" aria-hidden="true" />
      </span>
    </span>
  );
};

const CentreDisc: React.FC<{ size: number; logoClassName: string }> = ({ size, logoClassName }) => (
  <div
    aria-hidden="true"
    className="sv-disc sv-mark relative rounded-full bg-white flex items-center justify-center shadow-[0_12px_36px_-14px_rgba(14,59,140,0.35)]"
    style={{ width: size, height: size }}
  >
    <LogoMark className={logoClassName} />
  </div>
);

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
};

// ── Desktop: the listening field ────────────────────────────────────────────────────────────────────────────

interface Geo {
  w: number;
  h: number;
  cx: number;
  cy: number;
  rings: { x: number; y: number }[];
  r: number; // wavefront radius (reaches past the farthest speaker)
}

const ListeningField: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  const values = COMPANY_INFO.coreValues;
  const fieldRef = useRef<HTMLDivElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [hot, setHot] = useState<{ i: number; n: number } | null>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const measure = () => {
      const f = field.getBoundingClientRect();
      const cx = f.width / 2;
      const cy = f.height / 2;
      const rings = glyphRefs.current.map((g) => {
        const r = g?.getBoundingClientRect();
        return r ? { x: r.left - f.left + r.width / 2, y: r.top - f.top + r.height / 2 } : { x: cx, y: cy };
      });
      const r = Math.max(...rings.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 40;
      setGeo({ w: f.width, h: f.height, cx, cy, rings, r });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  /** Dotted arc from the disc's edge to a speaker ring's edge, bowing gently. */
  const arc = (p: { x: number; y: number }) => {
    if (!geo) return "";
    const dx = p.x - geo.cx;
    const dy = p.y - geo.cy;
    const d = Math.hypot(dx, dy);
    const ux = dx / d;
    const uy = dy / d;
    const sx = geo.cx + ux * (SV.disc.size / 2 + 8);
    const sy = geo.cy + uy * (SV.disc.size / 2 + 8);
    const ex = p.x - ux * 40;
    const ey = p.y - uy * 40;
    const mx = (sx + ex) / 2 - uy * d * 0.12 * Math.sign(dx);
    const my = (sy + ey) / 2 + ux * d * 0.12 * Math.sign(dx);
    return `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };
  const lightDelay = (i: number) => E.light + LIGHT_ORDER.indexOf(i) * E.lightStagger;
  const receiveDelay = (i: number) =>
    geo ? SV.idle.firstAt + E.waveS * (Math.hypot(geo.rings[i].x - geo.cx, geo.rings[i].y - geo.cy) / geo.r) : SV.idle.firstAt;

  return (
    <div ref={fieldRef} className="relative mx-auto grid grid-cols-[1fr_200px_1fr] grid-rows-2" style={{ maxWidth: SV.field.maxW, height: SV.field.h }}>
      {/* Field graphics: concentric rings, dotted arcs (each drawn from the centre via a mask), wavefronts */}
      {geo && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none">
          <defs>
            <linearGradient id="sv-wave-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0E3B8C" />
              <stop offset="1" stopColor="#FF5A1F" />
            </linearGradient>
            {values.map((v, i) => (
              <mask key={v.id} id={`sv-arc-mask-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={geo.w} height={geo.h}>
                <g className="sv-lit">
                  <path className="sv-draw" d={arc(geo.rings[i])} pathLength={1} stroke="#fff" strokeWidth={6} style={{ ["--d" as string]: `${lightDelay(i)}s` }} />
                </g>
              </mask>
            ))}
          </defs>
          {[90, 125, 160].map((r, k) => (
            <circle
              key={r}
              className="sv-cring"
              cx={geo.cx}
              cy={geo.cy}
              r={r}
              stroke={`rgba(14,59,140,${0.12 - k * 0.02})`}
              strokeWidth={1}
              style={{ ["--d" as string]: `${E.rings + k * E.ringStagger}s` }}
            />
          ))}
          {values.map((v, i) => (
            <path key={v.id} d={arc(geo.rings[i])} mask={reduced ? undefined : `url(#sv-arc-mask-${i})`} stroke="rgba(14,59,140,0.1)" strokeWidth={1.5} strokeDasharray="1.5 6" strokeLinecap="round" />
          ))}
          {hot && <path key={hot.n} className="sv-hot" d={arc(geo.rings[hot.i])} pathLength={1} stroke="url(#sv-wave-grad)" strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" />}
          <circle className="sv-wave sv-wave-in" cx={geo.cx} cy={geo.cy} r={geo.r} stroke="url(#sv-wave-grad)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <circle className="sv-wave sv-wave-idle" cx={geo.cx} cy={geo.cy} r={geo.r} stroke="url(#sv-wave-grad)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      )}

      {/* Centre disc */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CentreDisc size={SV.disc.size} logoClassName="w-[72px] h-9" />
      </div>

      {/* The four "speakers" (FL, FR, RL, RR): the ring glyph faces the centre, text is left-aligned */}
      {values.map((v, i) => {
        const right = i % 2 === 1;
        const bottom = i >= 2;
        return (
          <div
            key={v.id}
            className={`sv-value sv-lit relative z-10 flex gap-5 ${right ? "col-start-3" : "col-start-1 flex-row-reverse"} ${bottom ? "row-start-2 self-end" : "row-start-1 self-start"} ${
              right ? "justify-self-start" : "justify-self-end"
            } max-w-[360px]`}
            style={{ ["--d" as string]: `${lightDelay(i)}s`, ["--out" as string]: right ? "4px" : "-4px" }}
            onMouseEnter={() => !reduced && setHot((h) => ({ i, n: (h?.n ?? 0) + 1 }))}
          >
            <span
              ref={(el) => {
                glyphRefs.current[i] = el;
              }}
            >
              <SpeakerGlyph icon={v.icon} delay={lightDelay(i)} receiveDelay={receiveDelay(i)} />
            </span>
            <div className="sv-text pt-1 text-left">
              <h3 className="sv-title font-heading font-semibold text-xl text-ink">{v.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted max-w-[34ch]">{v.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Tablet & mobile: stacked ────────────────────────────────────────────────────────────────────────────────

const StackedValue: React.FC<{ index: number; reduced: boolean }> = ({ index, reduced }) => {
  const v = COMPANY_INFO.coreValues[index];
  const ref = useRef<HTMLLIElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 }) || reduced;
  return (
    <li ref={ref} data-on={seen || undefined} className="sv-value sv-lit relative flex gap-5 py-7" style={{ ["--d" as string]: "0s", ["--out" as string]: "4px" }}>
      {index > 0 && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-line" />}
      <SpeakerGlyph icon={v.icon} delay={0} size={56} />
      <div className="sv-text min-w-0">
        <h3 className="sv-title font-heading font-semibold text-lg text-ink">{v.title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{v.description}</p>
      </div>
    </li>
  );
};

export const SurroundValuesSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const desktop = useMedia("(min-width: 1024px)");
  const sectionRef = useRef<HTMLElement>(null);
  const fieldWrapRef = useRef<HTMLDivElement>(null);
  // Desktop: the whole field lights up at ~30% in view. Below lg each row has its own trigger (StackedValue).
  const on = useInView(fieldWrapRef, { once: true, amount: desktop ? 0.3 : 0.1 }) || reduced;

  // Idle loops run only while the section is near the viewport and the tab is visible.
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let onScreen = false;
    const update = () => setRunning(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    }, { rootMargin: "100px 0px" });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section ref={sectionRef} data-paused={running ? undefined : ""} className="bg-surface-cool py-20 border-y border-line overflow-x-clip">
      <style>{CSS}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
            Guiding Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
            Our Core Values
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Four pillars that govern every architectural schematic, cable termination, and handover.
          </p>
        </div>

        <div ref={fieldWrapRef}>
          {desktop ? (
            <div data-on={on || undefined}>
              <ListeningField reduced={reduced} />
            </div>
          ) : (
            <>
              <div data-on={on || undefined} className="flex justify-center mb-6">
                <CentreDisc size={104} logoClassName="w-14 h-7" />
              </div>
              <ul className="max-w-2xl mx-auto">
                {COMPANY_INFO.coreValues.map((v, i) => (
                  <StackedValue key={v.id} index={i} reduced={reduced} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
