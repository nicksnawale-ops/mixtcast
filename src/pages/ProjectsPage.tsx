import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, X, ZoomIn, ArrowRight } from "lucide-react";
import { CLIENT_PROJECTS, ClientProject } from "../data/clients";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { Button } from "../components/ui/Button";

type ProjectCategory = "All" | "Education & Institutional" | "Cinema & Entertainment" | "Real Estate & Infrastructure";

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

  const categories: ProjectCategory[] = [
    "All",
    "Education & Institutional",
    "Cinema & Entertainment",
    "Real Estate & Infrastructure",
  ];

  const filteredProjects =
    activeCategory === "All"
      ? CLIENT_PROJECTS
      : CLIENT_PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-16 pb-24">
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

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-white border border-line shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image slot with hover zoom */}
                <div className="overflow-hidden aspect-16/10 relative">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.name}
                    fallbackTitle={project.name}
                    category={project.category}
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-brand-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 rounded-full bg-white/90 text-brand-navy shadow-md">
                      <ZoomIn className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-brand-navy block mb-1">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-ink font-heading group-hover:text-brand-orange transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                      {project.descriptionPlaceholder}
                    </p>
                  </div>

                  {/* Waveform Underline Motif on Hover */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <span className="h-1.5 w-1 bg-brand-orange rounded-full group-hover:h-3 transition-all duration-300" />
                      <span className="h-3 w-1 bg-brand-navy rounded-full group-hover:h-5 transition-all duration-300" />
                      <span className="h-5 w-1 bg-brand-orange rounded-full group-hover:h-7 transition-all duration-300" />
                      <span className="h-3 w-1 bg-brand-navy rounded-full group-hover:h-5 transition-all duration-300" />
                      <span className="h-1.5 w-1 bg-brand-orange rounded-full group-hover:h-3 transition-all duration-300" />
                      <span className="h-[1px] flex-1 bg-line group-hover:bg-brand-orange/40 transition-colors ml-2" />
                    </div>
                  </div>
                </div>
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

                  <div className="aspect-video relative overflow-hidden">
                    <ImageWithFallback
                      src={selectedProject.image}
                      alt={selectedProject.name}
                      fallbackTitle={selectedProject.name}
                      category={selectedProject.category}
                    />
                  </div>

                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                        {selectedProject.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-ink-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-navy" />
                        <span>{selectedProject.city}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-ink font-heading">
                      {selectedProject.name}
                    </h3>

                    <p className="text-sm text-ink-muted leading-relaxed">
                      {selectedProject.descriptionPlaceholder}
                    </p>

                    <div className="p-4 rounded-xl bg-surface-warm border border-line text-xs text-ink-muted">
                      <span className="font-semibold text-brand-navy block mb-1">
                        Installation Documentation Notice
                      </span>
                      Technical specs, line diagrams, and client sign-off records are archived under confidentiality agreements. Contact MixtCast for full case study presentations.
                    </div>

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
