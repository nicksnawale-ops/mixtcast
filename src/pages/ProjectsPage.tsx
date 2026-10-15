import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { PROJECTS, ClientProject } from "../data/clients";
import { TESTIMONIALS } from "../data/testimonials";
import { Button } from "../components/ui/Button";
import { Clapstick, ProductionSlate, SLATE, SLATE_CSS, takeNumber } from "../components/projects/production-slate/ProductionSlate";
import { SprocketEdges } from "../components/projects/production-slate/SprocketEdges";

type ProjectCategory = "All" | ClientProject["category"];

// "The Production Slate": only confirmed content is displayed — name, category (sector), confirmed scope and a linked
// client testimonial. Project descriptions and locations in the data are unconfirmed and are not rendered here.
const testimonialFor = (p: ClientProject) => TESTIMONIALS.find((t) => t.organization === p.testimonialOrg);
const takeOf = (p: ClientProject) => PROJECTS.indexOf(p) + 1; // fixed by the full list, not the filtered position

export const ProjectsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  // Filter chips come from the categories present in the data (in first-appearance order).
  const categories: ProjectCategory[] = ["All", ...Array.from(new Set(PROJECTS.map((p) => p.category)))];

  const filteredProjects =
    activeCategory === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  const reduced = !!useReducedMotion();
  // Entrance cascade: slates entering together are queued in order, 120ms apart.
  const nextSlot = useRef(0);
  const claimDelay = useCallback(() => {
    const now = performance.now();
    const start = Math.max(now, nextSlot.current);
    nextSlot.current = start + SLATE.stagger * 1000;
    return (start - now) / 1000;
  }, []);
  const selectedTestimonial = selectedProject ? testimonialFor(selectedProject) : undefined;

  return (
    <div className="relative space-y-16 pb-24">
      <style>{SLATE_CSS}</style>
      {/* Faint film-strip edges (desktop) */}
      <SprocketEdges />
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-brand-navy text-white shadow-md shadow-brand-navy/20"
                  : "bg-surface-warm text-ink-muted hover:text-ink hover:bg-surface-cool border border-line"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid — production slates */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout={!reduced}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductionSlate
                  project={project}
                  take={takeOf(project)}
                  testimonial={testimonialFor(project)}
                  reduced={reduced}
                  claimDelay={claimDelay}
                  onOpen={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox Modal (Portaled to document.body) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                key="lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="fixed inset-0 top-0 right-0 bottom-0 left-0 w-[100vw] h-[100vh] h-[100dvh] z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl bg-white rounded-3xl overflow-y-auto shadow-2xl border border-line max-h-[90vh] max-h-[90dvh]"
                >
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-ink hover:text-brand-orange shadow-md transition-colors"
                    aria-label="Close details"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Slate header */}
                  <div className="px-8 pt-16">
                    <Clapstick />
                    <div className="grid grid-cols-[auto_1fr] border border-[#E6E8EC] border-t-0">
                      <div className="px-5 py-3 border-r border-[#E6E8EC]">
                        <span className="slate-label block">Take</span>
                        <span className="slate-num block text-[36px] leading-none mt-1">{takeNumber(takeOf(selectedProject))}</span>
                      </div>
                      <div className="px-5 py-3 min-w-0">
                        <span className="slate-label block">Sector</span>
                        <span className="block mt-1.5 font-heading font-semibold text-sm text-brand-navy">{selectedProject.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-5">
                    <div>
                      <span className="slate-label block">Client</span>
                      <h3 className="mt-1.5 text-2xl font-bold text-ink font-heading">{selectedProject.name}</h3>
                    </div>

                    {selectedProject.scope && (
                      <div>
                        <span className="slate-label block">Scope</span>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-[#4A5260]">{selectedProject.scope}</p>
                      </div>
                    )}

                    {selectedTestimonial && (
                      <figure className="border-l-2 border-brand-orange pl-4">
                        <blockquote className="text-[15px] italic leading-relaxed text-ink-muted">“{selectedTestimonial.quote}”</blockquote>
                        <figcaption className="mt-2 text-sm">
                          <cite className="not-italic">
                            <span className="font-heading font-semibold text-ink">{selectedTestimonial.author}</span>
                            <span className="text-ink-muted"> — {selectedTestimonial.organization}</span>
                          </cite>
                        </figcaption>
                      </figure>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={() => setSelectedProject(null)}
                        variant="primary"
                        size="sm"
                      >
                        Close Showcase
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

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
