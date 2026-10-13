/**
 * Scoped styles for the "Mixing Console" service cards. Card states are driven by a `data-active` attribute
 * (hover on hover-capable devices, or keyboard focus), so hovering never re-renders the card.
 * Animations are transform/opacity only; the small text/pill colour changes are paint-only cross-fades.
 */
export const CONSOLE_CSS = `
.mc-photo { opacity: 0; transform: scale(1.08); transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1); }
.mc-card[data-active] .mc-photo { opacity: 1; transform: scale(1); }
.mc-overlay, .mc-spot, .mc-shadow { opacity: 0; transition: opacity 450ms cubic-bezier(0.22, 1, 0.36, 1); }
.mc-card[data-active] .mc-overlay, .mc-card[data-active] .mc-spot, .mc-active-shadow[data-active] .mc-shadow { opacity: 1; }

.mc-title { color: var(--color-ink); transition: color 400ms ease; }
.mc-desc { color: var(--color-ink-muted); transition: color 400ms ease; }
.mc-card[data-active] .mc-title { color: #FFFFFF; }
.mc-card[data-active] .mc-desc { color: rgba(255, 255, 255, 0.88); }

.mc-pill { background: #FFFFFF; border-color: #E6E8EC; color: var(--color-ink-muted); transition: background-color 400ms ease, border-color 400ms ease, color 400ms ease; }
.mc-card[data-active] .mc-pill { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.28); color: #FFFFFF; }

.mc-icon { background: var(--color-surface-cool); color: var(--color-brand-navy); transition: background-color 300ms ease, color 300ms ease; }
.mc-card[data-active] .mc-icon { background: var(--color-brand-orange); color: #FFFFFF; }

.mc-num { font-family: var(--font-heading); font-weight: 700; font-size: 44px; line-height: 1; color: transparent; letter-spacing: -0.02em; }
.mc-num-rest { -webkit-text-stroke: 1px rgba(14, 59, 140, 0.18); transition: opacity 400ms ease; }
.mc-num-hot { -webkit-text-stroke: 1px rgba(255, 255, 255, 0.35); opacity: 0; transition: opacity 400ms ease; }
.mc-card[data-active] .mc-num-rest { opacity: 0; }
.mc-card[data-active] .mc-num-hot { opacity: 1; }

.mc-divider { border-color: rgba(230, 232, 236, 0.8); transition: border-color 400ms ease; }
.mc-card[data-active] .mc-divider { border-color: rgba(255, 255, 255, 0.2); }
.mc-explore { color: var(--color-brand-orange); transition: color 300ms ease; }
.mc-card[data-active] .mc-explore { color: #FF8A5C; }
.mc-arrow { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.mc-card[data-active] .mc-arrow { transform: translateX(6px); }

/* Level meter: 8 segments, bottom → top. Lit layer rises segment by segment, then the top segments bounce. */
.mc-seg-lit { opacity: 0; transition: opacity 120ms linear; transition-delay: calc((7 - var(--i)) * 22ms); }
.mc-card[data-active] .mc-seg-lit { opacity: 1; transition-delay: calc(var(--i) * 45ms); }
.mc-card[data-active] .mc-live { animation: mc-live var(--ld) ease-in-out calc(420ms + var(--lo)) infinite alternate; }
@keyframes mc-live { from { opacity: 1; } to { opacity: 0.12; } }

/* Entrance "channel check": each segment flashes once, sweeping up then back down. */
.mc-check { animation: mc-check var(--cd) ease-in-out var(--cs) 1 backwards; }
@keyframes mc-check { 0% { opacity: 0; } 45%, 55% { opacity: 1; } 100% { opacity: 0; } }

[data-paused] .mc-live { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .mc-photo { transform: none !important; }
  .mc-seg-lit, .mc-photo, .mc-overlay, .mc-num-rest, .mc-num-hot { transition-duration: 0ms !important; transition-delay: 0ms !important; }
  .mc-live, .mc-check { animation: none !important; }
}
`;
