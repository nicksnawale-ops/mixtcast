import { createContext, useContext } from "react";

/**
 * "Patch In" ↔ Services console. Provided by PatchInTransition around the Services section; the section
 * works exactly as before without it.
 */
export interface PatchInApi {
  /** False until the cable connects: the routing grid rests dimmed and the card cascade waits. */
  powered: boolean;
  /** The Services section registers how to run its one-time power-on (light wave + pulses from the port). */
  registerPowerOn: (fn: ((x: number, y: number) => void) | null) => void;
}

export const PatchInContext = createContext<PatchInApi | null>(null);
export const usePatchIn = () => useContext(PatchInContext);
