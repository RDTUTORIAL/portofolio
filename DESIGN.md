---
name: Danis Portfolio
description: A tactile hand-drawn paper world for spatial portfolio experiences and lightweight profile surfaces.
colors:
  ink: "#17191d"
  muted-ink: "#555b64"
  paper: "#f7f7f3"
  paper-raised: "#fcfcf8"
  graphite-line: "#a5adb8"
  blueprint: "#315fbe"
  blueprint-night: "#0b1118"
  blueprint-light: "#82aaf7"
typography:
  display:
    fontFamily: "Card Rubik Scribble, Rubik Scribble, sans-serif"
    fontSize: "clamp(3rem, 18vw, 4.8rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.42
  label:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 700
    lineHeight: 1
  root:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.42
  role:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "clamp(1.25rem, 5.8vw, 1.6rem)"
    fontWeight: 700
    lineHeight: 1.04
  headline:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "clamp(1.8rem, 8vw, 2.3rem)"
    fontWeight: 700
    lineHeight: 1
  story:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "clamp(1.3rem, 6.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.08
  detail:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.2
  compact:
    fontFamily: "Card Cabin Sketch, Cabin Sketch, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.42
rounded:
  action: "15px"
  skip-link: "10px"
  compact-control: "999px"
  desktop-sheet: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  page-gutter: "20px"
  section: "32px"
components:
  primary-action:
    backgroundColor: "{colors.blueprint}"
    textColor: "{colors.paper-raised}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14px 17px"
    height: "56px"
  compact-control:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.compact-control}"
    padding: "10px 15px"
    height: "46px"
  link-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "0"
    padding: "10px 3px"
    height: "70px"
---

# Design System: Danis Portfolio

## Overview

**Creative North Star: "The Living Sketchbook"**

The interface feels like Danis' drawings have become a navigable place. Paper texture, imperfect ink lines, local sketch lettering, and illustrated characters carry the identity. Digital controls remain obvious and responsive, but their physical press and offset depth make them belong to the same world.

The main portfolio can use spatial WebGL, while lightweight surfaces preserve the same personality through real artwork and tactile CSS. Expression is concentrated in one memorable illustrated moment. Information, actions, and accessibility remain direct.

**Key Characteristics:**

- Real hand-drawn artwork leads the composition.
- Paper and graphite form the neutral foundation.
- Blueprint blue is the only chromatic accent.
- Controls feel pressed, not glowing.
- Motion welcomes or confirms; it does not decorate every element.

## Colors

The palette is cold paper and graphite with one blueprint-blue voice.

### Primary

- **Blueprint Cobalt:** Owns primary actions and one major visual field per surface.

### Secondary

- **Blueprint Light:** Preserves the same accent family in dark mode.
- **Blueprint Night:** Carries dark-mode stage and environmental depth.

### Neutral

- **Graphite Ink:** Primary text, icon, and structural mark color.
- **Muted Graphite:** Secondary text that still meets readable contrast.
- **Cool Paper:** Default content surface and texture base.
- **Raised Paper:** Small controls and emphasized paper surfaces.
- **Pencil Line:** Sparse dividers and edge definition.

### Named Rules

**The One-Ink Rule.** Blueprint is the only accent family. New semantic colors appear only for a real success or error state.

**The Paper Stays Paper Rule.** Texture supports the subject's physical world and never becomes a generic grain overlay.

## Typography

**Display Font:** Rubik Scribble (with a sans-serif fallback)  
**Body Font:** Cabin Sketch (with a sans-serif fallback)

**Character:** The display face makes the name unmistakable. Cabin Sketch carries readable copy and controls without leaving the illustrated world.

### Hierarchy

- **Display:** The name or one decisive page statement only.
- **Headline:** Bold Cabin Sketch for short section titles.
- **Body:** Regular Cabin Sketch with relaxed line height and a compact reading measure.
- **Label:** Bold Cabin Sketch for actions and destinations.

### Named Rules

**The Scribble Is a Signature Rule.** Rubik Scribble is reserved for identity-scale display text, never paragraphs or utility labels.

## Layout

The 3D experience may occupy the full dynamic viewport. Lightweight routes use a mobile-first single column with safe-area padding and normal vertical scrolling. On larger screens the same complete surface stays centered at a narrow reading width; it is never hidden behind a desktop warning or fake device bezel.

Spacing follows a four-to-eight-pixel rhythm. Interactive groups stay tight, while major sections receive visibly more separation. Content collapses to one column below 768px without horizontal gesture requirements.

## Elevation & Depth

Depth is physical and structural. Important paper surfaces use an offset shadow plus a soft ambient falloff. List rows remain flat and use sparse pencil dividers. Colored outer glows and glass effects do not belong to this world.

### Shadow Vocabulary

- **Floating Sheet:** A directional offset paired with a broad soft shadow for a paper surface above the stage.
- **Pressed Action:** A small tinted shadow that compresses as the control is pressed.

### Named Rules

**The One Elevation Signal Rule.** A component uses either a border or a shadow as its primary edge signal, not both.

## Shapes

Large paper fields can use irregular clipped edges when they behave as artwork. Standard actions use softly curved corners. Compact utility controls may use a pill because their small size and isolated role make the shape functional. The narrow desktop sheet uses a larger radius; the mobile sheet meets the viewport edge.

## Components

### Buttons

- **Shape:** Soft action corners for primary controls; pill only for compact utilities.
- **Primary:** Blueprint fill, high-contrast text, full-width mobile presentation, and a minimum 56px height.
- **Hover / Focus:** A slight lift on precise pointers and a visible solid focus outline.
- **Active:** Compresses by a few pixels to acknowledge touch.

### Cards / Containers

- **Corner Style:** The page sheet is edge-to-edge on mobile and softly rounded on wider screens.
- **Background:** Cool paper with a real paper texture at low opacity.
- **Shadow Strategy:** Only the desktop sheet and primary action receive elevation.
- **Internal Padding:** Mobile gutters remain between 16px and 20px, plus safe-area insets.

### Navigation

Link destinations are semantic anchors in a flat list. Each row provides a clear label, factual handle or action description, a 70px touch target, and visible focus. The list does not become a grid of icon cards.

### Waving Profile Moment

The existing character artwork enters from the right against one clipped blueprint field. It performs the welcome once, remains visible from the first paint, and becomes static under reduced motion.

## Do's and Don'ts

### Do:

- **Do** reuse real portfolio artwork and local fonts before inventing new visual assets.
- **Do** keep primary actions visible in the first mobile viewport.
- **Do** maintain 44px or larger touch targets and safe-area spacing.
- **Do** support both paper-light and blueprint-dark themes.
- **Do** keep copy factual and tied to portfolio evidence.

### Don't:

- **Don't** turn the system into a generic glass card or neon technology theme.
- **Don't** load WebGL, audio, custom cursors, or heavy texture preloads on lightweight routes.
- **Don't** use equal icon-card grids as the default information structure.
- **Don't** add unconfirmed contact details, metrics, clients, or availability claims.
- **Don't** hide useful content based on user-agent detection.
