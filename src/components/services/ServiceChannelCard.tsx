import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useSpring } from "motion/react";
import type { ServiceItem } from "../../data/services";
import { SVC } from "./servicesConsoleStyles";

/**
 * Services page channel strip — the Home console card language (its `mc-*` state classes come from the Home
 * CONSOLE_CSS, imported read-only) with the Services content: overview, the "Key Deliverable Focus" readout and the
 * specifications CTA. The whole card is one link. Channel numbers are fixed by the service's order in the full list.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_TILT = 4;
const LIFT = -6;
const SPRING = { stiffness: 260, damping: 26 };
const SEGMENTS = 8;
const CHECK_MS = 400;
const LIVE: Record<number, { ld: number; lo: number }> = { 4: { ld: 760, lo: 120 }, 5: { ld: 520, lo: 40 }, 6: { ld: 380, lo: 0 }, 7: { ld: 290, lo: 60 } };
const segmentColor = (i: number) => {
  const t = i / (SEGMENTS - 1);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(14, 255)}, ${mix(59, 90)}, ${mix(140, 31)})`;
};
const CATEGORY_DOT: Record<ServiceItem["category"], string> = {
  Audio: "#FF5A1F",
  Video: "#0E3B8C",
  Spaces: "#5B6470",
  Studios: "linear-gradient(135deg, #0E3B8C, #FF5A1F)",
  "IT Infrastructure": "#1F2328",
  "Safety & Security": "#B83D0B",
};
const smallPhoto = (photo: string) => photo.replace(/\.webp$/, "-800.webp");

interface Props {
  service: ServiceItem;
  /** Position in the visible services list (fixed channel number). */
  channel: number;
  icon: React.ReactNode;
  canHover: boolean;
  reduced: boolean;
  claimDelay: () => number;
  onActivate?: (el: HTMLElement) => void;
}

