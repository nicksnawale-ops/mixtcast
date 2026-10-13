/** The official meaning of the MIXTCAST name, shown in the Home "Who We Are" section. Edit the copy here. */
export const BRAND_MEANING = {
  mixt: {
    word: "MIXT",
    origin: "from the Latin mixtus — blended",
    meaning: "Diverse ideas, technologies and capabilities, brought together.",
  },
  cast: {
    word: "CAST",
    origin: "to give form",
    meaning: "Shaped into something meaningful.",
  },
  statement: "A fusion of diverse ideas, transformed into something meaningful.",
  tagline: "Where Ideas Converge and Innovation Takes Shape.",
};

/** Words in the tagline that carry the brand colours (the text itself is unchanged). */
export const TAGLINE_ACCENTS = [
  { text: "Converge", className: "text-brand-navy" },
  { text: "Takes Shape", className: "text-brand-orange" },
];

/** Shared easing for this section (same curve used by the site's other entrance animations). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** "Converge & Take Shape" entrance timeline, in seconds from the moment ~25% of the section is in view. */
export const WHO_WE_ARE_MOTION = {
  inViewAmount: 0.25,
  eyebrowAt: 0,
  headlineAt: 0.1,
  headlineLineStagger: 0.12,
  headlineDuration: 0.6,
  underlineAt: 0.5,
  paragraphAt: 0.55,
  brandAt: 0.7, // "MIXTCAST" appears as one word…
  brandSplitAt: 1.05, // …then splits into MIXT + CAST, meanings rise beneath
  statementAt: 1.45, // statement writes in word by word
  statementStagger: 0.045,
  taglineAt: 1.95, // tagline takes shape last
  taglineStagger: 0.04,
  taglineLineAt: 2.1, // navy → orange line draws beneath the tagline
  cardsAt: 0.9,
  cardsStagger: 0.1,
  buttonAt: 1.0,
  convergeAt: 0.4, // desktop: orange waveform + navy light beam converge on the image edge
  convergeDuration: 0.75,
  takeShapeAt: 1.1, // the image takes shape from the meeting point
  takeShapeAtMobile: 0.3,
  takeShapeDuration: 0.8,
  kenBurnsScale: 1.06,
  kenBurnsDuration: 12,
};
