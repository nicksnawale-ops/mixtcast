import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, MessageSquare, Menu, X, ArrowUpRight } from "lucide-react";
import { LogoHorizontal } from "../brand/Logo";
import { MAIN_NAV_LINKS } from "../../data/navigation";
import { COMPANY_INFO } from "../../data/company";
import { Button } from "../ui/Button";

// Header logo icon sizes. The mark's viewBox is 2:1, so these 2:1 boxes show the artwork at full size
// (≈32 / 36 / 40 / 44px tall boxes; 30 / 32 / 34px when the header shrinks on scroll). The negative right margin
// (10% of the width) trims the artwork's transparent edge so the visible gap to the wordmark stays ~10px.
// Boxes taller than the logo row simply overflow it, so the header height is unchanged.
const LOGO_MARK =
  "shrink-0 transition-all duration-300 w-16 h-8 -mr-[6.4px] md:w-[72px] md:h-9 md:-mr-[7.2px] lg:w-20 lg:h-10 lg:-mr-2 xl:w-[88px] xl:h-11 xl:-mr-[8.8px]";
const LOGO_MARK_SCROLLED =
  "shrink-0 transition-all duration-300 w-[60px] h-[30px] -mr-1.5 md:w-16 md:h-8 md:-mr-[6.4px] lg:w-[68px] lg:h-[34px] lg:-mr-[6.8px]";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-line py-3"
            : "bg-white/60 backdrop-blur-sm border-b border-line/60 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar 3-Zone Contract: [Brand Wordmark] — [Nav Links] — [1 Primary Action] */}
          <div className="flex items-center justify-between gap-8">
            {/* Zone 1: Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy rounded-lg"
              aria-label="MIXTCAST Visual Solutions Homepage"
            >
              <LogoHorizontal className={isScrolled ? "h-8" : "h-9"} markClassName={isScrolled ? LOGO_MARK_SCROLLED : LOGO_MARK} />
            </Link>

            {/* Zone 2: Concise Single-line Nav Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink">
              {MAIN_NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative whitespace-nowrap shrink-0 transition-colors py-1 group ${
                      isActive ? "text-brand-navy font-semibold" : "text-ink hover:text-brand-orange"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive ? (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-orange rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    ) : (
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-orange/60 transition-all duration-200 group-hover:w-full rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Zone 3: 1 Primary Action + Mobile Hamburger */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:block">
                <Button to="/contact" variant="primary" size="sm">
                  Get a Consultation
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-ink hover:text-brand-navy hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-30 lg:hidden bg-white/95 backdrop-blur-xl pt-24 px-6 pb-12 flex flex-col justify-between overflow-y-auto"
          >
            <div className="flex flex-col space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-2">
                Navigation
              </span>
              {MAIN_NAV_LINKS.map((link, idx) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      to={link.path}
                      className={`block py-2 text-2xl font-heading font-semibold transition-colors ${
                        isActive ? "text-brand-orange" : "text-ink hover:text-brand-navy"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile Contact Shortcuts */}
            <div className="mt-8 pt-6 border-t border-line space-y-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Direct Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`tel:${COMPANY_INFO.contact.phoneRaw}`}
                  className="flex items-center gap-2 p-3 rounded-xl bg-surface-warm border border-line text-xs font-semibold text-ink hover:border-brand-navy"
                >
                  <Phone className="w-4 h-4 text-brand-navy" />
                  <span>Call {COMPANY_INFO.contact.phone}</span>
                </a>
                <a
                  href={`mailto:${COMPANY_INFO.contact.emailSales}`}
                  className="flex items-center gap-2 p-3 rounded-xl bg-surface-warm border border-line text-xs font-semibold text-ink hover:border-brand-navy"
                >
                  <Mail className="w-4 h-4 text-brand-orange" />
                  <span>Email Sales Team</span>
                </a>
                <a
                  href={COMPANY_INFO.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
              <div className="pt-2">
                <Button to="/contact" variant="cta" size="md" className="w-full">
                  Get a Consultation
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
