"use client";

import { CSSProperties, ReactNode, useRef } from "react";

/** SplitText kiểu ReactBits: từng ký tự rơi vào với stagger delay. */
export function SplitText({
  text,
  className = "",
  step = 28,
  base = 0,
}: {
  text: string;
  className?: string;
  step?: number;
  base?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="split-char"
          style={{ animationDelay: `${base + i * step}ms` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

/** ShinyText kiểu ReactBits: dải sáng quét ngang chữ. */
export function ShinyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-shimmer ${className}`}>{children}</span>;
}

/** SpotlightCard kiểu ReactBits: highlight chạy theo chuột. */
export function SpotlightCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}

/** StarBorder kiểu ReactBits: viền conic xoay quanh nút bấm. */
export function StarBorder({
  children,
  onClick,
  disabled,
  className = "",
  glow = "rgba(251,191,36,.55)",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  glow?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ["--sb-glow" as string]: glow }}
      className={`star-border ${className} ${disabled ? "opacity-40 saturate-50 cursor-not-allowed" : ""}`}
    >
      <span className="star-border-inner">{children}</span>
    </button>
  );
}
