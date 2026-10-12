import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { SOLUTIONS, SolutionSpace } from "../data/solutions";
import { CurtainReveal } from "../components/animations/CurtainReveal";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { Button } from "../components/ui/Button";

/**
 * Space photo panel: same frame as the ImageWithFallback cinema panel (4:3, navy top/bottom
 * border), with a caption overlay. Falls back to the original placeholder if the photo fails.
 */
const SolutionPhoto: React.FC<{ sol: SolutionSpace; eager: boolean }> = ({ sol, eager }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <ImageWithFallback
        alt={sol.title}
        fallbackTitle={sol.title}
        category="Space Integration"
        aspectRatioClass="aspect-4/3"
        cinemaFrame={true}
      />
    );
  }

  const show = inView && loaded;

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden bg-surface-warm select-none aspect-4/3 border-y-[3px] border-brand-navy"
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <motion.img
          src={sol.photo}
          srcSet={`${sol.photo.replace(".webp", "-800.webp")} 800w, ${sol.photo} 1600w`}
          sizes="(min-width: 1024px) 480px, calc(100vw - 6rem)"
          alt={sol.photoAlt}
          width={1600}
          height={1200}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.05 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Caption: same label and space name as the placeholder */}
      <div className="absolute inset-x-0 bottom-0 px-5 pt-12 pb-4 bg-gradient-to-t from-brand-navy/85 via-brand-navy/40 to-transparent pointer-events-none">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-orange-soft mb-0.5">
          Space Integration
        </span>
        <h4 className="text-sm font-semibold text-white font-heading line-clamp-1">
          {sol.title}
        </h4>
      </div>
    </div>
  );
};

export const SolutionsPage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. CURTAIN REVEAL HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <CurtainReveal>
          <div className="py-16 sm:py-24 px-8 sm:px-16 rounded-3xl bg-surface-warm border border-line text-center space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="h-[2px] w-4 bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Engineered Solutions by Space
              </span>
              <span className="h-[2px] w-4 bg-brand-orange" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-ink font-heading tracking-tight max-w-4xl mx-auto leading-tight">
              Architectural AV Environments Calibrated for Peak Performance
            </h1>

            <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              Every room has unique physics. We resolve acoustic reflections, sightline constraints,
              and operational complexity with tailored hardware and automation architecture.
            </p>
          </div>
        </CurtainReveal>
      </section>

      {/* 2. DETAILED SOLUTIONS LIST BY SPACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {SOLUTIONS.map((sol, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={sol.id}
              id={sol.slug}
              className="scroll-mt-28 p-8 sm:p-12 rounded-3xl bg-surface border border-line shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text Content (7 cols) */}
                <div className={`space-y-6 ${isReversed ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
                      Space 0{index + 1} · {sol.slug.replace("-", " ")}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading leading-tight">
                      {sol.title}
                    </h2>
                    <p className="text-sm font-semibold text-brand-navy mt-1">
                      {sol.tagline}
                    </p>
                  </div>

                  {/* Challenge & Solution Blocks */}
                  <div className="space-y-4 pt-2">
                    {/* The Challenge */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>The Architectural Challenge</span>
                      </div>
                      <p className="text-xs text-amber-950/80 leading-relaxed">
                        {sol.challenge}
                      </p>
                    </div>

                    {/* Our Solution */}
                    <div className="p-4 rounded-2xl bg-brand-navy/5 border border-brand-navy/15 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-brand-orange shrink-0" />
                        <span>The MixtCast Engineering Solution</span>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {sol.solution}
                      </p>
                    </div>
                  </div>

                  {/* Key Systems Used (Chips linking to services) */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
                      Key Integrated Systems
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sol.keySystems.map((sys, idx) => (
                        <Link
                          key={idx}
                          to={`/services/${sys.serviceSlug}`}
                          className="px-3 py-1.5 rounded-lg bg-surface-warm border border-line text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
                        >
                          {sys.label} →
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Measurable Outcomes */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider block">
                      Targeted Performance Outcomes
                    </span>
                    <ul className="space-y-1.5">
                      {sol.outcomes.map((out, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-ink/90 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button to="/contact" variant="primary" size="sm">
                      Consult on this Space
                    </Button>
                  </div>
                </div>

                {/* Image (5 cols) */}
                <div className={`${isReversed ? "lg:col-span-5 lg:order-1" : "lg:col-span-5"}`}>
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-line">
                    <SolutionPhoto sol={sol} eager={index === 0} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. CTA BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-surface-warm border border-line text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Have a Complex Venue or Multi-Room Requirement?
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl mx-auto">
            Our engineering team conducts detailed on-site acoustic and electrical audits to create tailored infrastructure proposals.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="cta" size="md">
              Schedule Site Audit in Pune
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
