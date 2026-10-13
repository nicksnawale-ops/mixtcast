import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useSpring } from "motion/react";
import type { ServiceItem } from "../../../data/services";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const MAX_TILT = 4; // degrees
const LIFT = -6; // px
const SPRING = { stiffness: 260, damping: 26 };

const SEGMENTS = 8;
// Navy → orange, bottom to top.
const segmentColor = (i: number) => {
  const t = i / (SEGMENTS - 1);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(14, 255)}, ${mix(59, 90)}, ${mix(140, 31)})`;
};
// Top segments keep "bouncing" while active, each at its own rate, like a live signal.
const LIVE: Record<number, { ld: number; lo: number }> = {
  4: { ld: 760, lo: 120 },
  5: { ld: 520, lo: 40 },
  6: { ld: 380, lo: 0 },
  7: { ld: 290, lo: 60 },
};
const CHECK_MS = 400;

const CATEGORY_DOT: Record<ServiceItem["category"], string> = {
  Audio: "#FF5A1F",
  Video: "#0E3B8C",
  Spaces: "#5B6470",
  Studios: "linear-gradient(135deg, #0E3B8C, #FF5A1F)",
};

const smallPhoto = (photo: string) => photo.replace(/\.webp$/, "-800.webp");

interface ChannelCardProps {
  service: ServiceItem;
  index: number;
  icon: React.ReactNode;
  /** Hover-capable device with a fine pointer: photo reveals on hover; otherwise a photo band sits on top. */
  canHover: boolean;
  reduced: boolean;
  /** Returns the entrance delay (s) for the next card, so cards entering together cascade in order. */
  claimDelay: () => number;
  /** Called when the card becomes active (hover / keyboard focus). */
  onActivate?: (el: HTMLElement) => void;
}

/** A service card styled as a mixing-console channel strip. The whole card is one link. */
export const ChannelCard: React.FC<ChannelCardProps> = ({ service, index, icon, canHover, reduced, claimDelay, onActivate }) => {
  const channel = String(index + 1).padStart(2, "0");
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  // Hover layers (photo, overlay, spotlight, lit meter…) are only mounted once a card is first hovered/focused:
  // a dozen idle cards each carrying ~20 invisible layers would make every frame's layerization costlier.
  const [armed, setArmed] = useState(false);
  const wantActive = useRef(false);

  // Entrance: once ~20% of the card is in view, claim a slot in the cascade.
  const inView = useInView(wrapRef, { once: true, amount: 0.2 });
  // Touch band photo: only requested once the card is close to the viewport (native lazy-loading fetches far
  // earlier, which put four photos on the page's initial load).
  const near = useInView(wrapRef, { once: true, margin: "300px 0px" });
  const [delay, setDelay] = useState<number | null>(null);
  useEffect(() => {
    if (inView && delay === null) setDelay(reduced ? 0 : claimDelay());
  }, [inView, delay, reduced, claimDelay]);
  const powered = delay !== null;

  // The entrance "channel check" flash is only mounted while it plays.
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (delay === null || reduced) return;
    setChecking(true);
    const t = window.setTimeout(() => setChecking(false), (delay + 0.15) * 1000 + CHECK_MS + 200);
    return () => window.clearTimeout(t);
  }, [delay, reduced]);

  // Warm the hover photo once the card has appeared, so the first hover reveals it straight away.
  useEffect(() => {
    if (!powered || !canHover) return;
    const img = new Image();
    img.src = smallPhoto(service.photo);
  }, [powered, canHover, service.photo]);

  const interactive = canHover && !reduced;
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const lift = useSpring(0, SPRING);

  const activate = () => {
    wantActive.current = true;
    if (armed) setActive(true);
    else {
      // Mount the hover layers first, then activate on a later frame so they transition in.
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

  const photoProps = {
    src: smallPhoto(service.photo),
    alt: service.photoAlt,
    "aria-hidden": true,
    loading: "lazy" as const,
    decoding: "async" as const,
  };

  return (
    <motion.div
      ref={wrapRef}
      className="h-full"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={powered ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: delay ?? 0, ease: EASE_OUT }}
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
          data-active={(active && canHover) || undefined}
          // Perspective lives on the link, so a resting card has no transform (and no compositor layer of its own);
          // while active it gets its own layer, so tilt/lift never repaint the card and its photo.
          style={{ rotateX, rotateY, y: lift, willChange: active && interactive ? "transform" : undefined }}
        >
          {/* Deeper shadow, faded in when active */}
          {armed && (
            <div aria-hidden="true" className="mc-shadow pointer-events-none absolute inset-0 rounded-[20px] shadow-[0_28px_56px_-18px_rgba(10,42,99,0.45)]" />
          )}

          <div
            ref={cardRef}
            data-active={(active && canHover) || undefined}
            className="mc-card relative h-full flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#E6E8EC] shadow-[0_1px_2px_rgba(14,59,140,0.04),0_10px_28px_-14px_rgba(14,59,140,0.18)]"
          >
            {canHover && armed && (
              <>
                {/* Hover background: service photo under a navy gradient, plus a cursor-following spotlight */}
                <img {...photoProps} className="mc-photo pointer-events-none absolute inset-0 w-full h-full object-cover" />
                <div
                  aria-hidden="true"
                  className="mc-overlay pointer-events-none absolute inset-0"
                  // Solid 0.92 under the "Explore details" row (WCAG AA for #FF8A5C over any photo), easing to 0.55 at the top.
                  style={{ background: "linear-gradient(to top, rgba(10,42,99,0.92) 0%, rgba(10,42,99,0.92) 22%, rgba(10,42,99,0.55) 100%)" }}
                />
                {/* Clipped above the divider: no glow behind "Explore details", so it keeps AA contrast */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 bottom-[58px] overflow-hidden">
                  <div ref={spotRef} className={`mc-spot ${active ? "will-change-transform" : ""}`}>
                    <div
                      className="absolute -left-[170px] -top-[170px] w-[340px] h-[340px] rounded-full"
                      style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.14), rgba(255,255,255,0))" }}
                    />
                  </div>
                </div>
              </>
            )}
            {!canHover && (
              /* Touch: the photo as a top band, channel number in white */
              <div className="relative h-[120px] shrink-0 overflow-hidden bg-surface-cool">
                {near && <img {...photoProps} className="absolute inset-0 w-full h-full object-cover" />}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[rgba(10,42,99,0.05)] to-[rgba(10,42,99,0.45)]" />
                <motion.span
                  aria-hidden="true"
                  className="mc-num absolute right-5 bottom-3"
                  style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 2px 12px rgba(10,42,99,0.5)" }}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={powered ? { opacity: 1 } : undefined}
                  transition={{ duration: 0.4, delay: (delay ?? 0) + 0.2 }}
                >
                  {channel}
                </motion.span>
              </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pl-8">
              {/* Level meter on the left inner edge */}
              <div aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col-reverse gap-[3px]">
                {Array.from({ length: SEGMENTS }, (_, i) => {
                  const live = LIVE[i];
                  return (
                    <span key={i} className="relative block w-1 h-[7px] rounded-[2px] bg-[#E6E8EC]">
                      {/* Entrance check flash (mounted only while it plays, so it never fights the hover state) */}
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
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="mc-icon w-10 h-10 shrink-0 rounded-xl flex items-center justify-center">{icon}</div>
                    <span className="mc-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
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
                      <span className="mc-num mc-num-rest block">{channel}</span>
                      {armed && <span className="mc-num mc-num-hot absolute inset-0">{channel}</span>}
                    </motion.span>
                  )}
                </div>
                <h3 className="mc-title text-lg font-bold font-heading mb-2">{service.title}</h3>
                <p className="mc-desc text-xs leading-relaxed line-clamp-2">{service.shortLine}</p>
              </div>

              <div className="mc-divider mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold">
                <span className="mc-explore">Explore details</span>
                <ArrowRight className="mc-explore mc-arrow w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
