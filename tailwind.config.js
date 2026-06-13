import forms from "@tailwindcss/forms";
import colors from "./tailwind-colors.js";

/**
 * 색은 CSS 변수(--c-*)로 두 테마(일반/비건) 전환 — src/themes.css 참조.
 * 폰트도 --font-display / --font-body 로 테마별 전환.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors,
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "margin-mobile": "16px",
        gutter: "24px",
        xl: "80px",
        md: "24px",
        lg: "48px",
        sm: "12px",
        "margin-desktop": "64px",
        xs: "4px",
        base: "8px",
      },
      fontFamily: {
        caption: ["var(--font-body)"],
        "headline-md": ["var(--font-display)"],
        "body-lg": ["var(--font-body)"],
        "display-lg": ["var(--font-display)"],
        "label-md": ["var(--font-body)"],
        "headline-lg-mobile": ["var(--font-display)"],
        "body-md": ["var(--font-body)"],
        "headline-lg": ["var(--font-display)"],
        sans: ["var(--font-body)"],
      },
      fontSize: {
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "display-lg": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "label-md": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" },
        ],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
      },
    },
  },
  plugins: [forms],
};
