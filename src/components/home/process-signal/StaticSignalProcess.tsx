import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pictogram } from "./Pictograms";
import { BlueprintGrid, ProcessHeader, SystemLivePill, pad2, type ProcessStep } from "./shared";
import { NODES, horizontalPath, verticalPath } from "./signalMath";

const LINE_H = 96;

const Node: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ style, className = "" }) => (
  <span aria-hidden="true" className={`absolute w-3.5 h-3.5 rounded-full border-2 border-brand-navy bg-white ${className}`} style={style}>
    <span className="absolute inset-[3px] rounded-full bg-brand-orange" />
  </span>
);

/** Reduced motion: no pinning or scroll-linking — the full signal, drawn, and every stage as a list. */
export const StaticSignalProcess: React.FC<{ steps: ProcessStep[] }> = ({ steps }) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const measure = () => setSize({ w: lineRef.current?.offsetWidth ?? 0, h: listRef.current?.offsetHeight ?? 0 });
    measure();
    const observer = new ResizeObserver(measure);
    if (lineRef.current) observer.observe(lineRef.current);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);
  const hPath = useMemo(() => (size.w ? horizontalPath(size.w, LINE_H / 2, 40) : ""), [size.w]);
  const vPath = useMemo(() => (size.h ? verticalPath(size.h, 24, 17) : ""), [size.h]);

  return (
    <div className="relative py-20 overflow-hidden">
      <BlueprintGrid />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProcessHeader />

        {/* Desktop: the signal across the top, stages in a 3-column grid beneath */}
        <div ref={lineRef} className="relative hidden lg:block mb-10" style={{ height: LINE_H }}>
          {size.w > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={size.w} height={LINE_H} viewBox={`0 0 ${size.w} ${LINE_H}`} fill="none">
              <defs>
                <linearGradient id="ps-signal-static" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size.w} y2="0">
                  <stop offset="0" stopColor="#0E3B8C" />
                  <stop offset="0.55" stopColor="#3A2D8F" />
                  <stop offset="1" stopColor="#FF5A1F" />
                </linearGradient>
              </defs>
              <path d={hPath} stroke="url(#ps-signal-static)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {NODES.map((n) => (
            <Node key={n} style={{ left: `calc(${n * 100}% - 7px)`, top: LINE_H / 2 - 7 }} />
          ))}
          <SystemLivePill className="absolute right-0 -bottom-6" />
        </div>

        <div className="relative">
          {/* Mobile/tablet: the signal down the left */}
          {size.h > 0 && (
            <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible lg:hidden" width={48} height={size.h} viewBox={`0 0 48 ${size.h}`} fill="none">
              <path d={vPath} stroke="url(#ps-signal-static-v)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="ps-signal-static-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={size.h}>
                  <stop offset="0" stopColor="#0E3B8C" />
                  <stop offset="1" stopColor="#FF5A1F" />
                </linearGradient>
              </defs>
            </svg>
          )}
          <ol ref={listRef} className="grid grid-cols-1 lg:grid-cols-3 gap-14 lg:gap-x-10 lg:gap-y-12 pl-16 sm:pl-20 lg:pl-0">
            {steps.map((s) => (
              <li key={s.step} className="relative lg:text-center">
                {/* On the line (centre 24px from the list edge; the list is padded 64px / 80px) */}
                <Node className="lg:hidden top-[19px] -left-[47px] sm:-left-[63px]" />
                <div className="flex items-center gap-4 mb-3 lg:flex-col lg:gap-3">
                  <span className="ps-num text-[48px] text-[rgba(14,59,140,0.08)]">{pad2(s.step)}</span>
                  <Pictogram stage={s.step} play loop={false} reduced size={64} />
                </div>
                <h3 className="font-heading font-semibold text-xl lg:text-lg text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[15px] lg:text-sm leading-relaxed text-ink-muted">{s.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 pl-16 sm:pl-20 lg:hidden">
            <SystemLivePill />
          </div>
        </div>
      </div>
    </div>
  );
};
