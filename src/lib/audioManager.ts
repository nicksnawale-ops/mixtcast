// Tiny site-wide audio coordinator: only one audio source plays at a time.
// A source "claims" the site's audio when it starts; every other active source is asked to fade out.

type FadeOut = (fadeMs: number) => void;

const active = new Map<string, FadeOut>();

/** Default fade used when one source takes over from another. */
export const HANDOVER_FADE_MS = 400;

export const audioManager = {
  /** Start owning the site's audio as `id`; all other active sources fade out. */
  claim(id: string, fadeOut: FadeOut, fadeMs = HANDOVER_FADE_MS) {
    active.forEach((stop, other) => {
      if (other !== id) {
        active.delete(other);
        stop(fadeMs);
      }
    });
    active.set(id, fadeOut);
  },
  /** Stop tracking `id` (it paused, ended or was stopped). */
  release(id: string) {
    active.delete(id);
  },
  /** Whether `id` currently holds the site's audio. */
  isActive(id: string) {
    return active.has(id);
  },
};
