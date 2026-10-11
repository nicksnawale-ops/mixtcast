import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "ghost";
  size?: "sm" | "md" | "lg";
  to?: string;
  href?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  to,
  href,
  children,
  icon,
  iconPosition = "right",
  className = "",
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Mild magnetic pull: max 4px
    const distanceX = (e.clientX - centerX) * 0.12;
    const distanceY = (e.clientY - centerY) * 0.12;
    setPosition({ x: Math.min(Math.max(distanceX, -4), 4), y: Math.min(Math.max(distanceY, -4), 4) });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-xs font-semibold tracking-wide",
    md: "px-6 py-2.5 text-sm font-semibold tracking-wide",
    lg: "px-8 py-3.5 text-base font-semibold tracking-wide",
  }[size];

  const variantClasses = {
    primary:
      "bg-brand-navy text-white hover:bg-brand-navy-deep shadow-sm hover:shadow-md relative overflow-hidden group border border-transparent",
    secondary:
      "bg-transparent text-brand-navy border border-brand-navy/30 hover:border-brand-navy hover:bg-brand-navy/5",
    cta:
      "bg-brand-orange text-white hover:bg-brand-orange-soft shadow-md hover:shadow-lg shadow-brand-orange/20 border border-transparent",
    ghost:
      "bg-transparent text-ink hover:text-brand-navy hover:bg-black/5 border border-transparent",
  }[variant];

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="mr-2 shrink-0">{icon}</span>}
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      {icon && iconPosition === "right" && <span className="ml-2 shrink-0">{icon}</span>}
      {variant === "primary" && (
        <span
          className="absolute bottom-0 left-0 h-[2px] w-0 bg-brand-orange transition-all duration-300 group-hover:w-full"
          aria-hidden="true"
        />
      )}
    </>
  );

  const combinedClasses = `inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0 active:scale-[0.98] ${sizeClasses} ${variantClasses} ${className}`;

  if (to) {
    return (
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="inline-block"
      >
        <Link
          to={to}
          ref={buttonRef as React.Ref<HTMLAnchorElement>}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={combinedClasses}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="inline-block"
      >
        <a
          href={href}
          ref={buttonRef as React.Ref<HTMLAnchorElement>}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={combinedClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      className="inline-block"
    >
      <button
        ref={buttonRef as React.Ref<HTMLButtonElement>}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={combinedClasses}
        onClick={onClick}
        type={props.type || "button"}
        disabled={props.disabled}
      >
        {content}
      </button>
    </motion.div>
  );
};
