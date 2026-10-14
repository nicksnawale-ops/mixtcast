/**
 * Scoped styles for the "Room Portal" cards and the proscenium header. Card states are driven by `data-active`
 * (hover on hover-capable devices, or keyboard focus). Transform/opacity/SVG stroke animations; the description's
 * max-height is the one layout transition, contained inside the fixed-height card.
 */

/** Proscenium arch: elliptical top corners, 20px bottom corners (CSS scales the radii to the card width). */
export const ARCH_RADIUS = "200px 200px 20px 20px / 120px 120px 20px 20px";

export const PORTAL_CSS = `
.sp-drift { animation: sp-drift 16s ease-in-out infinite alternate; transform: scale(1.02); }
@keyframes sp-drift { from { transform: scale(1.02); } to { transform: scale(1.05); } }
[data-paused] .sp-drift { animation-play-state: paused; }

.sp-zoom { transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1); }
.sp-card[data-active] .sp-zoom { transform: scale(1.048); } /* × the drift's ~1.05 ≈ 1.1 */

.sp-photo { opacity: 0; transition: opacity 700ms ease-out; }
.sp-card[data-in] .sp-photo { opacity: 1; transition-delay: var(--sp-photo-d, 350ms); }

.sp-frame { opacity: 0.25; transition: opacity 450ms ease; }
.sp-card[data-active] .sp-frame { opacity: 0.6; }
.sp-frame-line { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.sp-card[data-in] .sp-frame-line { animation: sp-draw 400ms cubic-bezier(0.22, 1, 0.36, 1) var(--sp-frame-d, 0ms) both; }
@keyframes sp-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }

.fp-line { stroke-dasharray: 1 1; stroke-dashoffset: 1; transition: stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1); }
.sp-card[data-active] .fp-line { stroke-dashoffset: 0; transition-duration: 900ms; transition-delay: var(--fp-d, 0ms); }

.sp-desc { max-height: 2.9em; overflow: hidden; transition: max-height 500ms cubic-bezier(0.22, 1, 0.36, 1); }
.sp-card[data-active] .sp-desc { max-height: 9em; }
.sp-card[data-touch] .sp-desc { max-height: none; }
.sp-arrow { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.sp-card[data-active] .sp-arrow { transform: translateX(6px); }

.sp-shadow { opacity: 0; transition: opacity 450ms ease; }
.sp-lift[data-active] .sp-shadow { opacity: 1; }

.sp-arch-line { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
[data-proscenium="on"] .sp-arch-line { animation: sp-draw 900ms cubic-bezier(0.45, 0, 0.2, 1) both; }
.sp-spot { opacity: 0; }
[data-proscenium="on"] .sp-spot { animation: sp-spot 1600ms ease-out 800ms both; }
@keyframes sp-spot { 0% { opacity: 0; } 35% { opacity: 1; } 100% { opacity: 0.5; } }

@media (prefers-reduced-motion: reduce) {
  .sp-drift, .sp-frame-line, .sp-arch-line, .sp-spot { animation: none !important; }
  .sp-drift { transform: none; }
  .sp-zoom, .sp-photo, .fp-line, .sp-desc, .sp-arrow { transition: none !important; }
  .sp-photo { opacity: 1; }
  .sp-frame-line, .sp-arch-line { stroke-dashoffset: 0; }
  .sp-spot { opacity: 0.5; }
  .sp-card[data-active] .sp-zoom, .sp-card[data-active] .sp-arrow { transform: none; }
  .sp-card .fp-line { display: none; }
  .sp-desc { max-height: none; }
}
`;
