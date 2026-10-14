/**
 * Services page — "the full 12-channel console". Styles that extend the Home console card styles
 * (CONSOLE_CSS from components/home/services-console, imported read-only) with the Services-only pieces.
 * Tuning values are in SVC below.
 */

export const SVC = {
  hero: { wordStagger: 0.07, wordDuration: 0.7, sweepAt: 0.55, sweepMs: 1000, subAt: 0.75 },
  faders: { desktop: 16, mobile: 8, opacity: 0.06, moveEveryMs: [3000, 5000] as const, glideMs: 1600 },
  filter: { layoutMs: 400 },
  cards: { stagger: 0.07, rise: 24 },
  pulses: { desktop: 7, mobile: 2, speed: 240, dash: 80, navy: "rgba(14, 59, 140, 0.18)", orange: "rgba(255, 90, 31, 0.2)", route: "rgba(255, 90, 31, 0.45)" },
  waveform: { opacity: 0.04, loopS: 40 },
};

export const SERVICES_CSS = `
/* Channel readout (KEY DELIVERABLE FOCUS) */
.svc-readout { background: var(--color-surface-cool); border-color: #E6E8EC; color: rgba(31,35,40,0.8); transition: background-color 400ms ease, border-color 400ms ease, color 400ms ease; }
.mc-card[data-active] .svc-readout { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.28); color: #FFFFFF; }
.svc-readout-label { color: var(--color-brand-orange); transition: color 400ms ease; }
.mc-card[data-active] .svc-readout-label { color: #FF8A5C; }

/* Lighter "glass" pill on these cards (keeps its small text AA over the overlay) */
.svc-cards .mc-card[data-active] .mc-pill { background: rgba(255,255,255,0.08); }

/* Console filter buttons */
.svc-led-halo { opacity: 0; transform: scale(0.6); transition: opacity 250ms ease, transform 250ms ease; }
[aria-pressed="true"] .svc-led-halo { opacity: 1; transform: scale(1); }
[aria-pressed="true"] .svc-led-flash { animation: svc-led-flash 420ms ease-out; }
@keyframes svc-led-flash { 0% { transform: scale(1); } 35% { transform: scale(1.8); } 100% { transform: scale(1); } }

/* Hero: one soft diagonal light sweep */
.svc-sweep { opacity: 0; transform: translateX(-160%) skewX(-18deg); animation: svc-sweep ${SVC.hero.sweepMs}ms cubic-bezier(0.45, 0, 0.25, 1) ${SVC.hero.sweepAt}s both; }
@keyframes svc-sweep { 0% { opacity: 0; transform: translateX(-160%) skewX(-18deg); } 15%, 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(520%) skewX(-18deg); } }

/* Fader bank */
.svc-knob { transition: transform ${SVC.faders.glideMs}ms cubic-bezier(0.65, 0, 0.35, 1); }

/* Background waveform */
.svc-wave { animation: svc-wave ${SVC.waveform.loopS}s linear infinite; }
@keyframes svc-wave { to { transform: translateX(-50%); } }

[data-paused] .svc-wave, [data-paused] .mc-live { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .svc-sweep, .svc-wave, [aria-pressed="true"] .svc-led-flash { animation: none !important; }
  .svc-sweep { display: none; }
  .svc-knob, .svc-led-halo, .svc-readout { transition: none !important; }
}
`;
