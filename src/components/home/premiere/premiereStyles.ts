/**
 * "The Premiere" — scoped styles. The sequence starts when `[data-premiere="on"]` is set (once per page view);
 * the beam's breathing and the dust particles are the only loops, paused via `[data-paused]` off-screen.
 * The play mark's parts are animated from the outside (the shared LogoMark artwork is unchanged).
 */

/** Timeline (seconds from the start of the reveal). */
export const T = {
  letterbox: 0, // bars slide apart and fade (0.6s)
  beam: 0.15, // projector beam fades in (0.8s)
  words: 0.35, // word-by-word reveal, 55ms apart (0.6s each)
  wordStagger: 0.055,
  sweep: 0.7, // light sweep across the text (0.9s)
  underline: 1.3, // gradient underline under "Meets Innovations" (0.6s)
  bars: 1.6, // play mark: waveform bars pulse once (0.5s)
  circle: 1.75, // circle draws (0.6s)
  triangle: 2.2, // play triangle scales in with a flicker (0.35s)
  attribution: 2.3, // attribution fades in (0.45s) → ends ≈ 2.75s
};

const s = (v: number) => `${v}s`;

export const PREMIERE_CSS = `
.pm-letterbox-top, .pm-letterbox-bottom { opacity: 1; }
[data-premiere="on"] .pm-letterbox-top { animation: pm-lb-top 600ms cubic-bezier(0.65, 0, 0.35, 1) ${s(T.letterbox)} both; }
[data-premiere="on"] .pm-letterbox-bottom { animation: pm-lb-bottom 600ms cubic-bezier(0.65, 0, 0.35, 1) ${s(T.letterbox)} both; }
@keyframes pm-lb-top { to { transform: translateY(-28px); opacity: 0; } }
@keyframes pm-lb-bottom { to { transform: translateY(28px); opacity: 0; } }

.pm-beam { opacity: 0; }
[data-premiere="on"] .pm-beam { animation: pm-beam-in 800ms ease-out ${s(T.beam)} both, pm-breathe 5s ease-in-out ${s(T.beam + 0.8)} infinite; }
@keyframes pm-beam-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pm-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.88; } } /* ≈ ±1% of the beam's 8% */

.pm-dust { animation: pm-dust var(--dur) ease-in-out var(--delay) infinite alternate; }
@keyframes pm-dust { from { transform: translate(0, 0); } to { transform: translate(var(--dx), var(--dy)); } }

.pm-sweep { opacity: 0; transform: translateX(-160%) skewX(-18deg); }
[data-premiere="on"] .pm-sweep { animation: pm-sweep 900ms cubic-bezier(0.45, 0, 0.25, 1) ${s(T.sweep)} both; }
@keyframes pm-sweep { 0% { opacity: 0; transform: translateX(-160%) skewX(-18deg); } 15%, 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(460%) skewX(-18deg); } }

.pm-underline { transform: scaleX(0); transform-origin: left; }
[data-premiere="on"] .pm-underline { animation: pm-underline 600ms cubic-bezier(0.22, 1, 0.36, 1) ${s(T.underline)} both; }
@keyframes pm-underline { to { transform: scaleX(1); } }

.pm-mark .waveform-left, .pm-mark .waveform-right { transform-box: fill-box; transform-origin: center; }
[data-premiere="on"] .pm-mark .waveform-left { animation: pm-pulse 500ms ease-in-out ${s(T.bars)} both; }
[data-premiere="on"] .pm-mark .waveform-right { animation: pm-pulse 500ms ease-in-out ${s(T.bars + 0.06)} both; }
@keyframes pm-pulse { 0%, 100% { transform: scaleY(1); } 40% { transform: scaleY(1.3); } 70% { transform: scaleY(0.85); } }
.pm-mark circle { stroke-dasharray: 214; stroke-dashoffset: 214; }
[data-premiere="on"] .pm-mark circle { animation: pm-draw 600ms cubic-bezier(0.22, 1, 0.36, 1) ${s(T.circle)} both; }
@keyframes pm-draw { to { stroke-dashoffset: 0; } }
.pm-mark polygon { opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(0.6); }
[data-premiere="on"] .pm-mark polygon { animation: pm-play 350ms ease-out ${s(T.triangle)} both; }
@keyframes pm-play { 0% { opacity: 0; transform: scale(0.6); } 40% { opacity: 1; transform: scale(1.12); } 55% { opacity: 0.35; } 70% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }

.pm-attribution { opacity: 0; }
[data-premiere="on"] .pm-attribution { animation: pm-fade 450ms ease-out ${s(T.attribution)} both; }
@keyframes pm-fade { to { opacity: 1; } }

[data-paused] .pm-beam, [data-paused] .pm-dust { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .pm-letterbox-top, .pm-letterbox-bottom, .pm-sweep, .pm-dust { display: none; }
  .pm-beam, .pm-underline, .pm-mark .waveform-left, .pm-mark .waveform-right, .pm-mark circle, .pm-mark polygon, .pm-attribution { animation: none !important; }
  .pm-beam, .pm-attribution, .pm-mark polygon { opacity: 1; }
  .pm-underline, .pm-mark polygon { transform: none; }
  .pm-mark circle { stroke-dashoffset: 0; }
}
`;
