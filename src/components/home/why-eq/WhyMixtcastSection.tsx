import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { COMPANY_INFO } from "../../../data/company";
import { HorizontalFader, VerticalFader } from "./Faders";
import { ACTIVE_GROW, EASE, ENTRANCE, HEADER, HOVER_MS, KNOB_SPRING, REST, SEAM } from "./eqSettings";

/**
 * Home "Why MixtCast": "The Five-Band EQ" — the five reasons as equalizer bands with faders (no cards), entered from
 * the Methodology story through a light, classic hairline transition. Tuning lives in eqSettings.ts.
 */

type Reason = (typeof COMPANY_INFO.whyChooseUs)[number];
const pad2 = (n: number) => String(n).padStart(2, "0");
const HAIRLINE = "#E6E8EC";

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

/**
 * One fader position per band. Entrance: each knob glides up from 0 to its resting value (staggered spring);
 * afterwards the active band goes to 1 and the rest return to rest.
 */
const useFaders = (entered: boolean, active: number | null, reduced: boolean, stagger: number) => {
  const p0 = useMotionValue(0);
  const p1 = useMotionValue(0);
  const p2 = useMotionValue(0);
  const p3 = useMotionValue(0);
  const p4 = useMotionValue(0);
  const positions = [p0, p1, p2, p3, p4];
  const settled = useRef(false);

  useEffect(() => {
    if (reduced) {
      positions.forEach((p, i) => p.set(REST[i]));
      settled.current = true;
      return;
    }
    if (!entered) return;
    const controls = positions.map((p, i) => {
      const target = settled.current && active === i ? 1 : REST[i];
      return settled.current
        ? animate(p, target, { duration: HOVER_MS / 1000, ease: EASE })
        : animate(p, target, { ...KNOB_SPRING, delay: ENTRANCE.knob.at + i * stagger });
    });
    settled.current = true;
    return () => controls.forEach((c) => c.stop());
  }, [entered, active, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return positions;
};

/** Faint, static waveform watermark behind the bands. */
const Watermark: React.FC = () => {
  let d = "";
  for (let i = 0; i <= 240; i++) {
    const t = i / 240;
    const env = 0.25 + 0.75 * Math.sin(Math.PI * t);
    const y = 50 - (Math.sin(t * Math.PI * 2 * 7) * 0.65 + Math.sin(t * Math.PI * 2 * 17 + 1) * 0.35) * env * 44;
    d += `${i ? "L" : "M"}${(t * 1000).toFixed(1)} ${y.toFixed(1)} `;
  }
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-[220px]" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none">
      <path d={d} stroke="rgba(14,59,140,0.03)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// ── Desktop (lg+): five vertical bands ──────────────────────────────────────────────────────────────────────

const BandsRow: React.FC<{ reasons: Reason[]; reduced: boolean }> = ({ reasons, reduced }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const entered = useInView(rowRef, { once: true, amount: 0.25 }) || reduced;
  const [active, setActive] = useState<number | null>(null);
  const positions = useFaders(entered, active, reduced, ENTRANCE.knob.stagger);

  // Lock the text block height to its worst case (a band squeezed while a neighbour is widened), so hovering
  // never changes the row's height — nothing outside the row moves.
  const [textH, setTextH] = useState<number | undefined>(undefined);
  const [squeezedW, setSqueezedW] = useState(0);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const bandW = row.offsetWidth / (reasons.length - 1 + (reduced ? 1 : ACTIVE_GROW));
      setSqueezedW(Math.floor(bandW) - 40); // minus the band's horizontal padding (px-5)
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [reasons.length, reduced]);
  useLayoutEffect(() => {
    const m = measureRef.current;
    if (!m || !squeezedW) return;
    setTextH(Math.max(...Array.from(m.children).map((c) => (c as HTMLElement).offsetHeight)));
  }, [squeezedW]);

  const reveal = (i: number, at: number, duration: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 10 },
          animate: entered ? { opacity: 1, y: 0 } : undefined,
          transition: { duration, delay: at, ease: EASE },
        };

  return (
    <div className="relative">
      <Watermark />
      {/* Hidden measuring copy for the height lock (not announced, not visible) */}
      <div ref={measureRef} aria-hidden="true" className="invisible absolute left-0 top-0 pointer-events-none">
        {reasons.map((r) => (
          <div key={r.id} style={{ width: squeezedW }}>
            <h3 className="font-heading font-semibold text-lg leading-snug">{r.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>

      <div ref={rowRef} className="relative flex [contain:layout]" onMouseLeave={() => setActive(null)}>
        {reasons.map((r, i) => {
          const on = active === i;
          const textAt = ENTRANCE.knob.at + i * ENTRANCE.knob.stagger + ENTRANCE.text.after;
          return (
            <div
              key={r.id}
              tabIndex={0}
              aria-labelledby={`why-eq-${r.id}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group relative min-w-0 px-5 pt-2 pb-4 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-orange rounded-sm"
              style={{
                flexBasis: 0,
                flexGrow: on && !reduced ? ACTIVE_GROW : 1,
                transition: reduced ? undefined : `flex-grow ${HOVER_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {/* Hairline separator, drawn top → bottom */}
              {i > 0 && (
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-px origin-top"
                  style={{ background: HAIRLINE }}
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={entered ? { scaleY: 1 } : undefined}
                  transition={{ duration: ENTRANCE.hairline.duration, delay: ENTRANCE.hairline.at + i * ENTRANCE.hairline.stagger, ease: EASE }}
                />
              )}
              {/* Faint vertical light wash behind the active band */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{ opacity: on ? 1 : 0, background: "linear-gradient(to bottom, rgba(255,90,31,0), rgba(255,90,31,0.05) 45%, rgba(14,59,140,0.03) 80%, rgba(14,59,140,0))" }}
              />

              <div className="relative">
                <motion.span
                  className={`block font-['Cormorant_Garamond',Georgia,serif] italic font-medium text-[40px] leading-none transition-colors duration-300 ${on ? "text-brand-orange" : "text-brand-navy/70"}`}
                  {...reveal(i, ENTRANCE.numeral.at + i * ENTRANCE.numeral.stagger, ENTRANCE.numeral.duration)}
                >
                  {pad2(i + 1)}
                </motion.span>
                <div className="mt-4 mb-5">
                  <VerticalFader pos={positions[i]} bright={on} />
                </div>
                <motion.div style={{ minHeight: textH }} {...reveal(i, textAt, ENTRANCE.text.duration)}>
                  <h3 id={`why-eq-${r.id}`} className="font-heading font-semibold text-lg leading-snug text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{r.description}</p>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Tablet & mobile (< lg): stacked rows with horizontal faders ─────────────────────────────────────────────

const Row: React.FC<{ reason: Reason; index: number; pos: MotionValue<number>; on: boolean; reduced: boolean; onToggle: () => void; onEnter: () => void }> = ({
  reason,
  index,
  pos,
  on,
  reduced,
  onToggle,
  onEnter,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  useEffect(() => {
    if (inView) onEnter();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = inView || reduced;
  return (
    <motion.li
      ref={ref}
      tabIndex={0}
      aria-labelledby={`why-eq-m-${reason.id}`}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="relative grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] gap-x-4 py-7 cursor-pointer outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange rounded-sm"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={shown ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {index > 0 && <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-px" style={{ background: HAIRLINE }} />}
      <span className={`font-['Cormorant_Garamond',Georgia,serif] italic font-medium text-[34px] sm:text-[40px] leading-none transition-colors duration-300 ${on ? "text-brand-orange" : "text-brand-navy/70"}`}>
        {pad2(index + 1)}
      </span>
      <div className="min-w-0">
        <h3 id={`why-eq-m-${reason.id}`} className="font-heading font-semibold text-lg leading-snug text-ink">
          {reason.title}
        </h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{reason.description}</p>
        <div className="mt-4">
          <HorizontalFader pos={pos} bright={on} />
        </div>
      </div>
    </motion.li>
  );
};

const StackedRows: React.FC<{ reasons: Reason[]; reduced: boolean }> = ({ reasons, reduced }) => {
  const [active, setActive] = useState<number | null>(null);
  // Each knob glides in when its own row enters view.
  const [seen, setSeen] = useState<boolean[]>(() => reasons.map(() => false));
  const positions = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  useEffect(() => {
    if (reduced) {
      positions.forEach((p, i) => p.set(active === i ? 1 : REST[i]));
      return;
    }
    const controls = positions.map((p, i) => {
      if (!seen[i]) return null;
      const target = active === i ? 1 : REST[i];
      return p.get() === 0 ? animate(p, target, { ...KNOB_SPRING, delay: 0.2 }) : animate(p, target, { duration: HOVER_MS / 1000, ease: EASE });
    });
    return () => controls.forEach((c) => c?.stop());
  }, [seen, active, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ol>
      {reasons.map((r, i) => (
        <Row
          key={r.id}
          reason={r}
          index={i}
          pos={positions[i]}
          on={active === i}
          reduced={reduced}
          onToggle={() => setActive((a) => (a === i ? null : i))}
          onEnter={() => setSeen((s) => (s[i] ? s : s.map((v, k) => v || k === i)))}
        />
      ))}
    </ol>
  );
};

// ── Section ─────────────────────────────────────────────────────────────────────────────────────────────────

export const WhyMixtcastSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const desktop = useMedia("(min-width: 1024px)");
  const reasons = COMPANY_INFO.whyChooseUs;
  const wrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerIn = useInView(headerRef, { once: true, amount: 0.6 }) || reduced;

  // Seam: the page gap above (layout offsets), so the soft gradient starts right at Methodology's bottom edge.
  const [gap, setGap] = useState(0);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const prev = wrap.previousElementSibling as HTMLElement | null;
      setGap(prev ? Math.max(0, wrap.offsetTop - (prev.offsetTop + prev.offsetHeight)) : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    if (wrap.previousElementSibling) observer.observe(wrap.previousElementSibling);
    return () => observer.disconnect();
  }, []);
  const seamH = Math.min(SEAM, gap) + 1;

  const fadeUp = (delay: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: HEADER.rise },
          animate: headerIn ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <div ref={wrapRef} className="relative">
      {/* Soft seam from the Methodology tint into white — overlay only; covers the 1px bottom border */}
      {gap > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0"
          style={{ top: -gap - 1, height: seamH, background: "linear-gradient(to bottom, #F3F6FB, rgba(243,246,251,0))" }}
        />
      )}

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Classic hairline: draws outward from the centre, above the header (in the gap — adds no height) */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 -top-7 h-px"
          style={{ background: "rgba(14,59,140,0.25)" }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={headerIn ? { scaleX: 1 } : undefined}
          transition={{ duration: HEADER.lineMs / 1000, ease: EASE }}
        />
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-16">
          <motion.span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2" {...fadeUp(HEADER.eyebrowDelay)}>
            Why MixtCast
          </motion.span>
          <motion.h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading" {...fadeUp(HEADER.headingDelay)}>
            Engineered For Absolute Performance
          </motion.h2>
        </div>

        {desktop ? <BandsRow reasons={reasons} reduced={reduced} /> : <StackedRows reasons={reasons} reduced={reduced} />}
      </section>
    </div>
  );
};
