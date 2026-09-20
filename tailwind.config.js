/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accent2: "rgb(var(--accent-2) / <alpha-value>)",
      },
      fontSize: {
        // fluid type scale — min/max clamped, tuned for 360px → 1440px
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.18em" }],
        "fluid-sm": ["clamp(0.875rem, 0.84rem + 0.18vw, 0.95rem)", { lineHeight: "1.6" }],
        "fluid-base": ["clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", { lineHeight: "1.7" }],
        "fluid-lead": ["clamp(1.05rem, 0.96rem + 0.5vw, 1.375rem)", { lineHeight: "1.65" }],
        "fluid-h3": ["clamp(1.25rem, 1.1rem + 0.7vw, 1.75rem)", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        "fluid-h2": ["clamp(1.75rem, 1.4rem + 1.6vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "fluid-h1": ["clamp(2.5rem, 1.6rem + 4.2vw, 5.25rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
      },
      maxWidth: {
        prose: "62ch",
        shell: "72rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        inout: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scrollHint: {
          "0%": { transform: "scaleY(0)", transformOrigin: "top" },
          "45%": { transform: "scaleY(1)", transformOrigin: "top" },
          "55%": { transform: "scaleY(1)", transformOrigin: "bottom" },
          "100%": { transform: "scaleY(0)", transformOrigin: "bottom" },
        },
        wave: {
          "0%, 60%, 100%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10deg)" },
        },
      },
      animation: {
        floatY: "floatY 6s cubic-bezier(0.45,0,0.55,1) infinite",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 6s ease-in-out infinite",
        scrollHint: "scrollHint 2.2s cubic-bezier(0.76,0,0.24,1) infinite",
        wave: "wave 2.5s ease-in-out infinite",
      },
      fontFamily: {
        out: ["Outfit", "Inter", "system-ui", "sans-serif"],
        space: ["Space Mono", "ui-monospace", "monospace"],
        deca: ["Lexend Deca", "Inter", "sans-serif"],
        syne: ["Syne", "sans-serif"],
        app: ["Homemade Apple", "cursive"],
        gloria: ["Gloria Hallelujah", "cursive"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
