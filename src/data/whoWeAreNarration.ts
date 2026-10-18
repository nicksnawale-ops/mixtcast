// Narration for the Home "Who We Are" section.
// The script below is the single source of truth: the browser-speech fallback reads it, and it is the text to use
// when (re)generating the recorded file at public/audio/who-we-are-narration.mp3.

/** URL of the recorded narration. If the file is missing or can't be played, the browser's speech engine is used. */
export const NARRATION_AUDIO_SRC = "/audio/who-we-are-narration.mp3";

/** The narration script (exact wording). */
export const NARRATION_SCRIPT =
  "Welcome to MixtCast Visual Solutions. MixtCast is a fusion of diverse ideas, transformed into something meaningful — where ideas converge, and innovation takes shape. We are an audio-video integration company based in Pune, designing and delivering AV environments: auditoriums and movie theatres, conference rooms and boardrooms, educational institutions, training centres, home theatres and studios. Our experienced team brings together trusted global technologies — from high-fidelity sound and advanced projection, to smart control and collaborative conferencing — and engineers every space around its people and purpose. From the first consultation to installation, training and reliable after-sales support, we stay with you. Where expertise meets innovations.";

/** Which piece of on-page text is highlighted while a part of the script is spoken (`data-narration-target` values). */
export type NarrationTarget = "wwa-headline" | "wwa-paragraph" | "wwa-statement" | "wwa-tagline";

/**
 * The script split into spoken segments (sentences; the second sentence is split at its dash so the statement and
 * the tagline can be highlighted separately), each mapped to the on-page text it relates to. Used by the
 * speech fallback, which highlights each segment as it starts.
 */
const SEGMENT_TARGETS: NarrationTarget[] = [
  "wwa-headline", // Welcome to MixtCast Visual Solutions.
  "wwa-statement", // MixtCast is a fusion of diverse ideas, transformed into something meaningful
  "wwa-tagline", // where ideas converge, and innovation takes shape.
  "wwa-paragraph", // We are an audio-video integration company…
  "wwa-paragraph", // Our experienced team brings together…
  "wwa-paragraph", // From the first consultation…
  "wwa-tagline", // Where expertise meets innovations.
];

export const NARRATION_SEGMENTS: { text: string; targetId: NarrationTarget }[] = (() => {
  const sentences = NARRATION_SCRIPT.split(/(?<=\.)\s+/);
  const [statement, tagline] = sentences[1].split(" — ");
  const parts = [sentences[0], statement, tagline, ...sentences.slice(2)];
  return parts.map((text, i) => ({ text, targetId: SEGMENT_TARGETS[i] ?? "wwa-paragraph" }));
})();

/**
 * Cue points for the recorded MP3: at `start` seconds, highlight `targetId`.
 *
 * These are APPROXIMATE starting values, estimated at ~2.4 words per second with short pauses between sentences
 * (total ≈ 48 s). To tune them for the real recording:
 *   1. Play public/audio/who-we-are-narration.mp3 in any audio player (or the browser) and note the time each
 *      segment begins (the comments show which words start each cue).
 *   2. Replace the `start` values below (seconds, decimals fine). Keep them in ascending order.
 *   3. Reload the Home page and press "Listen" — the highlight should move as each segment begins.
 */
export const NARRATION_CUES: { start: number; targetId: NarrationTarget }[] = [
  { start: 0, targetId: "wwa-headline" }, // "Welcome to MixtCast Visual Solutions."
  { start: 2.8, targetId: "wwa-statement" }, // "MixtCast is a fusion of diverse ideas…"
  { start: 7.9, targetId: "wwa-tagline" }, // "…where ideas converge, and innovation takes shape."
  { start: 11.2, targetId: "wwa-paragraph" }, // "We are an audio-video integration company based in Pune…"
  { start: 24.6, targetId: "wwa-paragraph" }, // "Our experienced team brings together…"
  { start: 38.0, targetId: "wwa-paragraph" }, // "From the first consultation…"
  { start: 44.7, targetId: "wwa-tagline" }, // "Where expertise meets innovations."
];
