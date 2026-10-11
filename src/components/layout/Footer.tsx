import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Globe, ArrowUpRight } from "lucide-react";
import { LogoHorizontal } from "../brand/Logo";
import { COMPANY_INFO } from "../../data/company";
import { SERVICES } from "../../data/services";
import { FOOTER_QUICK_LINKS } from "../../data/navigation";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface-warm border-t border-line overflow-hidden pt-20 pb-12 select-none">
      {/* Large Faded MIXTCAST Wordmark Watermark */}
      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-[14vw] font-heading font-extrabold text-brand-navy/[0.03] tracking-tighter whitespace-nowrap select-none"
        aria-hidden="true"
      >
        MIXTCAST
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-line">
          {/* Column 1: Brand & Philosophy (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <LogoHorizontal className="h-10" />
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed max-w-sm">
              {COMPANY_INFO.shortDescription}
            </p>
            <div className="p-4 rounded-xl bg-white border border-line shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block mb-1">
                Our Philosophy
              </span>
              <p className="text-sm font-semibold text-brand-navy italic">
                "{COMPANY_INFO.philosophy}"
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-ink-muted hover:text-brand-orange transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Featured Services (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Specialized Services
            </h4>
            <ul className="space-y-2 text-sm">
              {SERVICES.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="text-ink-muted hover:text-brand-navy transition-colors truncate block"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="text-xs font-semibold text-brand-orange hover:underline inline-block pt-1"
                >
                  View All 12 Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Contact & Location
            </h4>
            <div className="space-y-3 text-sm text-ink-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-ink block">
                    {COMPANY_INFO.contact.city}, {COMPANY_INFO.contact.state}
                  </span>
                  <span className="text-xs text-ink-muted/80">{COMPANY_INFO.contact.country}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-navy shrink-0" />
                <a
                  href={`tel:${COMPANY_INFO.contact.phoneRaw}`}
                  className="hover:text-brand-orange transition-colors font-medium"
                >
                  {COMPANY_INFO.contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.contact.emailSales}`}
                  className="hover:text-brand-navy transition-colors"
                >
                  {COMPANY_INFO.contact.emailSales}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-brand-navy shrink-0" />
                <span className="text-ink-muted">{COMPANY_INFO.contact.website}</span>
              </div>
            </div>

            {/* Social Icons Placeholders */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-ink-muted block mb-2">
                Connect With Us
              </span>
              <div className="flex items-center gap-2">
                {["LinkedIn", "YouTube", "Instagram"].map((platform) => (
                  <span
                    key={platform}
                    className="px-2.5 py-1 rounded-md bg-white border border-line text-xs font-medium text-ink-muted cursor-pointer hover:border-brand-orange hover:text-brand-navy transition-colors"
                    title={`${platform} - [TODO: confirm official handle]`}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <p>© {currentYear} {COMPANY_INFO.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-ink cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-ink cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="text-brand-orange font-medium">Pune, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
