import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Sliders,
  Award,
  Clock,
  Layers,
  LifeBuoy,
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
  ShieldCheck,
  Users,
  Compass,
} from "lucide-react";

import { COMPANY_INFO } from "../data/company";
import { SERVICES } from "../data/services";
import { SOLUTIONS } from "../data/solutions";
import { CLIENT_PROJECTS } from "../data/clients";
import { TECHNOLOGY_PARTNERS } from "../data/partners";
import { Button } from "../components/ui/Button";
import { SpotlightCard } from "../components/ui/Card";
import { WaveformDivider } from "../components/ui/WaveformDivider";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { WaveformCanvas } from "../components/animations/WaveformCanvas";
import { Marquee } from "../components/animations/Marquee";
import { CountUp } from "../components/animations/CountUp";
import { WhoWeAreSection } from "../components/home/who-we-are/WhoWeAreSection";

// Icon mapping helper
const iconMap: Record<string, React.ReactNode> = {
  Volume2: <Volume2 className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
  MonitorPlay: <MonitorPlay className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Waves: <Waves className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Film: <Film className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  Mic: <Mic className="w-5 h-5" />,
  Sliders: <Sliders className="w-6 h-6 text-brand-orange" />,
  Award: <Award className="w-6 h-6 text-brand-navy" />,
  Clock: <Clock className="w-6 h-6 text-brand-orange" />,
  Layers: <Layers className="w-6 h-6 text-brand-navy" />,
};

