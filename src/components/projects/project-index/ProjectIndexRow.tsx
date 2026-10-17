import React from "react";
import { motion } from "motion/react";
import type { ClientProject } from "../../../data/clients";

/**
 * Projects page — "Project Index": a clean, professional list. Each row shows index · sector · client & scope.
 * Rows are informational (not clickable); the hover accent is decorative and desktop-only. Only confirmed content is
 * shown: name, sector and confirmed scope. Tuning: INDEX below.
 */

export const INDEX = {
  stagger: 0.07, // s between rows on entrance
  rise: 16, // px
  lineMs: 500, // each hairline draws just before its row
  layoutMs: 350, // filter change: rows slide into place
};

export const INDEX_CSS = `
.pi-row { transition: background-color 300ms ease; }
.pi-accent { transform: scaleY(0); transform-origin: center; transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.pi-name { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (hover: hover) and (pointer: fine) {
  .pi-row:hover { background-color: #FAFBFD; }
  .pi-row:hover .pi-accent { transform: scaleY(1); }
  .pi-row:hover .pi-name { transform: translateX(6px); }
}
@media (prefers-reduced-motion: reduce) {
  /* Hover keeps its colour change only */
  .pi-accent { transition: none; }
  .pi-row:hover .pi-name { transform: none; }
}
`;

export const indexNumber = (n: number) => String(n).padStart(2, "0");

export const SectorPill: React.FC<{ sector: string; className?: string }> = ({ sector, className = "" }) => (
  <span className={`inline-flex items-center rounded-full bg-surface-cool px-3 py-1 text-xs font-medium text-brand-navy ${className}`}>{sector}</span>
);

interface RowProps {
  project: ClientProject;
  index: number;
  reduced: boolean;
  /** Entrance delay (s); null until the list has entered view. */
  delay: number | null;
}

export const ProjectIndexRow: React.FC<RowProps> = ({ project, index, reduced, delay }) => {
  const on = delay !== null;
  const d = delay ?? 0;

  return (
    <>
      <motion.div
        className="pi-row relative px-2 py-6 md:py-7"
        initial={reduced ? false : { opacity: 0, y: INDEX.rise }}
        animate={on ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: d + INDEX.lineMs / 1000 / 2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Accent bar on hover (desktop) */}
        <span aria-hidden="true" className="pi-accent absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-brand-navy to-brand-orange" />

        {/* Mobile: index + sector on top */}
        <div className="flex items-center gap-3 mb-3 md:hidden">
          <span className="text-sm font-medium tabular-nums text-[#8A929E]">{indexNumber(index)}</span>
          <SectorPill sector={project.category} />
        </div>

        {/* Client name and scope take all remaining width */}
        <div className="grid items-center gap-x-6 md:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[80px_220px_minmax(0,1fr)]">
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
