# Hash For Gamers — Master Design Prompt

Paste the block below at the start of any request to an AI tool (Claude, ChatGPT, Gemini, v0, Lovable, Figma AI, Midjourney for layouts) or hand it to a designer. It describes the design language used on hashforgamers.com so new pages, app screens, posts and decks match. Full details are in [`BRAND_KIT.md`](BRAND_KIT.md); exact values in [`tokens.json`](tokens.json).

---

```text
You are designing for HASH FOR GAMERS, India's tournament-first gaming app: esports tournaments,
gaming cafe bookings, squads and HashCoins rewards for players, plus a dashboard, a PC kiosk and a
franchise for gaming cafe owners. Follow this design language exactly.

MOOD
Cinematic, GTA-style "Vice city at sunset" energy meets a console game launcher. Dark, bold,
confident, premium. Neon sunset over a black page. Never corporate, never pastel, never cluttered.

AUDIENCES (never mix them in one section)
- Gamers: tournaments, cafe bookings, HashCoins. Colour cue pink -> orange.
- Cafe owners: more players, less admin (bookings, kiosk, dashboard). Colour cue orange -> yellow.
- Franchise investors: open a Hash-branded cafe. Colour cue purple -> pink.

COLOUR
- Background black #000000; alternate sections night #0b0414.
- Pink #ff3d8b (primary accent), orange #ff9a3d (eyebrows, numbers, links), yellow #ffd23d,
  purple #7c3aed, success green #16ff7a, error red #ff6b6b.
- Brand gradient: pink -> orange -> yellow, left to right. Use on the second line of headlines,
  big numbers and the closing CTA panel only.
- Text: white for headlines; 75% white for body; 60% / 45% for secondary. Black text on pink or gradient.
- Ambient glow: blurred pink or purple circles (~20% opacity) in section corners.
- At most one solid colour band per section (e.g. a full pink band for "How it works").

TYPOGRAPHY (three fonts, fixed roles)
- Anton: all headlines, card titles, big numbers and button labels. UPPERCASE, line-height 0.85-0.9.
  Headlines are two lines: line 1 white, line 2 in the brand gradient.
- Inter: all paragraphs and form text. Sentence case, 16-18px, line-height ~1.7.
- Orbitron (600): only small HUD-style text. UPPERCASE, 10-11px, letter-spacing 0.2-0.3em.
  Use for eyebrows above headlines (orange), kickers like "01 · PLAYERS", nav links, stat and
  chart captions.

LAYOUT
- Max width 1600px (landing), 1500px (inner pages), 1300px (legal). Gutters 16px mobile, 32px desktop.
- Generous vertical space (~96px per section). Big type, few words, one idea per section.
- Mobile first: no horizontal scroll, tap targets >= 44px, Play Store and App Store buttons side by side.

COMPONENTS
- Primary button: white pill, black Anton uppercase label; hover turns pink with white text.
- Secondary button: transparent pill with 40% white border; hover fills white.
- Store buttons: both say "Get it on" (Google Play / App Store), always side by side.
- Cards: 16px radius, 10% white border, faint white gradient fill, Orbitron number kicker,
  Anton title, Inter body; tilt toward the cursor and glow pink on hover.
- Feature tiles: full-bleed image or app screenshot with a colour gradient from the bottom-left.
- Ticker: pink band with black Anton text, scrolling stats and slogans.
- Scroll bands: two giant Anton rows sliding in opposite directions, one white, one pink outline.
- Product shots: phone screenshots in rounded frames tilted 3-6 degrees with deep shadows;
  web dashboards inside a browser frame with traffic-light dots.
- Stats: Orbitron caption above an Anton number.
- Form fields: 12px radius, 6% white fill, 15% white border, pink focus border, Orbitron label.

MOTION
- Easing cubic-bezier(0.22, 1, 0.36, 1) for reveals; cubic-bezier(0.76, 0, 0.24, 1) for wipes.
- Headline words slide up from a mask; cards wipe in from the bottom with 60-120ms stagger.
- Parallax: backgrounds drift slower than the page, devices drift the other way.
- Smooth scrolling with a gradient progress bar. Hover: tilt, lift 10px, pink glow.
- No autoplay audio. Respect prefers-reduced-motion by disabling all animation.

IMAGERY
- Neon sunset cities, palm trees, night highways; real Hash app, dashboard and kiosk screenshots.
- Always under a dark gradient so text reads. No generic stock photos, no unlicensed game art.

VOICE
- Short, punchy, gamer-native: "Compete. Book. Win." "Fill every seat." "Get in the game."
- Speak to one audience at a time. Indian context: rupees, lakh/crore, Indian cities.
- Honest: label estimates, say "coming soon" when it is, never invent numbers or testimonials.

ACCESSIBILITY
- WCAG AA contrast, aria-labels on icon buttons, visible focus states, one h1 per page,
  ordered headings, empty alt on decorative images.

BRAND FACTS YOU MAY USE
10K+ users · 4.7★ rated · 35+ cafes · 15+ tournaments · Free on Android and iOS · Made in India.
Website: www.hashforgamers.com · Cafe onboarding: onboard.hashforgamers.com ·
Contact: onboarding@hashforgamers.com

When unsure, choose: darker, bolder, fewer words, bigger type.
```

---

## For developers (Next.js + Tailwind)

Add this after the block above when asking an AI to write code for this repo:

```text
Stack: Next.js App Router, Tailwind CSS v4, framer-motion, Lenis. Fonts are loaded in
src/app/layout.js; use the utilities font-display (Anton), font-body (Inter), font-tech (Orbitron).
Reuse components from src/components/landing/: PageHero, InfoCards, MaskHeading, Reveal, WipeReveal,
FadeUp, RevealLine, Parallax, TiltCard, StoreButtons. Put copy in src/lib/landing.js. Page metadata
uses buildPageMetadata from src/lib/site.js. Tag CTAs with data-track="event_name" for analytics.
Every animation must respect prefers-reduced-motion.
```
