/** "The Five-Band EQ" — tuning for the Why MixtCast section. */

/** Resting fader positions (0 = bottom/left, 1 = top/right), one per reason: a gentle EQ curve. */
export const REST = [0.55, 0.7, 0.85, 0.7, 0.6];

/** Hover/focus (desktop): the band widens (flex-grow 1 → ACTIVE_GROW) and its knob glides to the top. */
export const ACTIVE_GROW = 1.35;
export const HOVER_MS = 450;

/** Entrance ("tuning the system"), seconds from the moment the bands are ~25% in view. */
export const ENTRANCE = {
  hairline: { at: 0, stagger: 0.06, duration: 0.5 },
  numeral: { at: 0.1, stagger: 0.06, duration: 0.4 },
  knob: { at: 0.35, stagger: 0.12 }, // spring: glides up with a tiny settle (~0.6s)
  text: { after: 0.55, duration: 0.45 }, // after each band's knob starts
};
/** Knob spring: a smooth glide with a small, quick settle. */
export const KNOB_SPRING = { type: "spring" as const, stiffness: 170, damping: 19, mass: 0.9 };

/** Classic hairline transition above the header. */
export const HEADER = { lineMs: 600, eyebrowDelay: 0.45, headingDelay: 0.55, rise: 16 };

/** Soft seam from the Methodology tint into this section's white. */
export const SEAM = 120;

export const EASE = [0.22, 1, 0.36, 1] as const;
