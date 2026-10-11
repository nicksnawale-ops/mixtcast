import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cpu, Users, Headphones, ArrowRight, UserCheck } from "lucide-react";
import { COMPANY_INFO } from "../data/company";
import { IMAGES } from "../data/images";
import { Button } from "../components/ui/Button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { WaveformDivider } from "../components/ui/WaveformDivider";

const coreValueIcons: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-brand-navy" />,
  Cpu: <Cpu className="w-6 h-6 text-brand-orange" />,
  Users: <Users className="w-6 h-6 text-brand-navy" />,
  Headphones: <Headphones className="w-6 h-6 text-brand-orange" />,
};

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. HERO SECTION WITH CINEMA LETTERBOX FRAME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[2px] w-4 bg-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Corporate Profile
            </span>
            <span className="h-[2px] w-4 bg-brand-orange" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
            Pioneering the Future of Audio-Visual Integration
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
            MixtCast Visual Solutions Private Limited is a specialized AV engineering firm based in
            Pune, delivering high-performance acoustic, projection, and automation installations.
          </p>
        </div>

        {/* Cinematic Letterbox Auditorium Image Frame */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-line">
          <ImageWithFallback
            src={IMAGES.spaces.auditorium}
            alt="Auditorium Engineering by MixtCast Visual Solutions"
            fallbackTitle="Tiered Commercial Auditorium & Cinema Engineering"
            category="Master Installation"
            aspectRatioClass="aspect-21/9"
            cinemaFrame={true}
          />
        </div>
      </section>

      {/* 2. COMPANY STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
              Our Journey & Ethos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading leading-tight">
              Engineering with Passion, Precision & Purpose
            </h2>
            <div className="p-4 rounded-2xl bg-surface-warm border border-line">
              <span className="text-xs font-bold text-brand-navy block mb-1">
                Headquarters
              </span>
              <p className="text-xs text-ink-muted">
                Pune, Maharashtra, India. Delivering turnkey installations across nationwide academic,
                defence, and commercial venues.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-base text-ink-muted leading-relaxed">
            <p className="text-lg text-ink font-medium leading-relaxed">
              {COMPANY_INFO.aboutParagraphs[1]}
            </p>
            <p>
              {COMPANY_INFO.aboutParagraphs[2]}
            </p>
          </div>
        </div>
      </section>

      {/* 3. VISION & MISSION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-surface-warm border border-line shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-navy/10 text-brand-navy flex items-center justify-center font-heading font-extrabold text-lg mb-6">
                V
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-navy block mb-2">
                Our Vision
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-ink font-heading mb-4 leading-snug">
                Transforming Human Experience Through Sound & Sight
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                "{COMPANY_INFO.vision}"
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-line/60 flex items-center gap-1 opacity-60">
              <span className="h-1.5 w-1 bg-brand-navy rounded-full" />
              <span className="h-3 w-1 bg-brand-navy rounded-full" />
              <span className="h-1.5 w-1 bg-brand-navy rounded-full" />
            </div>
          </div>

          {/* Mission Card (Gradient Accent Border) */}
          <div className="p-[2px] rounded-3xl bg-gradient-signature shadow-md">
            <div className="p-8 sm:p-10 rounded-[22px] bg-white h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-heading font-extrabold text-lg mb-6">
                  M
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
                  Our Mission
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-ink font-heading mb-4 leading-snug">
                  Intelligent, Reliable, and Future-Ready Integration
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  "{COMPANY_INFO.mission}"
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-line/60 flex items-center gap-1 opacity-60">
                <span className="h-1.5 w-1 bg-brand-orange rounded-full" />
                <span className="h-3 w-1 bg-brand-orange rounded-full" />
                <span className="h-1.5 w-1 bg-brand-orange rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE VALUES */}
      <section className="bg-surface-cool py-20 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
              Our Core Values
            </h2>
            <p className="mt-3 text-base text-ink-muted">
              Four pillars that govern every architectural schematic, cable termination, and handover.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPANY_INFO.coreValues.map((val) => (
              <div
                key={val.id}
                className="p-6 rounded-2xl bg-white border border-line shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-warm flex items-center justify-center mb-4">
                    {coreValueIcons[val.icon]}
                  </div>
                  <h3 className="text-lg font-bold text-ink font-heading mb-2">
                    {val.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LEADERSHIP PROFILE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              Leadership
            </span>
            <h2 className="text-3xl font-bold text-ink font-heading">
              Executive Direction
            </h2>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-surface-warm border border-line shadow-sm flex flex-col sm:flex-row items-center gap-8">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-orange/30 shadow-md relative bg-white flex items-center justify-center">
              {/* Photo slot / placeholder */}
              <div className="flex flex-col items-center justify-center text-center p-3">
                <UserCheck className="w-12 h-12 text-brand-navy mb-1" />
                <span className="text-[10px] font-bold text-ink-muted uppercase">
                  Photo Slot
                </span>
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-2xl font-bold text-ink font-heading">
                  {COMPANY_INFO.leadership[0].name}
                </h3>
                <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider block">
                  {COMPANY_INFO.leadership[0].designation}
                </span>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                {COMPANY_INFO.leadership[0].bio}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-ink">
                <a
                  href={`mailto:${COMPANY_INFO.contact.emailPrimary}`}
                  className="text-brand-navy hover:text-brand-orange transition-colors"
                >
                  {COMPANY_INFO.contact.emailPrimary}
                </a>
                <span>·</span>
                <a
                  href={`tel:${COMPANY_INFO.contact.phoneRaw}`}
                  className="text-brand-navy hover:text-brand-orange transition-colors"
                >
                  {COMPANY_INFO.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-surface-cool border border-line text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Ready to Plan Your Next AV Installation?
          </h3>
          <p className="text-sm text-ink-muted max-w-xl mx-auto">
            Our engineers provide complete consultative blueprints, acoustic simulations, and hardware specifications.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="cta" size="md">
              Book a Technical Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
