import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { EASE_OUT } from "./whoWeAreData";

interface FeatureCardProps {
  title: string;
  text: string;
  titleClassName: string;
  /** Entrance delay (s). */
  delay: number;
  active: boolean;
  reduced: boolean;
}

const MAX_TILT = 4; // degrees

/** Feature card with a cursor-following spotlight, a gentle 3D tilt and a mini equalizer on hover (desktop pointers). */
export const FeatureCard: React.FC<FeatureCardProps> = ({ title, text, titleClassName, delay, active, reduced }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    glowX.set(e.clientX - r.left - 90);
    glowY.set(e.clientY - r.top - 90);
    rotateY.set((px - 0.5) * 2 * MAX_TILT);
    rotateX.set(-(py - 0.5) * 2 * MAX_TILT);
  };
  const onLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={active || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.55, delay: reduced ? 0 : delay, ease: EASE_OUT }}
      className="flex-1 [perspective:800px]"
    >
      <motion.div
        ref={ref}
        data-hover={hovered}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY }}
        className="wwa-card relative h-full overflow-hidden p-4 rounded-xl bg-surface-warm border border-line transition-shadow duration-300 hover:shadow-lg hover:border-brand-navy/20"
      >
        {/* Cursor-following spotlight (navy → orange, low opacity) */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 w-[180px] h-[180px] rounded-full transition-opacity duration-300"
          style={{
            x: glowX,
            y: glowY,
            opacity: hovered ? 1 : 0,
            background: "radial-gradient(circle, rgba(255,90,31,0.14) 0%, rgba(14,59,140,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Mini equalizer — animates while hovered */}
        <span aria-hidden="true" className="absolute right-3 top-3.5 flex items-end gap-[2px] h-3">
          {[0.9, 0.55, 1, 0.7, 0.45].map((h, i) => (
            <span
              key={i}
              className="wwa-eq-bar wwa-idle w-[2px] rounded-full bg-gradient-to-t from-brand-navy to-brand-orange"
              style={{ height: `${h * 100}%`, animationDelay: `${i * 0.11}s` }}
            />
          ))}
        </span>

        <span className={`relative text-xs font-bold uppercase tracking-wider block mb-1 pr-8 ${titleClassName}`}>{title}</span>
        <p className="relative text-xs text-ink-muted leading-relaxed">{text}</p>
      </motion.div>
    </motion.div>
  );
};
