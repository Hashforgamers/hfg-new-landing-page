// Content for the home page. FAQ entries here also feed the FAQPage JSON-LD,
// so the visible answers and the structured data never drift apart.

// "Choose your path" cards under the hero: one entry point per audience.
export const JOURNEYS = [
  {
    id: "gamer",
    kicker: "Players",
    title: "I'm a",
    highlight: "gamer",
    shine: ["#ff3d8b", "#ffb36b"],
    body: "Join daily tournaments, book a PC or console near you and earn HashCoins.",
    cta: "Join a tournament",
    image: "/gta6-miami-sunset.jpg",
    tint: "from-[#ff3d8b]/90",
    curtain: "from-[#ff3d8b] to-[#ff9a3d]",
  },
  {
    id: "cafe",
    kicker: "Cafe owners",
    title: "I own a",
    highlight: "gaming cafe",
    shine: ["#ff9a3d", "#ffe27a"],
    body: "Get bookings, run every PC with the kiosk and manage it all from one dashboard.",
    cta: "List my cafe",
    image: "/images/dashboard/overview.webp",
    tint: "from-[#ff9a3d]/90",
    curtain: "from-[#ff9a3d] to-[#ffd23d]",
  },
  {
    id: "franchise",
    kicker: "Investors",
    title: "I want a",
    highlight: "franchise",
    shine: ["#a78bfa", "#ff6fae"],
    body: "Open a Hash-branded cafe with setup help, launch marketing and tournaments.",
    cta: "Explore the franchise",
    image: "/images/kiosk/launcher.webp",
    tint: "from-[#7c3aed]/90",
    curtain: "from-[#7c3aed] to-[#ff3d8b]",
  },
];

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
  "10K+ users",
  "4.7★ rated",
  "35+ cafes",
  "15+ tournaments",
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

// Cafe dashboard tour. Customer names and phone numbers in the Gamers screenshot are sample data.
export const DASHBOARD_SCREENS = [
  {
    id: "overview",
    title: "Live floor",
    body: "See today's bookings, live sessions and open slots at a glance, and book a walk-in in two clicks.",
    image: "/images/dashboard/overview.webp",
    alt: "Hash cafe dashboard overview with quick booking slots, live sessions and upcoming bookings",
  },
  {
    id: "consoles",
    title: "Every console",
    body: "Link your PCs, PlayStations, Xboxes, VR and racing rigs. Track which are free and manage them remotely.",
    image: "/images/dashboard/consoles.webp",
    alt: "Hash cafe dashboard gaming consoles page listing linked PCs with status and controls",
  },
  {
    id: "gamers",
    title: "Know your gamers",
    body: "Spend, visits and loyalty tier for every customer, so you know who your regulars are.",
    image: "/images/dashboard/gamers.webp",
    alt: "Hash cafe dashboard customer list with total slots, revenue and loyalty tier per gamer",
  },
  {
    id: "pricing",
    title: "Your prices",
    body: "Set slot rates per console type, run offers and squad pricing, and change them any time.",
    image: "/images/dashboard/pricing.webp",
    alt: "Hash cafe dashboard console pricing page with per-slot rates for PC, PlayStation, Xbox and VR",
  },
];

export const KIOSK_POINTS = [
  {
    title: "Locked until they pay",
    body: "Each PC stays on the Hash lock screen. Gamers start by scanning a QR in the app or typing their booking code.",
  },
  {
    title: "A launcher gamers love",
    body: "Installed games are detected automatically and shown console-style with cover art and the time left.",
  },
  {
    title: "Staff stay in control",
    body: "Add 15, 30 or 60 minutes or end a session from the desk. The PC locks itself when time runs out.",
  },
];

export const MARKET_CATEGORIES = [
  { title: "Headsets", body: "Hear every footstep." },
  { title: "Mice", body: "Lightweight, low-latency aim." },
  { title: "Keyboards", body: "Mechanical, hot-swap, RGB." },
  { title: "Monitors", body: "High refresh for ranked nights." },
  { title: "Controllers", body: "For console and fighting games." },
  { title: "Chairs & desks", body: "Sit right through long sessions." },
];

// Logos are monochrome marks from Simple Icons (public/images/brands). Each is the trademark of its
// owner: keep only brands Hash actually stocks or has permission to show.
export const MARKET_BRANDS = [
  { name: "ASUS", logo: "asus" },
  { name: "ROG", logo: "republicofgamers" },
  { name: "Razer", logo: "razer" },
  { name: "Logitech G", logo: "logitechg" },
  { name: "HyperX", logo: "hyperx" },
  { name: "SteelSeries", logo: "steelseries" },
  { name: "Corsair", logo: "corsair" },
  { name: "MSI", logo: "msi" },
  { name: "Cooler Master", logo: "coolermaster" },
  { name: "Redragon", logo: "redragon" },
];

// Draft positioning for the franchise offer. Confirm every row against the real franchise terms.
// `own` and `franchise` are true/false, or a short string when the answer needs a qualifier.
export const FRANCHISE_ROWS = [
  { label: "You own and run the cafe", own: true, franchise: true },
  { label: "Listed on the Hash app for bookings", own: "After onboarding", franchise: "From day one" },
  { label: "Hash kiosk app and cafe dashboard", own: "Set up yourself", franchise: "Installed and configured" },
  { label: "Hash branding, signage and interior design", own: false, franchise: true },
  { label: "Setup plan and equipment sourcing help", own: false, franchise: true },
  { label: "Launch marketing to gamers nearby", own: false, franchise: true },
  { label: "Official Hash tournaments at your venue", own: false, franchise: true },
  { label: "Staff training and operating playbook", own: false, franchise: true },
  { label: "Priority support", own: false, franchise: true },
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
    a: "Sign up at onboard.hashforgamers.com: verify your email with an OTP, add your cafe details and documents, and go live. Listed cafes get bookings, tournament hosting tools and visibility to players nearby.",
  },
];
