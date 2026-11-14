# Hash For Gamers: links and brand kit

Google ranks pages higher when trusted sites link to them. Work through this list top to bottom; each item takes 5–20 minutes. Tick them off as you go.

## A. Brand profiles (do these first, once)

These make Google treat "Hash", "Hash Gaming" and "hashforgamers" as one brand and show a knowledge panel.

- [ ] **Google Business Profile**: business.google.com → add "Hash For Gamers", category "Software company" (or "Video game store" if you prefer), Mumbai address from your terms page, website https://www.hashforgamers.com, logo, app screenshots. Verify by postcard or video.
- [ ] **Crunchbase**: crunchbase.com → "Add company". Name, website, description, founders, Mumbai, socials.
- [ ] **LinkedIn company page**: make sure the website field is https://www.hashforgamers.com and the tagline matches the site.
- [ ] **Instagram, X, YouTube bios**: same name "Hash For Gamers", same one-line description, and the link https://www.hashforgamers.com (not a Linktree).
- [ ] **Play Store and App Store listings**: developer website = https://www.hashforgamers.com.
- [ ] **Wikidata** (after you have 2–3 news articles about Hash): wikidata.org → create item "Hash For Gamers", instance of "mobile app" / "company", official website, social IDs. Needs independent sources, so do it after section C.

The site's schema now lists all of these as `sameAs`, so once the profiles link back, Google can join them up.

## B. Directories and listings (free, quick links)

- [ ] Tracxn, YourStory company page, Inc42 startup directory (submit your startup)
- [ ] Product Hunt launch ("Hash: book gaming cafes and join esports tournaments in India")
- [x] AlternativeTo (submitted 2026-11-15, pending review) (list Hash as an alternative to Battlefy, Toornament, GGLeap for cafes)
- [ ] G2 / Capterra / SaaSworthy for the cafe software (/gaming-cafe-software)
- [ ] JustDial and Sulekha (gaming software / gaming zone category, Mumbai)
- [ ] Every cafe on Hash: ask them to add their Hash booking link to their Google Business Profile "Book" button and Instagram bio (template in E)

## C. Press pitch (aim for 3–5 articles)

Send to Inc42, YourStory, Entrackr, AFK Gaming, Sportskeeda Esports, IGN India, TechPP, Mid-day (Mumbai).

> **Subject:** GTA 6 launch: Indian gamers can skip the ₹5,999 + console cost at gaming cafes
>
> Hi {name},
>
> GTA 6 launches on 19 November at ₹5,999 in India, and it only runs on PS5 and Xbox Series X|S. For most Indian gamers the real price is a console plus the game.
>
> We're Hash For Gamers, a Mumbai-based app where gamers book PC and console slots at gaming cafes near them and join esports tournaments in BGMI, Valorant, Free Fire, COD Mobile, EA FC, Clash Royale and Tekken. Cafes on Hash are seeing gamers plan GTA 6 sessions by the hour instead of buying hardware.
>
> Happy to share booking data, connect you with cafe owners, or talk about India's gaming cafe economy (our free cost calculator models setup costs at about ₹24.5 lakh for a 12-station cafe): https://www.hashforgamers.com/gaming-cafe-cost-calculator
>
> {your name}, {role}, Hash For Gamers
> https://www.hashforgamers.com

Fill in real numbers from your dashboard before sending (bookings, cafes, cities, tournament players). Journalists link to sources with data.

## D. Community posts (helpful first, link second)

Post as yourself, answer the question fully, and link only where it truly helps. Avoid posting the same text everywhere.

- **r/IndianGaming / r/IndiaTech**: "I worked out what gaming cafes in India charge per hour in 2026 (PC vs PS5, by city)": summary of the price guide, link https://www.hashforgamers.com/blog/gaming-cafe-price-per-hour-india
- **r/BGMI**: "How to join a BGMI custom room safely (and spot fake room scams)": link https://www.hashforgamers.com/blog/bgmi-custom-room-id-password-guide
- **r/GTA6** (launch week): "Official GTA 6 4K wallpapers and the free Leonida map (Nov 19), all in one place": link https://www.hashforgamers.com/blog/gta-6-wallpapers-4k-free-download
- **Quora**: answer "How much does it cost to open a gaming cafe in India?", "Is a gaming cafe profitable in India?", "How to become an esports player in India?" with the numbers from the guides and a link.
- **Discord**: share tournaments in Indian BGMI/Valorant community servers that allow promotion.

## E. Cafe partner message (WhatsApp)

> Hi {cafe}, thanks for being on Hash! Small ask that brings you more bookings: add your Hash booking link to your Google Business Profile ("Book online" / website button) and your Instagram bio. Gamers searching "gaming cafe near me" can then book you directly. Your link: {link}. Thanks!

## F. Ongoing

- Every new partnership, tournament or funding news → short press note + blog post.
- Guest posts: offer "How to start a gaming cafe in India" data pieces to business blogs (Inc42, Entrepreneur India, Franchise India).
- Re-check Search Console monthly: Links report (who links to you) and Performance (queries at position 4–15 are the next pages to improve).

