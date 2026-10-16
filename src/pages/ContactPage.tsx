import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { COMPANY_INFO } from "../data/company";
import { SOLUTIONS } from "../data/solutions";
import { getVisibleServices } from "../data/services";
import { submitEnquiry, honeypotResponse, EnquiryPayload } from "../lib/api";
import { Button } from "../components/ui/Button";
import { PremiumSelect } from "../components/forms/PremiumSelect";

const TIMELINE_OPTIONS = [
  { value: "Immediate (< 1 month)", label: "Immediate (< 1 month)" },
  { value: "1-3 months", label: "1 to 3 months" },
  { value: "3-6 months", label: "3 to 6 months" },
  { value: "Planning & Architectural Stage", label: "Planning & Architectural Stage" },
];

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<EnquiryPayload>({
    name: "",
    company: "",
    email: "",
    phone: "",
    city: "",
    spaceType: SOLUTIONS[0].title,
    services: [],
    timeline: "1-3 months",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    referenceId: string;
    message: string;
  } | null>(null);
  // Guards against double submission (state updates are async; a ref blocks a second click immediately).
  const sendingRef = useRef(false);
  const botcheckRef = useRef<HTMLInputElement>(null);

  const toggleService = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(title)
        ? prev.services.filter((s) => s !== title)
        : [...prev.services, title],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 8) {
      errs.phone = "Please enter a valid contact number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;
    if (!validate()) return;

    // Honeypot ticked (bots only): show success without sending anything.
    if (botcheckRef.current?.checked) {
      const res = honeypotResponse();
      setSubmitResult({ success: true, referenceId: res.reference, message: res.message });
      return;
    }

    sendingRef.current = true;
    setIsSubmitting(true);
    setSendFailed(false);
    try {
      const res = await submitEnquiry(formData, false);
      setSubmitResult({
        success: true,
        referenceId: res.reference,
        message: res.message,
      });
    } catch {
      // Keep everything the visitor entered; show the inline error with direct contact options.
      setSendFailed(true);
    } finally {
      sendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-[2px] w-4 bg-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Get in Touch
          </span>
          <span className="h-[2px] w-4 bg-brand-orange" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
          Let's Engineer Your Next AV Experience
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto">
          {COMPANY_INFO.callToAction}
        </p>
      </section>

      {/* Main Form & Information Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start lg:items-stretch">
          {/* Left: Contact Info & Map (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:flex lg:flex-col">
            <div className="p-8 rounded-3xl bg-surface-warm border border-line shadow-sm space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block">
                Direct Contact
              </span>

              <div className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-line text-brand-orange flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-muted block">Direct & Sales Emails</span>
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${COMPANY_INFO.contact.emailPrimary}`}
                          className="font-medium text-ink hover:text-brand-navy transition-colors text-xs"
                        >
                          {COMPANY_INFO.contact.emailPrimary}
                        </a>
                        <a
                          href={`mailto:${COMPANY_INFO.contact.emailSales}`}
                          className="font-medium text-ink hover:text-brand-navy transition-colors text-xs"
                        >
                          {COMPANY_INFO.contact.emailSales}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-line text-brand-navy flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-muted block">Registered Location</span>
                      <p className="font-semibold text-ink">{COMPANY_INFO.contact.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-line text-brand-orange flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-ink-muted block">Official Website</span>
                      <span className="font-medium text-ink">
                        {COMPANY_INFO.contact.website}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Shortcut */}
              <div className="pt-4 border-t border-line">
                <a
                  href={COMPANY_INFO.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] font-bold text-xs hover:bg-[#25D366] hover:text-white transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Office location map */}
            <div className="rounded-3xl overflow-hidden border border-line shadow-sm bg-surface-cool p-2 lg:flex-1 lg:flex lg:flex-col">
              <div className="aspect-16/9 w-full rounded-2xl overflow-hidden relative lg:flex-1">
                <iframe
                  title="MixtCast Visual Solutions office location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4488.039138951732!2d73.84530459999999!3d18.504031299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf99ada69e31%3A0x25aafaa3dba6828d!2sMixtcast%20Visual%20Solutions%20Pvt%20Ltd!5e1!3m2!1sen!2sin!4v1792069720824!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>
          </div>

          {/* Right: Enquiry Form with Waveform Success State (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-line shadow-md relative">
            <AnimatePresence mode="wait">
              {submitResult?.success ? (
                /* Animated Success State (Waveform morphs into checkmark) */
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                      Enquiry Received
                    </span>
                    <h3 className="text-2xl font-bold text-ink font-heading">
                      Thank You for Reaching Out
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {submitResult.message}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-warm border border-line inline-block text-xs">
                    <span className="text-ink-muted block">Tracking Reference</span>
                    <span className="font-mono font-bold text-brand-navy text-sm">
                      {submitResult.referenceId}
                    </span>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setSubmitResult(null)}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-brand-navy border border-brand-navy/30 hover:bg-brand-navy/5 transition-colors"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Enquiry Form */
                <motion.form
                  key="enquiry-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-ink font-heading">
                      Request Technical Consultation & Quote
                    </h2>
                    <p className="text-xs text-ink-muted mt-1">
                      Fill out the form below and our engineering team will get back to you with custom schematics.
                    </p>
                  </div>

                  {/* Name & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enquiry-name" className="block text-xs font-semibold text-ink mb-1.5">
                        Full Name <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="enquiry-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          errors.name
                            ? "border-red-500 focus:border-red-600 bg-red-50/20"
                            : "border-line focus:border-brand-navy focus:ring-1 focus:ring-brand-navy bg-surface-warm/40"
                        }`}
                      />
                      {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="enquiry-company" className="block text-xs font-semibold text-ink mb-1.5">
                        Company / Organization
                      </label>
                      <input
                        id="enquiry-company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-line focus:border-brand-navy focus:ring-1 focus:ring-brand-navy bg-surface-warm/40 text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enquiry-email" className="block text-xs font-semibold text-ink mb-1.5">
                        Work Email <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="enquiry-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          errors.email
                            ? "border-red-500 focus:border-red-600 bg-red-50/20"
                            : "border-line focus:border-brand-navy focus:ring-1 focus:ring-brand-navy bg-surface-warm/40"
                        }`}
                      />
                      {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="enquiry-phone" className="block text-xs font-semibold text-ink mb-1.5">
                        Contact Phone <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="enquiry-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          errors.phone
                            ? "border-red-500 focus:border-red-600 bg-red-50/20"
                            : "border-line focus:border-brand-navy focus:ring-1 focus:ring-brand-navy bg-surface-warm/40"
                        }`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* City & Space Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="enquiry-city" className="block text-xs font-semibold text-ink mb-1.5">
                        City / Location
                      </label>
                      <input
                        id="enquiry-city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-line focus:border-brand-navy bg-surface-warm/40 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label id="enquiry-space-type-label" className="block text-xs font-semibold text-ink mb-1.5">
                        Space Type
                      </label>
                      <PremiumSelect
                        labelId="enquiry-space-type-label"
                        value={formData.spaceType}
                        onChange={(spaceType) => setFormData({ ...formData, spaceType })}
                        options={SOLUTIONS.map((sol) => ({ value: sol.title, label: sol.title }))}
                      />
                    </div>
                  </div>

                  {/* Services Needed (Multi-select interactive chips) */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                      Services Needed (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getVisibleServices().map((srv) => {
                        const isSelected = formData.services.includes(srv.title);
                        return (
                          <button
                            type="button"
                            key={srv.slug}
                            onClick={() => toggleService(srv.title)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-brand-navy text-white shadow-xs"
                                : "bg-surface-warm border border-line text-ink-muted hover:border-brand-navy"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {srv.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Approximate Timeline */}
                  <div>
                    <label id="enquiry-timeline-label" className="block text-xs font-semibold text-ink mb-1.5">
                      Approximate Project Timeline
                    </label>
                    <PremiumSelect
                      labelId="enquiry-timeline-label"
                      value={formData.timeline}
                      onChange={(timeline) => setFormData({ ...formData, timeline })}
                      options={TIMELINE_OPTIONS}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Project Notes & Dimensional Details
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about room dimensions, seating capacity, existing infrastructure, or acoustic challenges..."
                      className="w-full px-4 py-2.5 rounded-xl border border-line focus:border-brand-navy bg-surface-warm/40 text-sm outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Honeypot: hidden from people and assistive tech; only bots tick it */}
                  <input
                    ref={botcheckRef}
                    type="checkbox"
                    name="botcheck"
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="off"
                    className="hidden"
                  />

                  {sendFailed && (
                    <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed">
                      We couldn't send your enquiry right now. Please try again, or reach us directly on{" "}
                      <a href={COMPANY_INFO.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                        WhatsApp
                      </a>{" "}
                      or at{" "}
                      <a href={`mailto:${COMPANY_INFO.contact.emailSales}`} className="font-semibold underline">
                        {COMPANY_INFO.contact.emailSales}
                      </a>
                      .
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
                      className="w-full"
                      icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" />}
                    >
                      {isSubmitting ? "Sending…" : "Submit Technical Enquiry"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Official Appreciation Closing Line */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-8 rounded-2xl bg-surface-warm border border-line">
          <p className="text-sm sm:text-base font-medium text-ink leading-relaxed">
            "We appreciate your time and interest in MixtCast Visual Solutions Private Limited. Let's connect to create intelligent and immersive AV experiences."
          </p>
        </div>
      </section>
    </div>
  );
};
