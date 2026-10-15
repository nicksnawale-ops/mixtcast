import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ClientProject } from "../../../data/clients";
import type { Testimonial } from "../../../data/testimonials";

/**
 * Projects page — "Project Index": a clean, professional list. Each row (index · sector · client & scope ·
 * Delivered + arrow) opens the project details. Only confirmed content is shown: name, sector, confirmed scope and a
 * linked client testimonial. Tuning: INDEX below.
 */

export const INDEX = {
  stagger: 0.07, // s between rows on entrance
  rise: 16, // px
  lineMs: 500, // each hairline draws just before its row
  layoutMs: 350, // filter change: rows slide into place
  excerpt: 140, // testimonial characters shown on hover (desktop) / always (mobile, 2 lines)
};

export const INDEX_CSS = `
.pi-label { font-family: var(--font-body); font-weight: 500; font-size: 12px; letter-spacing: 0.04em; color: #8A929E; }
.pi-row { transition: background-color 300ms ease; }
.pi-row[data-active] { background-color: #FAFBFD; }
.pi-accent { transform: scaleY(0); transform-origin: center; transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.pi-row[data-active] .pi-accent { transform: scaleY(1); }
.pi-name { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.pi-row[data-active] .pi-name { transform: translateX(6px); }
.pi-arrow { transition: background-color 250ms ease, border-color 250ms ease, color 250ms ease; }
.pi-arrow svg { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.pi-row[data-active] .pi-arrow { background-color: var(--color-brand-navy); border-color: var(--color-brand-navy); color: #FFFFFF; }
.pi-row[data-active] .pi-arrow svg { transform: translateX(4px); }
@media (prefers-reduced-motion: reduce) {
  /* Hover keeps its colour changes only */
  .pi-accent { transition: none; }
  .pi-row[data-active] .pi-name, .pi-row[data-active] .pi-arrow svg { transform: none; }
}
`;

export const indexNumber = (n: number) => String(n).padStart(2, "0");

const excerptOf = (quote: string) => {
  if (quote.length <= INDEX.excerpt) return quote;
  const cut = quote.slice(0, INDEX.excerpt);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

export const SectorPill: React.FC<{ sector: string; className?: string }> = ({ sector, className = "" }) => (
  <span className={`inline-flex items-center rounded-full bg-surface-cool px-3 py-1 text-xs font-medium text-brand-navy ${className}`}>{sector}</span>
);

const Delivered: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4A5260] whitespace-nowrap">
    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
    Delivered
  </span>
);

const Excerpt: React.FC<{ t: Testimonial; clamp?: boolean }> = ({ t, clamp }) => (
  <p className="text-[15px] leading-relaxed text-ink-muted">
    <span aria-hidden="true" className="mr-1 font-heading font-bold text-brand-orange">“</span>
    <span className={`italic ${clamp ? "line-clamp-2" : ""}`}>{excerptOf(t.quote)}</span>
    <span className="mt-1 block text-[13px] font-medium not-italic text-[#4A5260]">
      — {t.author}, {t.organization}
    </span>
  </p>
);

interface RowProps {
  project: ClientProject;
  index: number;
  testimonial?: Testimonial;
  reduced: boolean;
  /** Entrance delay (s); null until the list has entered view. */
  delay: number | null;
  onOpen: () => void;
}

export const ProjectIndexRow: React.FC<RowProps> = ({ project, index, testimonial, reduced, delay, onOpen }) => {
  const [active, setActive] = useState(false);
  const on = delay !== null;
  const d = delay ?? 0;

  return (
    <>
      <motion.div
        // A div with button semantics (a real <button> may only contain inline content; this row needs block layout).
        role="button"
        tabIndex={0}
        aria-label={`View ${project.name} project details`}
        data-active={active || undefined}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(true)}
        onBlur={() => setActive(false)}
        className="pi-row group relative cursor-pointer px-2 py-6 md:py-7 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-orange"
        initial={reduced ? false : { opacity: 0, y: INDEX.rise }}
        animate={on ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: d + INDEX.lineMs / 1000 / 2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Accent bar on hover/focus */}
        <span aria-hidden="true" className="pi-accent absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-brand-navy to-brand-orange" />

        {/* Mobile: index + sector on top */}
        <div className="flex items-center gap-3 mb-3 md:hidden">
          <span className="text-sm font-medium tabular-nums text-[#8A929E]">{indexNumber(index)}</span>
          <SectorPill sector={project.category} />
        </div>

        <div className="grid items-center gap-x-6 md:grid-cols-[64px_minmax(0,1fr)_auto] lg:grid-cols-[80px_220px_minmax(0,1fr)_auto]">
          <span className="hidden md:block text-sm font-medium tabular-nums text-[#8A929E] pl-2">{indexNumber(index)}</span>
          <div className="hidden lg:block">
            <SectorPill sector={project.category} />
          </div>

          <div className="min-w-0">
            <span className="pi-name block font-heading font-semibold text-ink leading-snug" style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)" }}>
              {project.name}
            </span>
            <SectorPill sector={project.category} className="hidden md:inline-flex lg:hidden mt-2" />
            {project.scope && <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{project.scope}</p>}

            {/* Linked testimonial: expands on hover/focus (md+); always visible, clamped, on mobile */}
            {testimonial && (
              <>
                <div className="hidden md:block">
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.div
                        key="excerpt"
                        className="overflow-hidden"
                        initial={reduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="pt-3">
                          <Excerpt t={testimonial} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="md:hidden pt-3">
                  <Excerpt t={testimonial} clamp />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-5">
            {project.confirmed ? <Delivered /> : <span />}
            <span aria-hidden="true" className="pi-arrow inline-flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-[#E6E8EC] bg-white text-brand-navy">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Hairline under the row, drawn left → right just before the row appears */}
      <motion.span
        aria-hidden="true"
        className="block h-px bg-[#E6E8EC] origin-left"
        initial={reduced ? false : { scaleX: 0 }}
        animate={on ? { scaleX: 1 } : undefined}
        transition={{ duration: INDEX.lineMs / 1000, delay: d, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
};
