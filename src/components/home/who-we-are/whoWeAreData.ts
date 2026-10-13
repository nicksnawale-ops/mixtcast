/** The meaning of the MIXTCAST name, shown in the Home "Who We Are" section. Edit the copy here. */
export const BRAND_MEANING = {
  mixt: { word: "MIXT", meaning: "Latin mixtus — mixed, blended" },
  cast: { word: "CAST", meaning: "to project, to broadcast" },
  line: "Sound and vision, blended — and cast into space.",
};

/** Shared easing for this section (same curve used by the site's other entrance animations). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Entrance timeline in seconds, measured from the moment ~25% of the section is in view. */
export const WHO_WE_ARE_MOTION = {
  inViewAmount: 0.25,
  eyebrowAt: 0,
  headlineAt: 0.1,
  headlineLineStagger: 0.12,
  headlineDuration: 0.6,
  underlineAt: 0.5,
  paragraphAt: 0.55,
  brandAt: 0.7, // "MIXTCAST" appears as one word…
  brandSplitAt: 1.05, // …then splits into MIXT + CAST
  brandLineAt: 1.5, // final line writes in word by word
  cardsAt: 0.9,
  cardsStagger: 0.1,
  buttonAt: 1.0,
  blendAt: 0.4, // desktop: waveform + light beam travel to the image edge
  blendDuration: 0.75,
  projectAt: 1.1, // image is projected in from the meeting point
  projectAtMobile: 0.3,
  projectDuration: 0.8,
  kenBurnsScale: 1.06,
  kenBurnsDuration: 12,
};
