import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useInView, useSpring } from "motion/react";
import type { SolutionSpace } from "../../../data/solutions";
import { FloorPlan } from "./FloorPlans";
import { ARCH_RADIUS } from "./portalStyles";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_TILT = 3; // degrees
const LIFT = -6; // px
const SPRING = { stiffness: 240, damping: 26 };
const FRAME_INSET = 10;

/** Inner "proscenium moulding": the card's arch shape inset by 10px (CSS scales the outer radii to fit the width). */
const framePath = (w: number, h: number) => {
  const f = Math.min(1, w / 400, h / 140);
  const rx = 200 * f - FRAME_INSET;
  const ry = 120 * f - FRAME_INSET;
  const i = FRAME_INSET;
  const r = 10;
  const flat = Math.max(0, w - 2 * i - 2 * rx);
  return [
    `M${i} ${i + ry}`,
    `A${rx} ${ry} 0 0 1 ${i + rx} ${i}`,
    flat ? `H${i + rx + flat}` : "",
    `A${rx} ${ry} 0 0 1 ${w - i} ${i + ry}`,
    `V${h - i - r}`,
    `A${r} ${r} 0 0 1 ${w - i - r} ${h - i}`,
    `H${i + r}`,
    `A${r} ${r} 0 0 1 ${i} ${h - i - r}`,
    "Z",
  ].join(" ");
};

const smallPhoto = (photo: string) => photo.replace(/\.webp$/, "-800.webp");

interface SpacePortalCardProps {
  space: SolutionSpace;
  index: number;
  canHover: boolean;
  reduced: boolean;
  /** Entrance delay (s) for the next card, so cards entering together cascade in order. */
  claimDelay: () => number;
}

/** A space card framed like a proscenium arch; the whole card is one link to its Solutions deep link. */
export const SpacePortalCard: React.FC<SpacePortalCardProps> = ({ space, index, canHover, reduced, claimDelay }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Entrance: once ~20% in view, claim a slot in the cascade (90ms apart).
  const inView = useInView(wrapRef, { once: true, amount: 0.2 });
  const [delay, setDelay] = useState<number | null>(reduced ? 0 : null);
  useEffect(() => {
    if (inView && delay === null) setDelay(claimDelay());
  }, [inView, delay, claimDelay]);
  const entered = delay !== null;

  const interactive = canHover && !reduced;
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const lift = useSpring(0, SPRING);

  const activate = () => {
    if (!canHover && !reduced) return; // touch: tap follows the link, no hover state
    setActive(true);
    if (interactive) lift.set(LIFT);
  };
  const deactivate = () => {
    setActive(false);
    lift.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    rotateX.set(((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -MAX_TILT);
    rotateY.set(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * MAX_TILT);
  };

  const num = String(index + 1).padStart(2, "0");
  const ms = Math.round((delay ?? 0) * 1000);

  return (
    <motion.div
      ref={wrapRef}
      className="h-[340px] md:h-[380px] lg:h-[420px]"
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={entered ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: delay ?? 0, ease: EASE }}
    >
      <Link
        to={`/solutions#${space.slug}`}
        className="block h-full [perspective:1000px] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange"
        style={{ borderRadius: ARCH_RADIUS }}
        onMouseEnter={canHover ? activate : undefined}
        onMouseLeave={canHover ? deactivate : undefined}
        onMouseMove={onMouseMove}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && activate()}
        onBlur={deactivate}
      >
        <motion.div
          className="sp-lift relative h-full"
          data-active={active || undefined}
          style={{ rotateX, rotateY, y: lift, willChange: active && interactive ? "transform" : undefined }}
        >
          {/* Deeper shadow when active */}
          <div aria-hidden="true" className="sp-shadow pointer-events-none absolute inset-0 shadow-[0_30px_60px_-20px_rgba(10,42,99,0.5)]" style={{ borderRadius: ARCH_RADIUS }} />

          <div
            ref={cardRef}
            data-active={active || undefined}
            data-in={entered || undefined}
            data-touch={!canHover || reduced || undefined}
            className="sp-card relative h-full overflow-hidden bg-brand-navy-deep shadow-[0_10px_30px_-14px_rgba(10,42,99,0.35)]"
            style={{ borderRadius: ARCH_RADIUS, ["--sp-frame-d" as string]: `${ms}ms`, ["--sp-photo-d" as string]: `${ms + 350}ms` }}
          >
            {/* Full-bleed photo: idle drift (only while the section is in view) + hover zoom */}
            <div className="sp-drift absolute inset-0">
              <div className="sp-zoom absolute inset-0">
                <img
                  src={smallPhoto(space.photo)}
                  srcSet={`${smallPhoto(space.photo)} 800w, ${space.photo} 1600w`}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  alt={space.photoAlt}
                  loading="lazy"
                  decoding="async"
                  className="sp-photo absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Legibility (WCAG AA over any photo): a soft local veil behind the label, and the navy gradient under the
                text — stops in px so the title stays covered when it wraps on narrow cards */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(130px 56px at 82px 75px, rgba(10,42,99,0.78), rgba(10,42,99,0))" }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(10,42,99,0.92) 0px, rgba(10,42,99,0.82) 210px, rgba(10,42,99,0) 300px)" }}
            />

            {/* Inner proscenium frame */}
            {size.w > 0 && (
              <svg aria-hidden="true" className="sp-frame pointer-events-none absolute inset-0" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} fill="none">
                <path className="sp-frame-line" d={framePath(size.w, size.h)} pathLength={1} stroke="#FFFFFF" strokeWidth={1} />
              </svg>
            )}

            {/* Floor plan of the room, drawn on hover/focus (hover-capable devices) */}
            {canHover && !reduced && <FloorPlan slug={space.slug} className="pointer-events-none absolute left-[22.5%] top-[12%] w-[55%]" />}

            <span className="absolute left-10 top-[68px] text-[11px] font-heading font-semibold tracking-[0.22em] uppercase text-white/80">
              Space {num}
            </span>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <h3 className="font-heading font-semibold text-[22px] leading-tight text-white">{space.title}</h3>
              <p className="sp-desc mt-2 text-[14.5px] leading-[1.45] text-white/80">{space.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white">
                View Architecture Breakdown
                <ArrowRight className="sp-arrow w-3.5 h-3.5 text-brand-orange" aria-hidden="true" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
