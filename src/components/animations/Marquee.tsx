import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  className?: string;
  pauseOnHover?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  speed = "normal",
  direction = "left",
  className = "",
  pauseOnHover = true,
}) => {
  const durationClass = {
    slow: "duration-[45s]",
    normal: "duration-[30s]",
    fast: "duration-[20s]",
  }[speed];

  return (
    <div className={`overflow-hidden select-none flex w-full relative ${className}`}>
      {/* Edge gradient mask for smooth fade in/out */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface to-transparent z-10" />

      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-8 animate-marquee ${
          pauseOnHover ? "hover:[animation-play-state:paused]" : ""
        } ${direction === "right" ? "[animation-direction:reverse]" : ""}`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 items-center justify-around gap-8 animate-marquee ${
          pauseOnHover ? "hover:[animation-play-state:paused]" : ""
        } ${direction === "right" ? "[animation-direction:reverse]" : ""}`}
      >
        {children}
      </div>
    </div>
  );
};
