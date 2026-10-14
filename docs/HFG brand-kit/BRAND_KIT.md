# Hash For Gamers — Brand Kit

The design language of hashforgamers.com: Vice-city sunset energy, console-launcher confidence, built for Indian gamers and the cafes they play in. Use this kit for the website, app screens, social posts, decks and anything built with AI.

Tokens live in [`tokens.json`](tokens.json). The copy-paste brief for designers and AI tools is [`MASTER_PROMPT.md`](MASTER_PROMPT.md).

---

## 1. Brand in one line

**Compete. Book. Win.** Hash is where India's players compete in tournaments, book gaming cafes and earn rewards, and where cafe owners fill every seat.

Three audiences, always kept distinct:

| Audience | Promise | Colour cue |
|---|---|---|
| Gamers | Tournaments, cafe bookings, HashCoins | Pink → orange |
| Cafe owners | More players, less admin (dashboard, kiosk, bookings) | Orange → yellow |
| Franchise investors | Open a Hash-branded cafe with setup help | Purple → pink |

## 2. Logo

- Use the shield logo (`/images/hash-logo.png`) with the **HASH** wordmark set in Anton, uppercase, beside it.
- Sizes: 40–48 px in navigation, 36 px in compact headers. Never smaller than 32 px.
- Clear space: at least half the logo's width on every side.
- Place it on dark backgrounds only. Don't recolour, stretch, outline, add effects or put it on busy imagery without a dark overlay.

## 3. Colour

Dark first. The page is black; colour is light that hits it.

| Token | Hex | Use |
|---|---|---|
| Pink | `#ff3d8b` | Primary accent, hover fills, highlight bands |
| Orange | `#ff9a3d` | Eyebrows, numbers, links |
| Yellow | `#ffd23d` | End of the brand gradient, glints |
| Purple | `#7c3aed` | Franchise path, ambient glows |
| Green | `#16ff7a` | Success, profit, live states |
| Red | `#ff6b6b` | Losses and errors |
| Black | `#000000` | Base background |
| Night | `#0b0414` | Alternate section background |
| White | `#ffffff` | Text at 100% (headlines), 75% (body), 60% / 45% (secondary) |

**Brand gradient:** pink → orange → yellow, left to right. Use it for the second line of a headline, big numbers and the closing CTA panel. Never on body text.

**Ambient glow:** soft blurred circles of pink or purple (20–25% opacity, ~140 px blur) at section corners.

Rules:
- One solid colour band per page section at most (the pink "How it works" band is the model).
- Text on pink or the gradient is **black**, never white.
- Keep contrast at WCAG AA: body text never below 60% white on black.

## 4. Typography

Three fonts, three jobs. Never swap roles.

| Role | Font | Style |
|---|---|---|
| Display | **Anton** | UPPERCASE, tight leading (0.85–0.9). Headlines, card titles, big numbers, buttons. |
| Body | **Inter** | Sentence case, 16–18 px, line-height 1.6–1.75. All paragraphs and form text. |
| Tech | **Orbitron** 600 | UPPERCASE, 10–11 px, tracking 0.2–0.3em. Eyebrows, kickers ("01 · PLAYERS"), nav links, stat and chart captions. |

Headline pattern: two lines. First line white, second line in the brand gradient.
> COMPETE.
> **BOOK. WIN.** ← gradient

Eyebrow above every section headline, in Orbitron and orange: `FOR GAMING CAFE OWNERS`.

## 5. Layout

- Max widths: 1600 px landing sections, 1500 px inner pages, 1300 px legal pages.
- Gutters 16 px mobile / 32 px desktop. Sections breathe: ~96 px top and bottom.
- Big type, few words. One idea per section.
- Mobile first: no horizontal scrolling, store buttons side by side, tap targets ≥ 44 px.

## 6. Components

| Component | Spec |
|---|---|
| **Primary button** | White pill, black Anton uppercase text; hover → pink fill, white text. |
| **Secondary button** | Transparent pill, 40% white border; hover → white fill, black text. |
| **Store buttons** | Both read "Get it on" + Google Play / App Store; side by side on every screen size. |
| **Card** | 16 px radius, 10% white border, faint white gradient fill, Orbitron number kicker, Anton title, Inter body. Tilts toward the pointer. |
| **Feature tile** | Full-bleed image or app screenshot, colour gradient from the bottom-left, kicker + Anton title + one line. |
| **Path card** | Three-up chooser: lead-in ("I'm a") small, keyword ("GAMER") large in a shining gradient. |
| **Ticker** | Pink band, black Anton text, scrolling: stats first (10K+ users · 4.7★ · 35+ cafes · 15+ tournaments). |
| **Scroll band** | Giant Anton rows sliding opposite ways: one solid white, one pink outline. |
| **Device frame** | App screenshots in rounded phone frames, tilted ±3–6°, with deep shadows. Web dashboards in a browser frame with traffic-light dots. |
| **Stat** | Orbitron caption above, Anton number below. |
| **Form field** | 12 px radius, 6% white fill, 15% white border, pink border on focus, Orbitron label above. |

## 7. Motion

Motion is cinematic but quick. It reveals, it never blocks.

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for reveals; `cubic-bezier(0.76, 0, 0.24, 1)` for wipes.
- **Headlines:** words slide up out of a mask (0.85 s, 60 ms stagger).
- **Cards and tiles:** clip-path wipe from the bottom, or fade-up 40 px; 60–120 ms stagger.
- **Parallax:** backgrounds drift slower than the page; foreground devices drift the other way.
- **Hover:** cards tilt toward the cursor, lift 10 px, glow pink.
- **Scroll:** Lenis smooth scrolling, gradient progress bar at the top.
- **Sound:** one short select sound on path-card hover only. Never autoplay music.
- **Accessibility:** everything turns off under `prefers-reduced-motion`.

## 8. Imagery

- Neon sunset cities, palm trees, night highways: the Vice-city mood.
- Real Hash product shots: app screenshots, the cafe dashboard, the kiosk launcher.
- Always under a dark gradient so text stays readable.
- Avoid stock "person smiling at laptop" photos, other brands' game art as decoration, and anything you don't have rights to.

## 9. Voice

- Short, confident, gamer-native. "Fill every seat." "Get in the game."
- Speak to one audience at a time. Gamers hear tournaments and rewards; owners hear bookings and less admin.
- Indian context: ₹, lakh and crore, Indian cities.
- Honest: label estimates as estimates, say "coming soon" when it is. No invented numbers.
- Sentence case in body copy; headlines in uppercase via the display font.

## 10. Accessibility checklist

- Contrast AA or better; never grey text below 60% white on black.
- Every icon-only control has an `aria-label`; decorative images have empty `alt`.
- Visible focus rings; keyboard reaches every action.
- One `h1` per page; headings in order.
- Reduced-motion users get the same content without animation.

## 11. Where it lives in code

| Thing | File |
|---|---|
| Fonts (Anton, Inter, Orbitron) | `src/app/layout.js` |
| `.font-display`, `.font-body`, `.font-tech`, shine, ticker | `src/app/globals.css` |
| Copy and content lists | `src/lib/landing.js` |
| Page hero, info cards, buttons, reveals, parallax, tilt | `src/components/landing/` |
