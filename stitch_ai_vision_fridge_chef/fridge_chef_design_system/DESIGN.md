---
name: Fridge Chef Design System
colors:
  surface: '#f3fcf1'
  surface-dim: '#d4dcd2'
  surface-bright: '#f3fcf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6eb'
  surface-container: '#e8f0e5'
  surface-container-high: '#e2ebe0'
  surface-container-highest: '#dce5da'
  on-surface: '#161d17'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2b322b'
  inverse-on-surface: '#ebf3e8'
  outline: '#6c7b6d'
  outline-variant: '#bbcbbb'
  surface-tint: '#006d37'
  primary: '#006d37'
  on-primary: '#ffffff'
  primary-container: '#2ecc71'
  on-primary-container: '#005027'
  inverse-primary: '#4ae183'
  secondary: '#865300'
  on-secondary: '#ffffff'
  secondary-container: '#fea520'
  on-secondary-container: '#694000'
  tertiary: '#98472a'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff9875'
  on-tertiary-container: '#772e14'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfe9c'
  primary-fixed-dim: '#4ae183'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#ffddb9'
  secondary-fixed-dim: '#ffb961'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#663e00'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#793015'
  background: '#f3fcf1'
  on-background: '#161d17'
  surface-variant: '#dce5da'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is built to evoke the freshness of a farmer's market combined with the precision of a professional kitchen. It targets home cooks who seek inspiration from their existing ingredients, positioning the AI as a helpful sous-chef rather than a complex machine. 

The visual style is **Corporate / Modern** with a culinary twist—utilizing high-quality food photography and generous whitespace to create a clean, appetizing interface. The emotional response should be one of confidence and hunger: users should feel that cooking a professional-grade meal is both accessible and immediate.

## Colors

The palette is anchored by **Fresh Green**, symbolizing vitality and raw ingredients. This is balanced by **Warm Orange**, which stimulates appetite and highlights "hot" actions like cooking or AI generation. 

- **Primary (#2ECC71):** Used for success states, main CTA buttons, and active recipe steps.
- **Secondary (#F39C12):** Used for highlights, "Ready to Cook" badges, and progress indicators.
- **Neutral / Background (#F9F9F9):** A soft off-white to reduce screen glare while maintaining a clean, sanitary kitchen feel.
- **Text (#2C3E50):** Deep charcoal ensures maximum legibility for long-form recipe instructions and ingredient lists.

## Typography

This design system utilizes **Inter** for its exceptional clarity and modern, systematic feel. The hierarchy is strictly enforced to guide users through complex recipes easily.

- **Headlines:** Use Bold weights (700) for recipe titles and section headers to provide strong structural anchors.
- **Body:** Use a comfortable 16px base for instructions, ensuring high readability even when a user is glancing at a phone from a kitchen counter.
- **Labels:** Semi-bold weights are reserved for ingredient tags and metadata (prep time, difficulty) to differentiate them from instructional text.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum container width of 1200px for desktop to ensure recipe content remains scannable. 

- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px margins.

Spacing is based on a **4px scale**. Recipe cards should utilize `xl` (40px) vertical spacing between sections to prevent the interface from feeling cluttered, maintaining the "Professional Kitchen" airy aesthetic.

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of physical layering, mimicking ingredients placed on a countertop. 

- **Level 0 (Background):** #F9F9F9, flat. Used for the main canvas.
- **Level 1 (Cards):** #FFFFFF with a soft, diffused shadow: `0px 4px 20px rgba(44, 62, 80, 0.05)`. Used for recipe cards and search filters.
- **Level 2 (Modals/Popovers):** #FFFFFF with a more pronounced shadow: `0px 12px 32px rgba(44, 62, 80, 0.12)`.
- **Upload Zone:** Uses a dashed 2px border in a muted version of the Primary Green instead of elevation to signify an "empty state" ready to be filled.

## Shapes

The design system adopts a **Rounded** language to appear friendly and organic. 

- **Standard Elements:** 16px (`rounded-lg`) corner radius for recipe cards, input fields, and the primary upload area.
- **Buttons:** 12px corner radius to provide a distinct, clickable feel that is slightly sharper than the cards.
- **Tags/Badges:** Full pill-shape (100px) for ingredient tags to make them feel like "bites" of information.

## Components

### Buttons
- **Primary:** Solid #2ECC71 with white text. High-contrast, 16px height-padding.
- **Secondary:** Outlined 2px #2ECC71 or solid #F39C12 for "Cook Now" urgency.

### Recipe Cards
Cards feature a 1:1 or 4:3 aspect ratio image at the top. Ingredient tags are placed below the title, utilizing the pill-shaped badges. The "Ready to Cook" badge should be anchored to the top-right of the image using the Secondary Orange.

### Upload Area
A large-scale component with a 2px dashed border in Primary Green. It features a central icon of a camera or refrigerator and a prominent "Scan Fridge" primary button.

### Status Indicators
AI analysis states use a pulsing subtle green glow or a skeleton loader that mimics the shape of ingredients being identified.

### Navigation Bar
A fixed top bar in Pure White (#FFFFFF) with a very thin #E0E0E0 bottom border. Links use `label-md` typography with a 4px green underline for the active state.