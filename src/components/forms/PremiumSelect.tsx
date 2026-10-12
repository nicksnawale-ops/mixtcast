import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

export interface PremiumSelectOption {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  /** id of the visible <label> element, used for aria-labelledby. */
  labelId: string;
  value: string;
  onChange: (value: string) => void;
  options: PremiumSelectOption[];
  /** Optional form field name; renders a hidden input so native form submission sees the value. */
  name?: string;
}

const PANEL_MAX_HEIGHT = 280;
const VIEWPORT_MARGIN = 12;

/**
 * Accessible custom select (button + listbox pattern) styled to match the Contact form inputs.
 */
export const PremiumSelect: React.FC<PremiumSelectProps> = ({ labelId, value, onChange, options, name }) => {
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const optionId = (i: number) => `${reactId}-option-${i}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openUp, setOpenUp] = useState(false);
  const [maxHeight, setMaxHeight] = useState(PANEL_MAX_HEIGHT);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];
  const fullLabel = selected?.label ?? "";

  // Shorten at a word boundary ("Auditoriums & Grand Assembly…") instead of cutting mid-word.
  const textRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [displayLabel, setDisplayLabel] = useState(fullLabel);
  useLayoutEffect(() => {
    const text = textRef.current;
    const measure = measureRef.current;
    if (!text || !measure) return;
    const fit = () => {
      const available = text.clientWidth;
      measure.textContent = fullLabel;
      if (measure.offsetWidth <= available) return setDisplayLabel(fullLabel);
      const words = fullLabel.split(" ");
      for (let n = words.length - 1; n > 0; n--) {
        const candidate = words.slice(0, n).join(" ").replace(/[\s&,/-]+$/, "") + "…";
        measure.textContent = candidate;
        if (measure.offsetWidth <= available) return setDisplayLabel(candidate);
      }
      setDisplayLabel(fullLabel); // a single very long word falls back to the CSS ellipsis
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(text);
    return () => observer.disconnect();
  }, [fullLabel]);

  const openList = useCallback(
    (index = selectedIndex) => {
      // Open upward when there isn't enough room below, and keep the panel inside the viewport.
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const below = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
        const above = rect.top - VIEWPORT_MARGIN;
        const up = below < Math.min(PANEL_MAX_HEIGHT, options.length * 44 + 14) && above > below;
        setOpenUp(up);
        setMaxHeight(Math.max(120, Math.min(PANEL_MAX_HEIGHT, (up ? above : below) - 6)));
      }
      setActiveIndex(index);
      setOpen(true);
    },
    [options.length, selectedIndex]
  );

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const choose = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close(true);
  };

  // Focus the listbox when it opens so keyboard navigation works.
  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  // Keep the active option visible inside the scrollable panel.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click / tap.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  const onTypeahead = (key: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = window.setTimeout(() => (state.text = ""), 600);
    const start = state.text.length === 1 ? activeIndex + 1 : activeIndex;
    for (let i = 0; i < options.length; i++) {
      const idx = (start + i) % options.length;
      if (options[idx].label.toLowerCase().startsWith(state.text)) {
        setActiveIndex(idx);
        return;
      }
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        // Let focus move on naturally.
        close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) onTypeahead(e.key);
    }
  };

  const offset = reduceMotion ? 0 : openUp ? 6 : -6;

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={`${labelId} ${reactId}-value`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        title={fullLabel}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border bg-white text-sm text-[#1F2328] text-left outline-none transition-[border-color,box-shadow] duration-150 cursor-pointer focus:border-[#0E3B8C] focus:ring-[3px] focus:ring-[#FF5A1F]/25 ${
          open ? "border-[#0E3B8C] ring-[3px] ring-[#FF5A1F]/25" : "border-[#E6E8EC] hover:border-[#C9CED6]"
        }`}
      >
        <span id={`${reactId}-value`} className="sr-only">
          {fullLabel}
        </span>
        <span ref={textRef} aria-hidden="true" className="min-w-0 flex-1 truncate">
          {displayLabel}
        </span>
        <span ref={measureRef} aria-hidden="true" className="absolute invisible whitespace-nowrap pointer-events-none" />
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 text-[#0E3B8C] transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelId}
            aria-activedescendant={optionId(activeIndex)}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: offset, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: offset, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ maxHeight, transformOrigin: openUp ? "bottom center" : "top center" }}
            className={`absolute left-0 right-0 z-20 overflow-y-auto overscroll-contain p-1.5 rounded-[14px] bg-white border border-[#E6E8EC] shadow-[0_2px_4px_rgba(14,59,140,0.04),0_12px_32px_-8px_rgba(14,59,140,0.18)] outline-none ${
              openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                  className={`flex items-center justify-between gap-3 min-h-[42px] px-3 py-2 rounded-[10px] text-sm cursor-pointer select-none ${
                    isActive ? "bg-[#F3F6FB]" : ""
                  } ${isSelected ? "text-[#0E3B8C] font-semibold" : "text-[#1F2328]"}`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check aria-hidden="true" className="w-4 h-4 shrink-0 text-[#FF5A1F]" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
