/** "The Acoustic Blueprint" — every tunable value for the Solutions page ambient background. */
export const BLUEPRINT = {
  grid: {
    spacing: 48, // px
    lineOpacity: 0.03, // navy hairlines
    majorEvery: 4, // every 4th line…
    majorOpacity: 0.05, // …a little stronger
    edgeFade: "8%", // fades out toward the left/right page edges
  },
  rays: {
    minWidth: 768, // md+ only
    count: 7,
    bounces: [3, 4], // per ray (random within)
    navyOpacity: 0.1,
    orangeOpacity: 0.12,
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
    navyOpacity: 0.06,
    orangeOpacity: 0.05,
    driftS: [34, 40] as const, // loop lengths
    scrollShift: 80, // px the blobs travel over the whole page's scroll
  },
};
