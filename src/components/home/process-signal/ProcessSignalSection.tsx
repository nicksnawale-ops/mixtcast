import React, { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { COMPANY_INFO } from "../../../data/company";
import { PinnedSignalStory } from "./PinnedSignalStory";
import { VerticalSignalJourney } from "./VerticalSignalJourney";
import { StaticSignalProcess } from "./StaticSignalProcess";
import { SIGNAL_CSS, useMedia, useRunning } from "./shared";
import { PICTOGRAM_CSS } from "./Pictograms";

/**
 * Home "Methodology — Our N-Stage Engineering Process": "From Silence to Signal".
 * The stages (COMPANY_INFO.process) form an AV signal chain; one waveform grows from near-silence to a full, live signal.
 *  - lg+: pinned, scroll-driven story (PinnedSignalStory) — adjust its length with PIN_HEIGHT_VH in signalMath.ts;
 *  - below lg: a vertical journey down the left (VerticalSignalJourney);
 *  - reduced motion: a static, fully drawn layout (StaticSignalProcess).
 */
export const ProcessSignalSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = !!useReducedMotion();
  const desktop = useMedia("(min-width: 1024px)");
  const running = useRunning(sectionRef);
  const steps = COMPANY_INFO.process;

  return (
    <section ref={sectionRef} data-paused={running ? undefined : ""} className="relative bg-surface-cool border-y border-line">
      <style>{SIGNAL_CSS + PICTOGRAM_CSS}</style>
      {reduced ? (
        <StaticSignalProcess steps={steps} />
      ) : desktop ? (
        <PinnedSignalStory steps={steps} running={running} />
      ) : (
        <VerticalSignalJourney steps={steps} running={running} />
      )}
    </section>
  );
};
