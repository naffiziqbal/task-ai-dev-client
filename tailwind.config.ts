import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Editorial dark palette — warm-neutral so it doesn't read as
        // generic "developer dark mode."
        ink: {
          DEFAULT: "#f3f3f4",
          dim: "#a8a8ad",
          muted: "#6c6c72",
          faint: "#494a4f",
        },
        canvas: {
          DEFAULT: "#08090a",
          raised: "#101114",
          elevated: "#181a1e",
          inset: "#0c0d10",
        },
        line: {
          subtle: "rgba(255,255,255,0.05)",
          DEFAULT: "rgba(255,255,255,0.09)",
          strong: "rgba(255,255,255,0.18)",
        },
        accent: {
          DEFAULT: "#d4af6b",
          hover: "#e6c483",
          muted: "rgba(212,175,107,0.12)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.7)",
        elevated:
          "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.85)",
        ring: "0 0 0 1px rgba(212,175,107,0.45), 0 0 24px -6px rgba(212,175,107,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-up": "slideUp 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s linear infinite",
        "progress-sweep": "progressSweep 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        progressSweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
