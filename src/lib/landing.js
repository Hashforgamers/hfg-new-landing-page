// Content for the home page. FAQ entries here also feed the FAQPage JSON-LD,
// so the visible answers and the structured data never drift apart.

export const FEATURES = [
  {
    id: "tournaments",
    kicker: "01 / Compete",
    title: "Tournaments",
    body: "Daily esports tournaments and contests with real brackets, live results, rankings and prize pools. Register solo or with your squad in seconds.",
    image: "/images/app/tournaments.webp",
    alt: "Hash app Compete tab showing a live BGMI tournament and upcoming tournaments",
    fit: "contain",
    accent: "from-fuchsia-600/80",
    size: "lg",
  },
  {
    id: "cafes",
    kicker: "02 / Play IRL",
    title: "Gaming Cafes",
    body: "Find gaming cafes near you, compare PC and console setups, and lock your slot before you leave home.",
    image: "/images/app/cafes-near-you.webp",
    alt: "Hash app showing verified gaming cafes near you with directions",
    fit: "contain",
    accent: "from-orange-500/80",
    size: "md",
  },
  {
    id: "squads",
    kicker: "03 / Squad Up",
    title: "Teams",
    body: "Create a team, share an invite link and roll into tournaments together.",
    image: "/gta6-miami-sunset.jpg",
    accent: "from-sky-500/80",
    size: "tall",
  },
  {
    id: "rewards",
    kicker: "04 / Earn",
    title: "Rewards",
    body: "Every match, booking and referral earns you HashCoins you can spend on passes, offers and gear.",
    accent: "from-amber-400/90",
    size: "sm",
  },
  {
    id: "passes",
    kicker: "05 / Save",
    title: "Game Passes",
    body: "Buy playtime in bundles and save on every cafe session.",
    accent: "from-emerald-500/80",
    size: "sm",
  },
  {
    id: "wallet",
    kicker: "06 / Pay",
    title: "Wallet",
    body: "One wallet for entry fees, bookings and payouts, with clear invoices.",
    accent: "from-violet-600/80",
    size: "sm",
  },
  {
    id: "profile",
    kicker: "07 / Flex",
    title: "Gamer Profile",
    body: "Your stats, wins and rank on one shareable profile.",
    accent: "from-rose-500/80",
    size: "sm",
  },
];

export const STEPS = [
  { n: "01", title: "Download", body: "Get Hash free on Android or iOS and sign in with your phone number." },
  { n: "02", title: "Pick your fight", body: "Join a tournament or book a gaming cafe slot near you." },
  { n: "03", title: "Play", body: "Get room details or walk in. Your slot and squad are ready." },
  { n: "04", title: "Get paid", body: "Results post, rankings update and rewards land in your wallet." },
];

export const TICKER = [
  "Tournaments live daily",
  "Book gaming cafes near you",
  "Earn HashCoins",
  "Squad up",
  "Free on Android & iOS",
  "Real prize pools",
];

export const GAMES = [
  { name: "BGMI", type: "Battle royale" },
  { name: "Valorant", type: "Tactical FPS" },
  { name: "Free Fire", type: "Battle royale" },
  { name: "EA FC", type: "Football" },
  { name: "Call of Duty Mobile", type: "FPS" },
  { name: "Clash Royale", type: "Strategy" },
  { name: "Tekken", type: "Fighting" },
  { name: "PC & console", type: "At gaming cafes" },
];

export const FAQS = [
  {
    q: "What is Hash For Gamers?",
    a: "Hash For Gamers is a free gaming app for India where you can join esports tournaments, book gaming cafe slots, build a team, and earn HashCoins and rewards.",
  },
  {
    q: "How do I join a gaming tournament on Hash?",
    a: "Download the Hash app, open the Tournaments tab, pick an event, and register solo or with your team. Room details, schedules and results all appear in the app.",
  },
  {
    q: "Can I book a gaming cafe near me with Hash?",
    a: "Yes. Hash shows gaming cafes near you with their PC and console setups and lets you reserve a slot in advance, so it is ready when you arrive.",
  },
  {
    q: "Is the Hash app free?",
    a: "Yes. Hash is free to download on Android and iOS. Some tournaments have an entry fee, and cafe bookings are charged at the cafe's rate.",
  },
  {
    q: "What are HashCoins?",
    a: "HashCoins are Hash's reward points. You earn them by playing, booking and referring friends, and can redeem them on passes, offers and gear.",
  },
  {
    q: "I own a gaming cafe. How do I list it on Hash?",
    a: "Use the List Your Cafe page to apply. Listed cafes get bookings, tournament hosting tools and visibility to players nearby.",
  },
];