export const ServiceChannelCard: React.FC<Props> = ({ service, channel, icon, canHover, reduced, claimDelay, onActivate }) => {
  const num = String(channel).padStart(2, "0");
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [armed, setArmed] = useState(false); // hover layers mount on first hover/focus (keeps idle cards light)
  const wantActive = useRef(false);

  // Entrance ("console powering on"): replays for every newly mounted card, e.g. after a filter change.
  const inView = useInView(wrapRef, { once: true, amount: 0.2 });
  const near = useInView(wrapRef, { once: true, margin: "300px 0px" });
  const [delay, setDelay] = useState<number | null>(reduced ? 0 : null);
  useEffect(() => {
    if (inView && delay === null) setDelay(claimDelay());
  }, [inView, delay, claimDelay]);
  const powered = delay !== null;
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (delay === null || reduced) return;
    setChecking(true);
    const t = window.setTimeout(() => setChecking(false), (delay + 0.15) * 1000 + CHECK_MS + 200);
    return () => window.clearTimeout(t);
  }, [delay, reduced]);
  useEffect(() => {
    if (!powered || !canHover) return;
    new Image().src = smallPhoto(service.photo);
  }, [powered, canHover, service.photo]);

  const interactive = canHover && !reduced;
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const lift = useSpring(0, SPRING);
  const activate = () => {
    wantActive.current = true;
    if (armed) setActive(true);
    else {
      setArmed(true);
      requestAnimationFrame(() => requestAnimationFrame(() => wantActive.current && setActive(true)));
    }
    if (interactive) lift.set(LIFT);
    if (cardRef.current) onActivate?.(cardRef.current);
  };
  const deactivate = () => {
    wantActive.current = false;
    setActive(false);
    lift.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    rotateX.set(((y - r.height / 2) / (r.height / 2)) * -MAX_TILT);
    rotateY.set(((x - r.width / 2) / (r.width / 2)) * MAX_TILT);
    if (spotRef.current) spotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const photoProps = { src: smallPhoto(service.photo), alt: service.photoAlt, "aria-hidden": true, loading: "lazy" as const, decoding: "async" as const };
  const lit = active && canHover;

  return (
    <motion.div
      ref={wrapRef}
      className="h-full"
      initial={reduced ? false : { opacity: 0, y: SVC.cards.rise }}
      animate={powered ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: delay ?? 0, ease: EASE }}
    >
      <Link
        to={`/services/${service.slug}`}
        className="block h-full rounded-[20px] [perspective:900px] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
        onMouseEnter={canHover ? activate : undefined}
        onMouseLeave={canHover ? deactivate : undefined}
        onMouseMove={onMouseMove}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && activate()}
        onBlur={deactivate}
      >
        <motion.div
          className="mc-active-shadow relative h-full"
          data-active={lit || undefined}
          style={{ rotateX, rotateY, y: lift, willChange: active && interactive ? "transform" : undefined }}
        >
          {armed && <div aria-hidden="true" className="mc-shadow pointer-events-none absolute inset-0 rounded-[20px] shadow-[0_28px_56px_-18px_rgba(10,42,99,0.45)]" />}
          <div
            ref={cardRef}
            data-active={lit || undefined}
            className="mc-card relative h-full flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#E6E8EC] shadow-[0_1px_2px_rgba(14,59,140,0.04),0_10px_28px_-14px_rgba(14,59,140,0.18)]"
          >
            {canHover && armed && (
              <>
                <img {...photoProps} className="mc-photo pointer-events-none absolute inset-0 w-full h-full object-cover" />
                <div
                  aria-hidden="true"
                  className="mc-overlay pointer-events-none absolute inset-0"
                  // Solid 0.92 under the lower text (readout, CTA), easing to 0.72 at the top — kept above Home's 0.55 so the
                  // small pill/overview text stays WCAG AA over any photo on these taller cards.
                  style={{ background: "linear-gradient(to top, rgba(10,42,99,0.92) 0%, rgba(10,42,99,0.92) 38%, rgba(10,42,99,0.72) 100%)" }}
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 bottom-[60px] overflow-hidden">
                  <div ref={spotRef} className={`mc-spot ${active ? "will-change-transform" : ""}`}>
                    <div className="absolute -left-[170px] -top-[170px] w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.12), rgba(255,255,255,0))" }} />
                  </div>
                </div>
              </>
            )}
            {!canHover && (
              <div className="relative h-[120px] shrink-0 overflow-hidden bg-surface-cool">
                {near && <img {...photoProps} className="absolute inset-0 w-full h-full object-cover" />}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[rgba(10,42,99,0.05)] to-[rgba(10,42,99,0.45)]" />
                <span aria-hidden="true" className="mc-num absolute right-5 bottom-3" style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 2px 12px rgba(10,42,99,0.5)" }}>
                  {num}
                </span>
              </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col justify-between p-8 pl-10">
              {/* Level meter */}
              <div aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 flex flex-col-reverse gap-[3px]">
                {Array.from({ length: SEGMENTS }, (_, i) => {
                  const live = LIVE[i];
                  return (
                    <span key={i} className="relative block w-1 h-[7px] rounded-[2px] bg-[#E6E8EC]">
                      {checking && (
                        <span
                          className="mc-check absolute inset-0 rounded-[2px] opacity-0"
                          style={{
                            background: segmentColor(i),
                            ["--cd" as string]: `${CHECK_MS - i * 40}ms`,
                            ["--cs" as string]: `${Math.round(((delay ?? 0) + 0.15) * 1000) + i * 20}ms`,
                          }}
                        />
                      )}
                      {armed && (
                        <span
                          className={`mc-seg-lit absolute inset-0 rounded-[2px] ${live ? "mc-live" : ""}`}
                          style={{
                            background: segmentColor(i),
                            ["--i" as string]: i,
                            ...(live ? { ["--ld" as string]: `${live.ld}ms`, ["--lo" as string]: `${live.lo}ms` } : {}),
                          }}
                        />
                      )}
                    </span>
                  );
                })}
              </div>

              <div>
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="mc-icon w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-xs">{icon}</div>
                    <span className="mc-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_DOT[service.category] }} />
                      {service.category}
                    </span>
                  </div>
                  {canHover && (
                    <motion.span
                      aria-hidden="true"
                      className="relative -mt-1 shrink-0"
                      initial={reduced ? false : { opacity: 0 }}
                      animate={powered ? { opacity: 1 } : undefined}
                      transition={{ duration: 0.4, delay: (delay ?? 0) + 0.2 }}
                    >
                      <span className="mc-num mc-num-rest block">{num}</span>
                      {armed && <span className="mc-num mc-num-hot absolute inset-0">{num}</span>}
                    </motion.span>
                  )}
                </div>

                <h3 className="mc-title text-xl font-bold font-heading mb-3">{service.title}</h3>
                <p className="mc-desc text-sm leading-relaxed line-clamp-3 mb-6">{service.overview}</p>

                {/* Channel readout */}
                <div className="space-y-1.5">
                  <span className="svc-readout-label text-[11px] font-bold uppercase tracking-wider block">Key Deliverable Focus</span>
                  <p className="svc-readout rounded-lg border px-3 py-1.5 text-xs tracking-[0.04em] truncate">• {service.deliverables[0]}</p>
                </div>
              </div>

              <div className="mc-divider mt-8 pt-4 border-t flex items-center justify-between text-xs font-bold">
                <span className="mc-explore">View Specifications & Applications</span>
                <ArrowRight className="mc-explore mc-arrow w-4 h-4" aria-hidden="true" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
