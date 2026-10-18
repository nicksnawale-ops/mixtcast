import React, { useState } from "react";
import { TECHNOLOGY_PARTNERS, PartnerItem } from "../data/partners";
import { Button } from "../components/ui/Button";
import { ShieldCheck, ArrowRight } from "lucide-react";

type PartnerFilter = "All" | "Audio" | "Video" | "Control System" | "Microphones" | "AV Accessories";

const PartnerGridCard: React.FC<{ partner: PartnerItem }> = ({ partner }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="p-8 rounded-3xl bg-white border border-line shadow-xs hover:shadow-xl hover:border-brand-navy/30 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-6 min-h-[44px]">
          {!imgError && partner.logo ? (
            <div className="h-10 flex items-center">
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                loading="lazy"
                onError={() => setImgError(true)}
                className={`h-10 w-auto max-w-[140px] object-contain transition-transform group-hover:scale-105${partner.logoBg === "dark" ? " bg-black rounded-[10px] p-1.5" : ""}`}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-surface-cool text-brand-navy group-hover:bg-brand-navy group-hover:text-white flex items-center justify-center font-heading font-extrabold text-lg transition-colors">
              {partner.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            {partner.category}
          </span>
        </div>

        <h3 className="text-2xl font-extrabold text-ink font-heading group-hover:text-brand-orange transition-colors mb-2">
          {partner.name}
        </h3>

        <p className="text-xs text-ink-muted leading-relaxed">
          {partner.specialty}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-muted font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized Integration</span>
        </span>
      </div>
    </div>
  );
};

export const PartnersPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<PartnerFilter>("All");

  const categories: PartnerFilter[] = [
    "All",
    "Audio",
    "Video",
    "Control System",
    "Microphones",
    "AV Accessories",
  ];

  const filteredPartners =
    activeFilter === "All"
      ? TECHNOLOGY_PARTNERS
      : TECHNOLOGY_PARTNERS.filter((p) => p.category === activeFilter);

  return (
    <div className="space-y-16 pb-24">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-[2px] w-4 bg-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Hardware Ecosystem
          </span>
          <span className="h-[2px] w-4 bg-brand-orange" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
          Global Technology Partners
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
          We work with globally trusted technology brands to deliver reliable, high-performance AV
          systems.
        </p>

        {/* Filter Bar */}
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
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Partners Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <PartnerGridCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      {/* Integration Philosophy */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-warm border border-line text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
            Vendor Independence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Objective Engineering Without Brand Bias
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed max-w-2xl mx-auto">
            While we partner with tier-1 global hardware leaders, our design recommendations are always
            derived strictly from the physics of sound, room ergonomics, and your functional requirements.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="primary" size="md">
              Discuss Equipment Selection
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
