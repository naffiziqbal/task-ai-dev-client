import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// Tiny class-name joiner — avoids pulling in clsx for one helper.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// ────────────────────────────────────────────────────────────────────────────
// Button

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md " +
  "transition-all duration-150 select-none whitespace-nowrap " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-canvas hover:bg-accent-hover active:translate-y-px shadow-sm shadow-accent/20",
  secondary:
    "bg-canvas-elevated text-ink border border-line hover:bg-canvas-raised hover:border-line-strong",
  ghost:
    "text-ink-dim hover:text-ink hover:bg-white/[0.04] border border-transparent",
  danger:
    "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:text-rose-200",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-xs px-2.5 py-1.5 h-7",
  md: "text-sm px-3.5 py-1.5 h-9",
  lg: "text-sm px-5 py-2.5 h-11",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
    >
      {loading ? <Spinner size={size === "lg" ? "md" : "sm"} /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Input

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={cn(
        "h-9 w-full bg-canvas-inset/60 border rounded-md px-3 text-sm",
        "placeholder:text-ink-faint",
        "transition-colors duration-150",
        "focus:outline-none focus:bg-canvas-inset",
        invalid
          ? "border-rose-500/50 focus:border-rose-400/70"
          : "border-line hover:border-line-strong focus:border-accent/60",
        className,
      )}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Card — surface block. Use `interactive` for hover lift on clickable cards.

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "li" | "article" | "section";
}

export function Card({
  children,
  className,
  interactive,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-line bg-canvas-raised/80 backdrop-blur-[2px] shadow-card",
        "transition-all duration-200",
        interactive &&
          "hover:border-line-strong hover:bg-canvas-elevated/80 hover:-translate-y-px hover:shadow-elevated",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Badge / status pill

type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "text-ink-dim border-line bg-white/[0.03]",
  accent: "text-accent border-accent/40 bg-accent/10",
  success: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  warning: "text-amber-200 border-amber-300/30 bg-amber-300/10",
  danger: "text-rose-300 border-rose-400/30 bg-rose-400/10",
  info: "text-sky-300 border-sky-400/30 bg-sky-400/10",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor(tone))} />}
      {children}
    </span>
  );
}

function dotColor(tone: BadgeTone): string {
  switch (tone) {
    case "success":
      return "bg-emerald-400";
    case "warning":
      return "bg-amber-300";
    case "danger":
      return "bg-rose-400";
    case "info":
      return "bg-sky-400";
    case "accent":
      return "bg-accent";
    default:
      return "bg-ink-muted";
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Spinner

export function Spinner({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5";
  return (
    <svg
      className={cn("animate-spin", dim, className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section eyebrow + header

export function SectionHeader({
  eyebrow,
  title,
  description,
  trailing,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-ink-dim max-w-prose">{description}</p>
        )}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Empty state

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/[0.015] px-6 py-10 text-center animate-fade-in">
      {icon && (
        <div className="text-ink-faint mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line">
          {icon}
        </div>
      )}
      <div className="text-sm font-medium text-ink-dim">{title}</div>
      {description && (
        <div className="mt-1 text-xs text-ink-muted max-w-sm mx-auto">
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Toggle switch — accessible alternative to native checkbox for booleans.

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        checked
          ? "bg-accent/30 border-accent/50"
          : "bg-white/5 border-line",
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-ink shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5",
          checked ? "bg-accent" : "bg-ink-muted",
        )}
      />
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Progress bar — determinate when `value` (0..1) is provided, otherwise an
// indeterminate sweep. Use for upload/processing progress.

export function ProgressBar({
  value,
  label,
  className,
}: {
  value?: number | null;
  label?: string;
  className?: string;
}) {
  const determinate = typeof value === "number";
  const pct = determinate
    ? Math.max(0, Math.min(1, value as number)) * 100
    : null;
  return (
    <div className={cn("space-y-1", className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
      >
        {determinate ? (
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <span className="absolute inset-y-0 left-0 w-1/3 animate-progress-sweep rounded-full bg-accent" />
        )}
      </div>
      {label && (
        <div className="flex items-center justify-between text-2xs text-ink-muted">
          <span>{label}</span>
          {determinate && <span className="font-mono">{Math.round(pct ?? 0)}%</span>}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Inline error block

export function ErrorMessage({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 animate-fade-in"
    >
      {children}
    </div>
  );
}
