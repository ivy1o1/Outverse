import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-body font-medium " +
  "transition-colors duration-200 select-none disabled:opacity-55 "  +
  "disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-ember text-forest-shadow hover:bg-ember-deep hover:text-parchment-soft " +
    "border border-ember-deep/40 shadow-[0_10px_24px_-12px_rgba(230,126,34,0.7)]",
  secondary:
    "bg-transparent text-parchment border border-parchment/35 " +
    "hover:border-ember hover:text-ember",
  ghost:
    "bg-transparent text-parchment/80 hover:text-parchment hover:bg-parchment/8",
  quiet:
    "bg-ink/6 text-ink-soft border border-ink/12 hover:border-ember-ink/60 " +
    "hover:text-ember-ink",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 rounded-md",
  md: "text-[0.95rem] px-5 py-2.5 rounded-md",
  lg: "text-base px-7 py-3.5 rounded-lg",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