const PartnerMarqueeCard: React.FC<{ partner: (typeof TECHNOLOGY_PARTNERS)[number] }> = ({ partner }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="mx-4 px-6 py-4 rounded-xl bg-white border border-line shadow-xs flex items-center justify-center group hover:border-brand-navy hover:shadow-md transition-all cursor-default min-h-[72px]">
      {!imgError && partner.logo ? (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`h-9 w-auto max-w-[140px] object-contain transition-transform duration-200 group-hover:scale-105${partner.logoBg === "dark" ? " bg-black rounded-[10px] p-1.5" : ""}`}
          />
          <span className="text-[10px] text-ink-muted uppercase tracking-wider block mt-1.5 whitespace-nowrap">
            {partner.category}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-cool text-brand-navy group-hover:bg-brand-navy group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0">
            {partner.name.charAt(0)}
          </div>
          <div className="text-left">
            <span className="font-heading font-bold text-sm text-ink group-hover:text-brand-navy transition-colors block whitespace-nowrap">
              {partner.name}
            </span>
            <span className="text-[10px] text-ink-muted uppercase tracking-wider block">
              {partner.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        {/* Interactive canvas audio waveform background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <WaveformCanvas lineCount={64} interactive={true} />
        </div>

        {/* Soft Anamorphic Light Streak */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="w-[180%] h-32 bg-gradient-to-r from-transparent via-brand-navy/10 to-brand-orange/15 blur-3xl animate-anamorphic" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="h-[2px] w-6 bg-brand-orange rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange font-heading">
              AUDIO • VIDEO • INTEGRATION
            </span>
            <span className="h-[2px] w-6 bg-brand-orange rounded-full" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink font-heading tracking-tight leading-[1.1] max-w-4xl mx-auto"
            style={{ textWrap: "balance" }}
          >
            Where Expertise <br className="hidden sm:inline" />
            Meets <span className="text-brand-orange">Innovation</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto font-normal leading-relaxed"
          >
            We design and deliver world-class AV environments — from auditoriums and theatres to
            boardrooms and classrooms.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button to="/solutions" variant="cta" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Explore Our Solutions
            </Button>
            <Button to="/contact" variant="secondary" size="lg">
              Talk to an Expert
            </Button>
          </motion.div>

          {/* Scroll Cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex flex-col items-center justify-center gap-2 text-ink-muted/70"
          >
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-[2px] bg-brand-orange rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="h-3 w-[2px] bg-brand-navy rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="h-4.5 w-[2px] bg-brand-orange rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="h-3 w-[2px] bg-brand-navy rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-[2px] bg-brand-orange rounded-full animate-bounce [animation-delay:0ms]" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
          </motion.div>
        </div>
      </section>

      {/* 2. INTRO / WHO WE ARE — Sound + Vision, blended and projected */}
      <WhoWeAreSection />

      {/* 3. SERVICES PREVIEW (BENTO GRID - 12 SERVICES) */}
      <section className="bg-surface-warm py-20 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
                End-to-End Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
                Specialized Audio-Visual Services
              </h2>
            </div>
            <Button to="/services" variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All 12 Services
            </Button>
          </div>

          {/* Animated Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => {
              const isMarqueeItem = index === 0 || index === 2 || index === 7;
              return (
                <Link key={service.slug} to={`/services/${service.slug}`} className="group block h-full">
                  <SpotlightCard
                    className={`h-full p-6 flex flex-col justify-between transition-all duration-300 ${
                      isMarqueeItem ? "bg-white border-brand-navy/15 shadow-sm" : "bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-cool text-brand-navy flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors duration-300">
                          {iconMap[service.icon] || <Volume2 className="w-5 h-5" />}
                        </div>
                        <span className="text-[11px] font-semibold text-ink-muted">
                          {service.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-ink group-hover:text-brand-navy font-heading transition-colors mb-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
                        {service.shortLine}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brand-orange group-hover:translate-x-1 transition-transform">
                      <span>Explore details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </SpotlightCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SPACES WE TRANSFORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
            Environments
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
            Spaces We Transform
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Engineered architectural acoustic and visual integrations tailored for specific room dynamics.
          </p>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SOLUTIONS.slice(0, 6).map((sol) => (
            <div
              key={sol.id}
              className="group rounded-2xl overflow-hidden bg-white border border-line shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="overflow-hidden aspect-video relative">
                <ImageWithFallback
                  src={sol.image}
                  alt={sol.title}
                  fallbackTitle={sol.title}
                  category="Architecture & Acoustics"
                  className="group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-brand-navy uppercase tracking-wider">
                  Verified Space
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-ink font-heading group-hover:text-brand-orange transition-colors">
                    {sol.title}
                  </h3>
                  <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                    {sol.tagline}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to={`/solutions#${sol.slug}`}
                    className="text-xs font-bold text-brand-navy hover:text-brand-orange transition-colors inline-flex items-center gap-1"
                  >
                    <span>View Architecture Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. OUR PROCESS (WAVEFORM TIMELINE) */}
      <section className="bg-surface-cool py-20 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
              Our 5-Stage Engineering Process
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              From the initial acoustic survey to long-term preventative care, we uphold rigorous quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {COMPANY_INFO.process.map((stage) => (
              <div
                key={stage.step}
                className="relative bg-white p-6 rounded-2xl border border-line shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-brand-navy text-white font-heading font-bold text-sm flex items-center justify-center mb-4">
                    0{stage.step}
                  </div>
                  <h3 className="text-base font-bold text-ink font-heading mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-line/60 flex items-center gap-1 opacity-40">
                  <span className="w-1 h-2 bg-brand-orange rounded-full" />
                  <span className="w-1 h-4 bg-brand-navy rounded-full" />
                  <span className="w-1 h-2 bg-brand-orange rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE MIXTCAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
            Why MixtCast
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
            Engineered For Absolute Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {COMPANY_INFO.whyChooseUs.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-surface-warm border border-line shadow-xs flex flex-col justify-between hover:border-brand-navy/30 transition-colors"
            >
              <div>
                <div className="mb-4">
                  {iconMap[item.icon] || <CheckCircle2 className="w-6 h-6 text-brand-orange" />}
                </div>
                <h3 className="text-base font-bold text-ink font-heading mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. STATS BAND (COUNT-UP WITH TODO PLACEHOLDERS MARKED) */}
      <section className="bg-brand-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {COMPANY_INFO.stats.map((stat) => (
              <div key={stat.id} className="pt-6 lg:pt-0 lg:px-6 flex flex-col items-center">
                <div className="text-4xl sm:text-5xl font-extrabold font-heading text-brand-orange mb-2">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <span className="text-sm font-medium text-white/90 max-w-xs block">
                  {stat.label}
                </span>
                {!stat.isConfirmed && (
                  <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                    [{stat.note}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRUSTED BY (CLIENTS SHOWCASE & MARQUEE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
            Client Trust
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
            Trusted by Prestigious Organizations
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Delivering mission-critical audio-visual installations across premier defense, institutional, and commercial leaders.
          </p>
        </div>

        {/* Client Showcase Wall */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CLIENT_PROJECTS.map((client) => (
            <div
              key={client.id}
              className="p-6 rounded-2xl bg-surface-warm border border-line shadow-xs flex flex-col justify-between hover:border-brand-orange/40 transition-colors"
            >
              <div>
                <span className="text-[11px] font-semibold text-brand-navy block mb-1">
                  {client.category}
                </span>
                <h3 className="text-lg font-bold text-ink font-heading">
                  {client.name}
                </h3>
                <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                  {client.descriptionPlaceholder}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted">
                <span>{client.city}</span>
                <span className="text-[10px] uppercase font-bold text-brand-orange">
                  Client Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. TECHNOLOGY PARTNERS (MARQUEE) */}
      <section className="bg-surface-warm py-16 border-y border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1">
            Global Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Certified Technology Partners
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            We engineer with globally trusted, broadcast-tier hardware manufacturers.
          </p>
        </div>

        {/* Infinite Marquee */}
        <Marquee speed="normal" pauseOnHover={true}>
          {TECHNOLOGY_PARTNERS.map((partner) => (
            <PartnerMarqueeCard key={partner.id} partner={partner} />
          ))}
        </Marquee>
      </section>

      {/* 10. PHILOSOPHY QUOTE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        <div className="relative p-12 sm:p-16 rounded-3xl bg-surface-warm border border-line shadow-sm overflow-hidden">
          {/* Subtle light sweep */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-anamorphic" />

          <WaveformDivider variant="subtle" className="mb-6" />

          <blockquote className="text-2xl sm:text-4xl font-extrabold text-ink font-heading tracking-tight leading-tight">
            "{COMPANY_INFO.philosophy}"
          </blockquote>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] font-bold text-brand-orange">
            MIXTCAST VISUAL SOLUTIONS PVT. LTD.
          </p>
        </div>
      </section>

      {/* 11. CTA BAND (SIGNATURE GRADIENT BACKGROUND) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl p-10 sm:p-16 bg-gradient-signature text-white shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full bg-brand-orange/30 blur-3xl" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange-soft">
              Start Your AV Transformation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading leading-tight">
              {COMPANY_INFO.callToAction}
            </h2>
            <p className="text-sm text-white/80">
              Schedule a technical discovery session with our principal engineers in Pune.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Button
              to="/contact"
              variant="cta"
              size="lg"
              className="group !bg-white !text-[#0E3B8C] font-semibold hover:!bg-surface-warm hover:!text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 focus-visible:!text-[#0E3B8C] shadow-xl"
              icon={<ArrowRight className="w-4 h-4 text-[#0E3B8C] group-hover:text-brand-orange transition-colors" />}
            >
              Get a Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
