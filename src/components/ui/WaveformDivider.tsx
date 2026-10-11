import React from "react";

interface WaveformDividerProps {
  className?: string;
  variant?: "line" | "full" | "subtle";
  accentColor?: string;
}

export const WaveformDivider: React.FC<WaveformDividerProps> = ({
  className = "my-12",
  variant = "line",
  accentColor = "#FF5A1F",
}) => {
  if (variant === "subtle") {
    return (
      <div className={`w-full flex items-center justify-center gap-1.5 opacity-60 ${className}`}>
        <div className="h-[1px] w-12 bg-line" />
        <div className="h-2 w-1 rounded-full bg-brand-orange" />
        <div className="h-4 w-1 rounded-full bg-brand-orange" />
        <div className="h-6 w-1 rounded-full bg-brand-navy" />
        <div className="h-4 w-1 rounded-full bg-brand-orange" />
        <div className="h-2 w-1 rounded-full bg-brand-orange" />
        <div className="h-[1px] w-12 bg-line" />
      </div>
    );
  }

  return (
    <div className={`w-full flex items-center justify-center overflow-hidden py-2 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-line to-line" />
      <div className="flex items-center gap-1 px-4 text-brand-orange">
        <span className="h-1.5 w-[3px] rounded-full bg-brand-orange/60" />
        <span className="h-3 w-[3px] rounded-full bg-brand-orange/80" />
        <span className="h-5 w-[3px] rounded-full bg-brand-orange" />
        <span className="h-8 w-[3.5px] rounded-full bg-brand-navy" />
        <span className="h-5 w-[3px] rounded-full bg-brand-orange" />
        <span className="h-3 w-[3px] rounded-full bg-brand-orange/80" />
        <span className="h-1.5 w-[3px] rounded-full bg-brand-orange/60" />
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-line to-line" />
    </div>
  );
};
