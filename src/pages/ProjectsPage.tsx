import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import { PROJECTS, ClientProject } from "../data/clients";
import { Button } from "../components/ui/Button";
import { INDEX, INDEX_CSS, ProjectIndexRow } from "../components/projects/project-index/ProjectIndexRow";

type ProjectCategory = "All" | ClientProject["category"];

// "Project Index": only confirmed content is displayed — name, category (sector) and confirmed scope. Project
// descriptions and locations in the data are unconfirmed, and the linked testimonials are kept in the data but not
// rendered here.
const indexOf = (p: ClientProject) => PROJECTS.indexOf(p) + 1; // fixed by the full list, not the filtered position
const countOf = (cat: string) => (cat === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length);

export const ProjectsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");

  // Filter chips come from the categories present in the data (in first-appearance order).
  const categories: ProjectCategory[] = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.category)))];

  const filteredProjects =
    activeCategory === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  const reduced = !!useReducedMotion();
  // Entrance (once per page view): as the list enters view, hairlines draw and rows rise, 70ms apart. Rows shown later
  // by a filter change simply fade in.
  const listRef = useRef<HTMLDivElement>(null);
  const listIn = useInView(listRef, { once: true, amount: 0.1 }) || reduced;
  const entranceDone = useRef(false);
  useEffect(() => {
    if (!listIn) return;
    const t = window.setTimeout(() => (entranceDone.current = true), (PROJECTS.length * INDEX.stagger + 1) * 1000);
    return () => window.clearTimeout(t);
  }, [listIn]);
  const rowDelay = useCallback((i: number) => (listIn ? (entranceDone.current || reduced ? 0 : i * INDEX.stagger) : null), [listIn, reduced]);

  return (
    <div className="space-y-16 pb-24">
      <style>{INDEX_CSS}</style>
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-[2px] w-4 bg-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Portfolio Showcase
          </span>
          <span className="h-[2px] w-4 bg-brand-orange" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
          Client Projects & Installations
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
          Explore representative projects delivered across defence medical institutes, commercial cinema
          chains, corporate headquarters, and infrastructure developments.
        </p>

        {/* Category Filters */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const on = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={on}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium cursor-pointer select-none whitespace-nowrap transition-colors duration-200 outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
                  on ? "bg-brand-navy border-brand-navy text-white" : "bg-white border-[#E6E8EC] text-[#4A5260] hover:text-ink"
                }`}
              >
                {cat}
                <span className={`rounded-full px-1.5 py-px text-[11px] tabular-nums ${on ? "bg-white/15 text-white" : "bg-surface-cool text-[#8A929E]"}`}>
                  {countOf(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Project index */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={listRef}>
          <motion.span
            aria-hidden="true"
            className="block h-px bg-[#E6E8EC] origin-left"
            initial={reduced ? false : { scaleX: 0 }}
            animate={listIn ? { scaleX: 1 } : undefined}
            transition={{ duration: INDEX.lineMs / 1000, ease: [0.22, 1, 0.36, 1] }}
          />
          <ul>
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredProjects.map((project, i) => (
                <motion.li
                  key={project.id}
                  layout={!reduced}
                  exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                  transition={{ duration: reduced ? 0 : INDEX.layoutMs / 1000, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectIndexRow
                    project={project}
                    index={indexOf(project)}
                    reduced={reduced}
                    delay={rowDelay(i)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-surface-warm border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-ink font-heading">
              Have a Similar Architecture in Mind?
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Discuss your space constraints with our AV consultants.
            </p>
          </div>
          <Button to="/contact" variant="cta" size="md">
            Request Case Study Review
          </Button>
        </div>
      </section>
    </div>
  );
};
