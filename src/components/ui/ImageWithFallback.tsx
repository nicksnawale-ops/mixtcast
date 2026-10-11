import React, { useState } from "react";
import { Film, Volume2, Sparkles } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  category?: string;
  aspectRatioClass?: string;
  cinemaFrame?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "MixtCast Visual Solutions",
  fallbackTitle = "AV Installation Showcase",
  category = "Audio-Visual Environment",
  className = "",
  aspectRatioClass = "aspect-video",
  cinemaFrame = false,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-surface-warm select-none ${aspectRatioClass} ${
        cinemaFrame ? "border-y-[3px] border-brand-navy" : ""
      }`}
    >
      {!hasError && src ? (
        <>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } ${className}`}
            {...props}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-surface-warm animate-pulse flex items-center justify-center">
              <div className="flex items-center gap-1 opacity-40">
                <span className="w-1 h-3 bg-brand-orange rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-brand-navy rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-3 bg-brand-orange rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Styled CSS/SVG Fallback Container matching brand aesthetics */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface-warm via-surface-cool to-brand-navy/5">
          <div className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-brand-orange shadow-sm mb-3">
            <Volume2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange mb-1">
            {category}
          </span>
          <h4 className="text-sm font-semibold text-ink font-heading max-w-xs line-clamp-1">
            {fallbackTitle}
          </h4>
          <div className="mt-3 flex items-center gap-1 opacity-50">
            <span className="h-1.5 w-[2px] rounded-full bg-brand-orange" />
            <span className="h-3 w-[2px] rounded-full bg-brand-navy" />
            <span className="h-5 w-[2px] rounded-full bg-brand-orange" />
            <span className="h-3 w-[2px] rounded-full bg-brand-navy" />
            <span className="h-1.5 w-[2px] rounded-full bg-brand-orange" />
          </div>
        </div>
      )}
    </div>
  );
};
