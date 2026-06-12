---
name: Vegan Chef
colors:
  surface: '#f6fbf3'
  surface-dim: '#d7dbd4'
  surface-bright: '#f6fbf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f5ed'
  surface-container: '#ebefe8'
  surface-container-high: '#e5eae2'
  surface-container-highest: '#dfe4dc'
  on-surface: '#181d18'
  on-surface-variant: '#41493e'
  inverse-surface: '#2d322d'
  inverse-on-surface: '#eef2ea'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#286b33'
  on-secondary: '#ffffff'
  secondary-container: '#abf4ac'
  on-secondary-container: '#2e7238'
  tertiary: '#363d33'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d5449'
  on-tertiary-container: '#c1c8ba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#abf4ac'
  secondary-fixed-dim: '#90d792'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#07521d'
  tertiary-fixed: '#dee5d6'
  tertiary-fixed-dim: '#c2c9bb'
  on-tertiary-fixed: '#171d14'
  on-tertiary-fixed-variant: '#42493e'
  background: '#f6fbf3'
  on-background: '#181d18'
  surface-variant: '#dfe4dc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is built on a foundation of ethical living, health, and environmental sustainability. The brand personality is grounded and nurturing, aiming to evoke a sense of calm reliability and organic warmth. 

The visual style follows a **Modern Minimalist** approach with a **Tactile** edge. It prioritizes heavy whitespace to allow high-quality food photography to breathe, while using soft, organic shapes and subtle textures to avoid a clinical feel. The interface should feel like a premium lifestyle magazine: clean, structured, yet deeply inviting.

## Colors
The palette is rooted in nature, using a spectrum of greens to reinforce the vegan and sustainable narrative.

*   **Primary (#1b5e20):** A deep forest green used for high-emphasis actions, primary branding, and headers. It provides a strong rhythmic anchor and ensures WCAG AAA contrast ratios on light backgrounds.
*   **Secondary (#81c784):** A soft sage green used for secondary actions, success states, and subtle accents.
*   **Tertiary (#f1f8e9):** A very pale leaf tint used for large background surfaces and container fills to soften the overall UI.
*   **Neutral (#2e332e):** A warm, dark charcoal with a hint of green for typography and iconography, ensuring better readability than pure black.

## Typography
The typography strategy balances modern efficiency with approachable warmth. 

**Plus Jakarta Sans** is utilized for headlines to provide a friendly, optimistic, and slightly rounded geometric feel. Its soft curves mirror the organic nature of the brand. 

**Be Vietnam Pro** is used for body text and labels. Its contemporary, clean structure ensures high legibility for ingredient lists and cooking instructions, maintaining a professional yet casual tone. Line heights are intentionally generous to improve the reading experience during active cooking tasks.

## Layout & Spacing
This design system utilizes a **Fluid Grid** system with a focus on generous negative space to emphasize clarity and health.

*   **Desktop:** 12-column grid with 64px side margins and 24px gutters. Content is often centered in a max-width container (1280px) to prevent over-extension on ultra-wide displays.
*   **Tablet:** 8-column grid with 32px margins.
*   **Mobile:** 4-column grid with 16px margins. 

The vertical rhythm is governed by an 8px base unit. Component internal padding should favor the `md` (24px) spacing token to create an airy, premium feel.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than heavy shadows, keeping the UI light and "clean."

*   **Surface Level 0:** The main background using the Tertiary color (#f1f8e9).
*   **Surface Level 1:** White (#ffffff) cards and containers.
*   **Depth Markers:** Instead of traditional drop shadows, use 1px inner borders in a slightly darker shade of the sage green or very soft, long-spread ambient shadows (Opacity: 4%, Color: Primary Green).
*   **Interaction:** Active elements may use a subtle "lift" effect using a soft 8px blur shadow to indicate tangibility.

## Shapes
The shape language is consistently **Rounded**, avoiding sharp corners to maintain a friendly and safe emotional response. Standard containers use a 0.5rem (8px) radius, while interactive components like buttons and search bars often lean towards more pronounced rounding (1rem or higher) to feel soft to the touch.

## Components
Consistent application of the organic style across all functional elements:

*   **Buttons:** Primary buttons feature the Forest Green background with White text. Use a 1rem corner radius. Secondary buttons use a Sage Green border with Forest Green text.
*   **Cards:** Pure white backgrounds with 16px (rounded-lg) corners. Use a 1px border of #81c784 at 20% opacity instead of a shadow.
*   **Inputs:** Large, clear hit areas with 8px radius. Use the Sage Green for the border on focus states to provide a gentle "active" cue.
*   **Chips/Tags:** Used for dietary labels (e.g., "Gluten-Free," "Nut-Free"). These should have fully rounded (pill) ends and use the Tertiary green background with Primary green text.
*   **Lists:** Recipe steps should be separated by generous 24px spacing, using the Primary green for step numbers to maintain a clear hierarchy.
*   **Selection Controls:** Checkboxes and Radio buttons use the Primary green when selected, with a soft Sage Green halo on hover.