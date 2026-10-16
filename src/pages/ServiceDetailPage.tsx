import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, ArrowLeft, Building2, Sparkles, Sliders } from "lucide-react";
import { getVisibleServices } from "../data/services";
import { SOLUTIONS } from "../data/solutions";
import { Button } from "../components/ui/Button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { WaveformDivider } from "../components/ui/WaveformDivider";

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const visibleServices = getVisibleServices();
  const service = visibleServices.find((s) => s.slug === slug);

  // Unknown or hidden service: back to the list (history entry replaced).
  if (!service) {
    return <Navigate to="/services" replace />;
  }

  // Find related services in same or complementary category
  const relatedServices = visibleServices.filter(
    (s) => s.slug !== service.slug && (s.category === service.category || s.category === "Spaces")
  ).slice(0, 3);

  // Find matching solutions / spaces
  const relatedSolutions = SOLUTIONS.filter((sol) =>
    sol.keySystems.some((sys) => sys.serviceSlug === service.slug)
  );

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Breadcrumbs & Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-ink-muted mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-navy transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/services" className="hover:text-brand-navy transition-colors">
            Services
          </Link>
          <span>/</span>
          <span className="text-brand-orange font-semibold">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="h-[2px] w-4 bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Specialized Discipline · {service.category}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-ink font-heading tracking-tight leading-tight">
              {service.title}
            </h1>

            <p className="text-lg text-ink-muted leading-relaxed">
              {service.shortLine}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button to="/contact" variant="cta" size="md">
                Inquire About This Service
              </Button>
              <Button to="/services" variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
                Back to All Services
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-line">
              <ImageWithFallback
                src={service.photo}
                srcSet={`${service.photo.replace(".webp", "-800.webp")} 800w, ${service.photo} 1400w`}
                sizes="(min-width: 1024px) 480px, calc(100vw - 2rem)"
                width={1400}
                height={1050}
                alt={service.photoAlt}
                fallbackTitle={service.title}
                category={service.category}
                aspectRatioClass="aspect-4/3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Engineering Deliverables */}
      <section className="bg-surface-warm py-20 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Overview Left */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
                Technical Scope
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading leading-tight">
                Engineering Approach & Standards
              </h2>
              <p className="text-base text-ink-muted leading-relaxed">
                {service.overview}
              </p>

              {service.accentQuote && (
                <div className="p-5 rounded-2xl bg-white border border-line shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange block mb-1">
                    Design Benchmark
                  </span>
                  <p className="text-sm font-semibold text-brand-navy italic">
                    "{service.accentQuote}"
                  </p>
                </div>
              )}
            </div>

            {/* Deliverables Right */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-line shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-navy block mb-1">
                  Deliverables
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-ink font-heading">
                  What We Deliver
                </h3>
              </div>

              <div className="space-y-4">
                {service.deliverables.map((item, index) => (
                  <div key={index} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-ink leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal Applications & Spaces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              Applications
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
              Ideal Environments & Sectors
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.idealFor.map((app, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-cool border border-line shadow-xs space-y-2 hover:border-brand-navy/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                  0{idx + 1}
                </div>
                <h4 className="text-base font-bold text-ink font-heading">{app}</h4>
                <p className="text-xs text-ink-muted">
                  Custom audio and hardware configuration calibrated for this specific space type.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Spaces (if any) */}
      {relatedSolutions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-surface-warm border border-line space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1">
                Integrated Systems
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-ink font-heading">
                Spaces Powered By {service.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedSolutions.map((sol) => (
                <Link
                  key={sol.id}
                  to="/solutions"
                  className="p-5 rounded-2xl bg-white border border-line hover:border-brand-orange transition-colors flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-base font-bold text-ink font-heading group-hover:text-brand-navy transition-colors">
                      {sol.title}
                    </h4>
                    <p className="text-xs text-ink-muted mt-1">{sol.tagline}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-orange shrink-0 group-hover:translate-x-1 transition-transform ml-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Complementary Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-ink font-heading">
              Complementary AV Engineering Disciplines
            </h3>
            <Link to="/services" className="text-xs font-bold text-brand-orange hover:underline">
              View All Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedServices.map((rel) => (
              <Link
                key={rel.slug}
                to={`/services/${rel.slug}`}
                className="p-6 rounded-2xl bg-white border border-line hover:border-brand-navy transition-all shadow-xs block group"
              >
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
                  {rel.category}
                </span>
                <h4 className="text-base font-bold text-ink font-heading group-hover:text-brand-navy transition-colors mb-2">
                  {rel.title}
                </h4>
                <p className="text-xs text-ink-muted line-clamp-2">{rel.shortLine}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                  <span>Explore specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-signature text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold font-heading">
              Implement {service.title} with MixtCast
            </h3>
            <p className="text-xs text-white/80 max-w-lg">
              Contact our engineering consultants in Pune for architectural blueprints, audio system modeling, and equipment specs.
            </p>
          </div>
          <Button to="/contact" variant="cta" size="lg" className="!bg-white !text-brand-navy font-semibold hover:!bg-brand-navy hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2">
            Get Technical Estimate
          </Button>
        </div>
      </section>
    </div>
  );
};
