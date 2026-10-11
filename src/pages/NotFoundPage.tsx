import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Radio, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="relative mb-8">
        {/* Flatline waveform that animates back to life */}
        <div className="flex items-center justify-center gap-1.5 h-16 w-64 mx-auto overflow-hidden">
          <motion.div
            initial={{ scaleY: 0.1 }}
            animate={{ scaleY: [0.1, 0.2, 0.1, 1, 0.2, 0.8, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="w-1.5 h-12 bg-brand-orange rounded-full"
          />
          <motion.div
            initial={{ scaleY: 0.1 }}
            animate={{ scaleY: [0.1, 0.1, 0.1, 1.4, 0.3, 1, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.1, ease: "easeInOut" }}
            className="w-1.5 h-12 bg-brand-navy rounded-full"
          />
          <motion.div
            initial={{ scaleY: 0.1 }}
            animate={{ scaleY: [0.1, 0.1, 0.1, 1.8, 0.4, 1.2, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.2, ease: "easeInOut" }}
            className="w-2 h-16 bg-brand-orange rounded-full"
          />
          <motion.div
            initial={{ scaleY: 0.1 }}
            animate={{ scaleY: [0.1, 0.2, 0.1, 1.2, 0.2, 0.6, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.3, ease: "easeInOut" }}
            className="w-1.5 h-12 bg-brand-navy rounded-full"
          />
          <motion.div
            initial={{ scaleY: 0.1 }}
            animate={{ scaleY: [0.1, 0.1, 0.1, 0.6, 0.2, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.4, ease: "easeInOut" }}
            className="w-1.5 h-12 bg-brand-orange rounded-full"
          />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 mb-3">
        <Radio className="w-4 h-4 text-brand-orange animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          404 · Signal Lost
        </span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-ink font-heading tracking-tight mb-4">
        Frequency Out of Range
      </h1>

      <p className="text-base text-ink-muted max-w-md mx-auto mb-8">
        The requested audio-visual channel or route is unavailable or has been relocated. Let's return you to active broadcasts.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button to="/" variant="primary" size="md" icon={<Home className="w-4 h-4" />} iconPosition="left">
          Back to Home
        </Button>
        <Button to="/services" variant="secondary" size="md">
          Explore Services
        </Button>
      </div>
    </div>
  );
};
