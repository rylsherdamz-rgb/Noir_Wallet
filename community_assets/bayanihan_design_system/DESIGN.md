---
name: Bayanihan Design System
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#444653'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#747685'
  outline-variant: '#c4c5d5'
  surface-tint: '#3056c4'
  primary: '#002576'
  on-primary: '#ffffff'
  primary-container: '#0038a8'
  on-primary-container: '#96adff'
  inverse-primary: '#b6c4ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fecc00'
  on-secondary-container: '#6e5700'
  tertiary: '#62000a'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c0014'
  on-tertiary-container: '#ff918b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164f'
  on-primary-fixed-variant: '#093cab'
  secondary-fixed: '#ffe089'
  secondary-fixed-dim: '#f0c100'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930015'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  card-gap: 12px
---

## Brand & Style

The design system is built to evoke the spirit of *Bayanihan*—the Filipino tradition of community unity and cooperation. It targets the local neighborhood experience, blending the reliability of a professional marketplace with the warmth of a community gathering. 

The aesthetic follows a **Modern/Corporate** foundation infused with **Tactile** warmth. It prioritizes high legibility and clear information architecture to serve as a trustworthy platform for jobs and trade, while using soft geometry and vibrant accents to maintain an approachable, "kapitbahay" (neighborly) feel. The emotional response should be one of immediate familiarity, safety, and cultural pride.

## Colors

The palette is rooted in the national identity but refined for a digital interface. 
- **Deep Philippine Blue (#0038A8):** Used for primary actions, navigation, and headers to establish authority and trust.
- **Sun Yellow (#FFCD00):** An energetic accent for secondary actions, highlights, and status indicators.
- **Festive Red (#CE1126):** Reserved for urgent notifications, error states, and high-impact "sale" or "urgent" tags.
- **Warm White Background:** We avoid stark pure whites in favor of slightly tinted neutrals (#F9F7F2) to create a more welcoming, paper-like surface that reduces eye strain during long browsing sessions.

## Typography

This design system utilizes a dual-font strategy. **Montserrat** provides a bold, confident voice for headlines and branding, while **Inter** ensures maximum readability for dense information like job descriptions and marketplace listings.

Special attention is given to the **Price Display** role to ensure the ₱ symbol and numerical values are prominent. When displaying Tagalog greetings (e.g., "Magandang Umaga!"), use `display-sm` with a Primary Blue color to make the user feel personally welcomed.

## Layout & Spacing

The layout is optimized for mobile-first consumption using a **Fluid Grid** model. 
- **Margins:** A standard 16px lateral margin ensures content doesn't bleed into the screen edges.
- **Card-Based Architecture:** Information is encapsulated in cards with 12px vertical gaps to create a clear "feed" experience typical of community apps.
- **Touch Targets:** Interactive elements must maintain a minimum 44x44px hit area, utilizing `md` (16px) padding for buttons and input fields to accommodate all users.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers**. 
- **Level 0 (Background):** Neutral Warm White.
- **Level 1 (Cards/Inputs):** White surfaces with a very soft, diffused shadow (Y: 2px, Blur: 8px, Opacity: 4% Black).
- **Level 2 (Floating Actions/Modals):** More pronounced shadows (Y: 4px, Blur: 16px, Opacity: 8% Primary Blue) to signify they sit atop the main interface.

Avoid harsh borders; use subtle 1px inner strokes in a light gray-blue tint to define boundaries on white backgrounds if shadows aren't sufficient.

## Shapes

The shape language is deliberately soft to project friendliness. 
- **Standard UI Elements:** (Buttons, Inputs) use a `rounded-md` base of 8px.
- **Container Elements:** (Marketplace Cards, Community Posts) use `rounded-lg` (16px) or `rounded-xl` (24px) to create a modern, "app-like" feel that distinguishes the content from the background.
- **Avatars:** Always circular to emphasize the "person-to-person" nature of the community.

## Components

- **Buttons:** Primary buttons use Deep Philippine Blue with white text and 16px corner radius. Secondary buttons use a Sun Yellow background with Blue text for high-energy interactions (e.g., "Post an Ad").
- **Marketplace Cards:** Feature a prominent image area with a 16px top corner radius, a price tag using the `price-display` token in the bottom right, and a "Verified" badge for trusted sellers.
- **Input Fields:** Soft-tinted backgrounds with 12px padding. Focus states should use a 2px Primary Blue border.
- **Chips/Tags:** Use for categories like "Part-time," "For Sale," or "Free." Use Sun Yellow for highlights and light gray for neutral filters.
- **Status Indicators:** Use Festive Red for "Urgent Hiring" or "Sold Out" tags to ensure they catch the eye immediately.
- **Icons:** Use rounded, 2px stroke line icons. Avoid sharp corners in iconography to match the overall soft shape language.