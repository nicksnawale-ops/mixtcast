import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
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
import { TECHNOLOGY_PARTNERS } from "../data/partners";
import { Button } from "../components/ui/Button";
import { WaveformCanvas } from "../components/animations/WaveformCanvas";
import { Marquee } from "../components/animations/Marquee";
import { WhoWeAreSection } from "../components/home/who-we-are/WhoWeAreSection";
import { HeroSheetStack, RisingSheet, StackedHero } from "../components/home/who-we-are/StackingSheet";
import { ServicesConsoleSection } from "../components/home/services-console/ServicesConsoleSection";
import { ProcessSignalSection } from "../components/home/process-signal/ProcessSignalSection";
import { PatchInTransition } from "../components/home/patch-in/PatchInTransition";
import { SurveyScanTransition } from "../components/home/survey-scan/SurveyScanTransition";
import { WhyMixtcastSection } from "../components/home/why-eq/WhyMixtcastSection";
import { SpacesPortalSection } from "../components/home/spaces-portal/SpacesPortalSection";
import { PremiereQuoteSection } from "../components/home/premiere/PremiereQuoteSection";
import { TestimonialsSection } from "../components/home/testimonials/TestimonialsSection";
import { ClientCreditsSection } from "../components/home/client-credits/ClientCreditsSection";
import { FEATURES } from "../config/features";

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
      {/* 1–2. HERO, then WHO WE ARE rising over it as a sheet (the Hero is pinned and recedes; content unchanged) */}
      <HeroSheetStack>
      <StackedHero>
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
              We Provide The Best Services
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
            Empowering <br className="hidden sm:inline" />
            Digital <span className="text-brand-orange">Transformation</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-ink-muted max-w-[44rem] mx-auto font-normal leading-relaxed"
            style={{ textWrap: "balance" }}
          >
            Mixtcast Visual Solution Pvt. Ltd. provides end-to-end Audio Visual, Networking, Security, and IT
            Infrastructure solutions tailored to modern businesses, educational institutions, healthcare facilities,
            and enterprises.
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
      </StackedHero>

      {/* 2. INTRO / WHO WE ARE — Converge & Take Shape */}
      <RisingSheet>
        <WhoWeAreSection />
      </RisingSheet>
      </HeroSheetStack>

      {/* 3. SERVICES PREVIEW — "The Mixing Console": channel-strip cards over a signal-routing matrix,
          patched in from Who We Are ("Patch In" transition: a cable plugs into the console and powers it on) */}
      <PatchInTransition>
        <ServicesConsoleSection iconFor={(name) => iconMap[name] || <Volume2 className="w-5 h-5" />} />
      </PatchInTransition>

      {/* 4. SPACES WE TRANSFORM — "Room Portals": proscenium-framed photos with floor plans, entered through a
          light "Proscenium" header transition */}
      <SpacesPortalSection />

      {/* 5. OUR PROCESS — "From Silence to Signal": scroll-driven signal-chain story, entered through the
          "Site Survey Scan" transition (a survey beam reveals its blueprint grid and hands over to the waveform) */}
      <SurveyScanTransition>
        <ProcessSignalSection />
      </SurveyScanTransition>

      {/* 6. WHY CHOOSE MIXTCAST — "The Five-Band EQ": the reasons as console faders, with a classic hairline entrance */}
      <WhyMixtcastSection />

      {/* 8. TRUSTED BY — "Closing Credits": client names and categories set like film end credits */}
      <ClientCreditsSection />

      {/* CLIENT VOICES — testimonials (verbatim from data/testimonials.ts). Hidden via FEATURES.showTestimonials;
          when off it isn't mounted at all, so Client Trust and the partners band keep a single section gap. */}
      {FEATURES.showTestimonials && <TestimonialsSection />}

      {/* 9. TECHNOLOGY PARTNERS (MARQUEE) */}
      <section className="bg-surface-warm py-16 border-y border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1">
            Global Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Technology Partners
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

      {/* 10. PHILOSOPHY QUOTE — "The Premiere": a cinematic title card revealed by a projector beam */}
      <PremiereQuoteSection />

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
