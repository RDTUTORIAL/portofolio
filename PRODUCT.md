# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary visitors are prospective clients, collaborators, and people evaluating Danis' work from a shared portfolio link. They need a fast way to understand the work, open the full portfolio, and choose a public contact channel.

## Product Purpose

Danis' portfolio presents real projects, technical interests, experience, and contact options. The main experience is an interactive 3D portfolio. The `/card` surface provides a lightweight, mobile-first entry point for visitors who need the essential profile and links without loading the WebGL experience.

## Positioning

The portfolio connects a hand-built spatial web experience with practical production work across web engineering, software systems, AI, cybersecurity, IoT, and embedded systems.

## Operating Context

The main site is a Vite and React single-page application with a Three.js portfolio experience. Visitors may also arrive directly at `/card` from a shared URL on a phone. That route must remain useful on larger screens while avoiding the main Three.js bundle and texture preloads.

## Capabilities and Constraints

- The public identity is Danis, with the role "Creative Software Engineer."
- The full portfolio lives at `/`.
- Confirmed public contact channels are GitHub, WhatsApp, Instagram, and Telegram.
- `/card` is a direct URL route and must be mobile-first, touch-friendly, lightweight, and deep-linkable.
- Do not publish an email address, LinkedIn profile, full surname, or other unconfirmed personal details.
- Do not invent availability, metrics, testimonials, client claims, or years of experience for the card.

## Brand Commitments

The public name, avatar artwork, project content, and existing voice belong to Danis. The short confirmed profile line is: "Web engineering at the core, with curiosity stretching into AI, cybersecurity, IoT, and embedded systems."

## Evidence on Hand

- Public profile and structured data in `index.html`.
- Role, profile copy, and technical interests in `src/components/canvas/rooms/About/InfiniteSkyManager.jsx`.
- Public social links in `src/components/canvas/rooms/Contact/ContactRoom.jsx`.
- Existing profile artwork and portfolio imagery under `public/`.
- Project records in `src/components/canvas/rooms/Gallery/GalleryRoom.jsx` and `src/components/canvas/rooms/Studio/contentData.js`.
- No approved testimonials, public email address, LinkedIn profile, or external performance claims are present.

## Product Principles

- Show real work and confirmed facts.
- Make the shortest path to the portfolio and contact channels obvious.
- Keep the mobile entry fast even when the main experience is graphically rich.
- Preserve the personality of the main portfolio without reproducing its performance cost.
- Keep every essential action accessible by touch, keyboard, and assistive technology.

## Accessibility & Inclusion

The web experience must preserve browser zoom, visible focus, semantic navigation, reduced-motion preferences, safe-area spacing, and readable contrast.
