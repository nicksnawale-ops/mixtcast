import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  Tv,
  Building2,
  Sun,
  MonitorPlay,
  Cpu,
  Waves,
  Sparkles,
  Film,
  Home,
  Video,
  Mic,
  ArrowRight,
} from "lucide-react";
import { SERVICES, ServiceItem } from "../data/services";
import { SpotlightCard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const iconMap: Record<string, React.ReactNode> = {
  Volume2: <Volume2 className="w-6 h-6" />,
  Tv: <Tv className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Sun: <Sun className="w-6 h-6" />,
  MonitorPlay: <MonitorPlay className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Waves: <Waves className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Film: <Film className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Video: <Video className="w-6 h-6" />,
  Mic: <Mic className="w-6 h-6" />,
};

type CategoryFilter = "All" | "Audio" | "Video" | "Spaces" | "Studios";

export const ServicesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");

  const categories: CategoryFilter[] = ["All", "Audio", "Video", "Spaces", "Studios"];

  const filteredServices =
    activeFilter === "All"
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeFilter);

  return (
    <div className="space-y-16 pb-24">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-[2px] w-4 bg-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Engineering Catalog
          </span>
          <span className="h-[2px] w-4 bg-brand-orange" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
          Comprehensive Audio-Visual Capabilities
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
          Explore our complete suite of 12 specialized AV engineering disciplines, from electro-acoustics
          and projection mapping to AI speech enhancement and turnkey studio design.
        </p>

        {/* Filter Controls (Segmented Bar) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                activeFilter === cat
                  ? "bg-brand-navy text-white shadow-md shadow-brand-navy/20"
                  : "bg-surface-warm text-ink-muted hover:text-ink hover:bg-surface-cool border border-line"
              }`}
            >
              {cat} {cat === "All" ? `(${SERVICES.length})` : ""}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid Services List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/services/${service.slug}`} className="block h-full group">
                  <SpotlightCard className="h-full p-8 flex flex-col justify-between hover:border-brand-orange/40 bg-white">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-surface-cool text-brand-navy flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300 shadow-xs">
                          {iconMap[service.icon] || <Volume2 className="w-6 h-6" />}
                        </div>
                        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                          {service.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-ink font-heading group-hover:text-brand-navy transition-colors mb-3">
                        {service.title}
                      </h3>

                      <p className="text-sm text-ink-muted leading-relaxed line-clamp-3 mb-6">
                        {service.overview}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-line/60">
                        <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider block">
                          Key Deliverable Focus
                        </span>
                        <p className="text-xs text-ink/80 truncate">
                          • {service.deliverables[0]}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-bold text-brand-orange group-hover:translate-x-1 transition-transform">
                      <span>View Specifications & Applications</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-10 rounded-3xl bg-surface-warm border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-ink font-heading">
              Need Multi-Disciplinary AV Integration?
            </h3>
            <p className="text-xs text-ink-muted">
              We package audio, video, lighting, and automation into coordinated turnkey contracts.
            </p>
          </div>
          <Button to="/contact" variant="primary" size="md">
            Request Proposal
          </Button>
        </div>
      </section>
    </div>
  );
};