## G. "Book on Hash" badge for cafés

Send this with the message in E. Replace `{cafe-id}` with the café's ID, the same one in its in-app share link `https://www.hashforgamers.com/cafe/{cafe-id}`. That link opens the café in the app, or shows a "get the app" page if Hash isn't installed.

**Dark badge (most café sites):**

```html
<a href="https://www.hashforgamers.com/cafe/{cafe-id}" target="_blank"
   style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;background:#0b0b10;color:#fff;font:600 15px/1 system-ui,sans-serif;text-decoration:none;border:1px solid #2a2a35">
  <img src="https://www.hashforgamers.com/icon.png" alt="" width="20" height="20" style="border-radius:4px">
  Book on Hash For Gamers
</a>
<div style="margin-top:4px;font:12px system-ui,sans-serif;color:#888">
  Powered by <a href="https://www.hashforgamers.com" style="color:inherit">Hash For Gamers</a>
</div>
```

**Light badge (white backgrounds):** same code (keep the "Powered by" line), change `background:#0b0b10;color:#fff;border:1px solid #2a2a35` to `background:#fff;color:#0b0b10;border:1px solid #d9d9e0`.

**Text link (footers, Google Sites, Wix text blocks):**

```html
<a href="https://www.hashforgamers.com/cafe/{cafe-id}">Book a PC or PS5 slot online</a>, powered by <a href="https://www.hashforgamers.com">Hash For Gamers</a>.
```

**Instagram bio / Google Business Profile:** no HTML. Use `https://www.hashforgamers.com/cafe/{cafe-id}` as the bio link or the "Book" button URL, with text like "Book slots on Hash 👇".

Notes for cafés: paste it anywhere on the page (Wix: Embed → Custom code; WordPress: Custom HTML block). Don't add `rel="nofollow"`. Leaving it off is what gives Hash the search-ranking benefit.

## H. Product Hunt launch copy

- **Name:** Hash For Gamers
- **Tagline (≤60):** Book gaming cafes and join esports tournaments in India
- **Description (≤260):** Find gaming cafes near you, book a PC or PS5 slot by the hour, and play BGMI, Valorant and Free Fire tournaments, all in one app. Cafe owners get billing, memberships and bookings in one dashboard.
- **Topics:** Gaming, Esports, Android, iOS, SaaS
- **Maker comment:**
  > Hi Product Hunt! I'm {name}, building Hash from Mira Road, Mumbai. India has thousands of gaming cafes but no way to see which have a free PC tonight. Hash fixes that for gamers, and gives cafe owners software built for Indian cafes instead of imported tools. Would love your feedback, especially from cafe owners and esports organisers.
- **Links:** website https://www.hashforgamers.com · Play Store https://play.google.com/store/apps/details?id=com.hfg.hash · App Store https://apps.apple.com/us/app/hash-gaming-esports-network/id6750488424
- **Pricing:** Free (gamers), Paid (café software)
- **Gallery (1270×760, 4–6 images):**
  1. Hero: phone showing nearby cafés + "Book a gaming café in 30 seconds"
  2. Slot booking screen (PC/PS5, hourly price)
  3. Tournaments list (BGMI, Valorant, Free Fire)
  4. Café owner dashboard: bookings + billing
  5. Free cost calculator (/gaming-cafe-cost-calculator)
  6. Optional 30–60s video: open app → find café → book → join tournament
- **Thumbnail:** app icon (240×240), or a GIF of the booking flow.
- **Launch-day posts:**
  - LinkedIn/X: "Today we launched Hash For Gamers on Product Hunt 🎮 Book gaming cafés by the hour and join esports tournaments across India. Would love your feedback: {PH link}"
  - WhatsApp (cafés + gamer groups): "We're live on Product Hunt today! Check it out and leave a comment if Hash has helped you: {PH link}"
- **Checklist:** set up the PH maker profile a week before (comment on a few launches), schedule the launch in advance, reply to every comment on launch day, post the "Featured on Product Hunt" badge on the site afterwards.
- Launch on a Tuesday–Thursday at 12:01 am PT (1:31 pm IST in winter, 12:31 pm in summer); ask your community to visit, not to "upvote".

## I. More free listings

- [x] Bing Webmaster Tools (already set up, verified 2026-11-15): bing.com/webmasters → Import from Google Search Console (covers Bing, DuckDuckGo, ChatGPT search)
- [ ] Indie Hackers, BetaList, Startup Stash, SaaSHub, Wellfound, GitHub org
- [ ] Startup India (DPIIT) portal
- [ ] Discord listings: Disboard, top.gg, Discadia
- [ ] Liquipedia: add hosted tournaments if they meet notability rules
- [ ] Mumbai Surfer and Tune X: "Made by Hash For Gamers" footer link
- [ ] Journalist requests: Qwoted, Featured.com, Help a B2B Writer
- [ ] Guest posts: Dev.to / Hashnode ("How I built Hash in Flutter")

Avoid paid link packages, link farms and bulk directory services.
