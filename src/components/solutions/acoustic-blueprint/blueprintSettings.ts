/** "The Acoustic Blueprint" — every tunable value for the Solutions page ambient background. */
export const BLUEPRINT = {
  /** "Sound Silk" ribbons (replaced the blueprint grid). */
  silk: {
    curves: 20, // fine parallel curves per ribbon (+1 sheen curve)
    opacity: 0.09, // whole ribbon (desktop/tablet); the radial mask softens the centre further
    mobileOpacity: 0.07,
    amplitude: 64, // px, main wave
    spread: 3.2, // px between curves where they fan out widest
    height: 300, // px, ribbon box
    period: 1.4, // × viewport width; tiled twice for a seamless loop
    breathe: [0.92, 1.06] as const, // scaleY
    breatheS: 14,
    parallaxMax: 40, // px
    curtainFadeMs: 1200, // the top ribbon fades in once the curtain has opened
    // Positions: a fraction of the page height, or px from the top when ≥ 1 (the first one sits behind the hero).
    ribbons: {
      three: [
        { at: 360, driftS: 58, reverse: false, parallax: 0.9, phase: 0, seed: 1 },
        { at: 0.46, driftS: 70, reverse: true, parallax: 0.85, phase: 4.5, seed: 2 },
        { at: 0.8, driftS: 46, reverse: false, parallax: 0.95, phase: 9, seed: 3 },
      ],
      two: [
        { at: 360, driftS: 58, reverse: false, parallax: 0.9, phase: 0, seed: 1 },
        { at: 0.65, driftS: 66, reverse: true, parallax: 0.88, phase: 6, seed: 2 },
      ],
      one: [{ at: 300, driftS: 60, reverse: false, parallax: 0.92, phase: 0, seed: 1 }],
    },
  },
  rays: {
    minWidth: 768, // md+ only
    count: 7,
    bounces: [3, 4], // per ray (random within)
    navyOpacity: 0.08, // was 0.10 (re-balanced for the ribbons)
    orangeOpacity: 0.1, // was 0.12
    travelMs: 6000, // a ray's head crosses its whole path
    cycleMs: 10000, // then a new source point / new paths
    dash: 0.12, // head segment (fraction of the path)
    tail: 0.3, // faint tail (fraction of the path)
    rippleMs: 900,
  },
  plans: {
    minWidth: 768,
    width: [420, 520] as const, // px, from md to xl
    bleed: 0.45, // fraction of the plan beyond the page edge
    strokeWidth: 1.25,
    navyOpacity: 0.06,
    accentOpacity: 0.1, // the orange accent (stage / screen / board line)
    triggerRatio: 0.25, // section visibility that draws its plan (once per page view)
    drawMs: 1800,
    staggerMs: 160,
    parallax: 0.1, // 0.9× scroll speed
    parallaxMax: 30, // px
  },
  glow: {
    navyOpacity: 0.05, // was 0.06 (re-balanced for the ribbons)
    orangeOpacity: 0.04, // was 0.05
    driftS: [34, 40] as const, // loop lengths
    scrollShift: 80, // px the blobs travel over the whole page's scroll
  },
};
