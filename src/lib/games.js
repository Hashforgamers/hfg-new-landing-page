// Per-game tournament pages (/tournaments/[slug]). Copy sticks to how each game's tournaments are
// generally played and what the Hash app actually does; keywords come from Google India autocomplete.

const JOIN_STEPS = (game) => [
  { title: "Get the Hash app", body: "Free on Android and iOS. Sign in with your phone number and set up your profile." },
  { title: `Find a ${game} tournament`, body: `Open the Compete tab and filter by ${game} to see upcoming and live tournaments.` },
  { title: "Register", body: "Join solo or invite your squad with a link. Free and paid entries are marked clearly." },
  { title: "Play and climb", body: "Room details arrive in the app before match time. Results, rankings and rewards follow." },
];

export const TOURNAMENT_GAMES = [
  {
    slug: "bgmi",
    name: "BGMI",
    full: "Battlegrounds Mobile India",
    title: "BGMI Tournament App: Join BGMI Tournaments",
    description:
      "Join BGMI tournaments on the Hash app: free and paid entry, squad registration, custom room ID and password in the app, live points table and results.",
    keywords: ["BGMI tournament", "BGMI tournament app", "BGMI tournament registration", "BGMI custom room", "BGMI tournament free entry", "BGMI tournament today", "BGMI points table"],
    lines: ["BGMI", "tournaments."],
    intro:
      "Daily BGMI tournaments for squads, duos and solo players. Register in the app, get the custom room ID and password before match time, and watch the points table update after every match.",
    format: [
      "Most BGMI tournaments are squad events: four players per team, often with a substitute allowed.",
      "Matches are played in custom rooms across maps such as Erangel, Miramar and Sanhok.",
      "Teams score placement points for where they finish plus finish points for eliminations, and the totals across matches make the points table.",
      "Bigger events run qualifiers before a final; smaller ones finish in a single day.",
    ],
    faqs: [
      { q: "How do I join a BGMI tournament on Hash?", a: "Download the Hash app, open the Compete tab, filter by BGMI and pick a tournament. Register solo or create a squad and invite your teammates with a link." },
      { q: "Are there free entry BGMI tournaments?", a: "Yes. Some BGMI tournaments on Hash are free to enter and some have an entry fee. Every tournament shows whether it is free or paid before you register." },
      { q: "Where do I get the BGMI custom room ID and password?", a: "The room ID and password appear on the tournament page in the Hash app before match time, so your whole squad sees them in one place instead of hunting through group chats." },
      { q: "How does the BGMI tournament points table work?", a: "Each match gives placement points for where your team finishes and finish points for eliminations. The points table adds up every match. Always check the scoring rules on the tournament page, because organisers can use their own table." },
      { q: "Is there prize money in BGMI tournaments on Hash?", a: "Each tournament lists its prize pool and how it is split before you sign up. Rewards for winners go to your Hash wallet, and playing also earns HashCoins." },
      { q: "Can I play BGMI tournaments on iPhone?", a: "Yes. The Hash app is on Android and iOS, and BGMI tournaments are open to players on both." },
    ],
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    full: "Free Fire",
    title: "Free Fire Tournament App: Free Entry",
    description:
      "Join Free Fire tournaments on the Hash app: free and paid entry, squad registration, custom room code in the app, results and rankings after every match.",
    keywords: ["Free Fire tournament", "Free Fire tournament app", "Free Fire tournament registration", "Free Fire custom room", "Free Fire tournament free entry", "Free Fire tournament today"],
    lines: ["Free Fire", "tournaments."],
    intro:
      "Free Fire tournaments for squads and solo players, with registration, custom room details, results and rankings all in the Hash app.",
    format: [
      "Battle royale tournaments usually have squads of four dropping into custom rooms, with placement and elimination points added across matches.",
      "Clash Squad tournaments are shorter 4v4 rounds, often run as brackets.",
      "Many events run several matches in a day and rank teams on one overall leaderboard.",
    ],
    faqs: [
      { q: "How do I join a Free Fire tournament on Hash?", a: "Get the Hash app, open the Compete tab, filter by Free Fire and pick a tournament. Register solo or invite your squad with a link." },
      { q: "Are there free entry Free Fire tournaments?", a: "Yes. Some Free Fire tournaments on Hash are free and some have an entry fee. It is shown clearly on every tournament before you register." },
      { q: "Where do I get the Free Fire custom room code?", a: "The custom room ID and password appear on the tournament page in the Hash app before match time." },
      { q: "When are Free Fire tournaments held?", a: "New tournaments are added every week. Open the Compete tab to see today's and upcoming Free Fire tournaments with their schedules." },
      { q: "How are Free Fire tournament winners decided?", a: "Results are posted in the app after each match, the leaderboard updates, and rewards go to the winners' Hash wallets. Check each tournament's rules tab for its scoring." },
    ],
  },
  {
    slug: "valorant",
    name: "Valorant",
    full: "Valorant",
    title: "Valorant Tournaments in India",
    description:
      "Join Valorant tournaments in India on the Hash app: 5v5 team registration, free and paid entry, schedules, brackets and results, plus PCs to book at gaming cafes.",
    keywords: ["Valorant tournament India", "Valorant tournament", "Valorant tournament registration", "Valorant tournament free entry", "Valorant tournament near me", "upcoming Valorant tournament India"],
    lines: ["Valorant", "tournaments."],
    intro:
      "5v5 Valorant tournaments for Indian teams. Register your five, see the schedule and bracket in the app, and book a gaming PC at a cafe near you if you need one.",
    format: [
      "Valorant is a 5v5 tactical shooter on PC; tournament teams are five players, often with a substitute.",
      "Matches are played in custom games, usually first to 13 rounds, as best-of-one or best-of-three series.",
      "Most events run as single or double elimination brackets, with group stages for larger tournaments.",
    ],
    faqs: [
      { q: "How do I register for a Valorant tournament in India?", a: "Get the Hash app, open the Compete tab, filter by Valorant and pick a tournament. Create your team and invite your teammates with a link." },
      { q: "Are there free entry Valorant tournaments?", a: "Yes. Some Valorant tournaments on Hash are free and some have an entry fee. It is marked on every tournament before you register." },
      { q: "Is there a Valorant tournament near me?", a: "Online Valorant tournaments can be played from anywhere. Hash also lists gaming cafes near you, so you can book PCs for your whole team and play together." },
      { q: "Where can I see the Valorant tournament schedule?", a: "The schedule and bracket are on the tournament page in the Hash app, and match details appear before each game." },
      { q: "What is the prize pool for Valorant tournaments on Hash?", a: "It depends on the tournament. Each one lists its prize pool and how it is split before you sign up, and rewards go to your Hash wallet." },
    ],
  },
  {
    slug: "ea-fc",
    name: "EA FC",
    full: "EA Sports FC",
    title: "EA FC Tournaments in India",
    description:
      "Play EA FC tournaments in India on the Hash app: 1v1 football brackets, free and paid entry, schedules and results, plus PS5s to book at gaming cafes near you.",
    keywords: ["EA FC tournament", "EA FC tournament India", "EA FC tournament near me", "EA FC tournament prize money", "EA FC tournament rules", "FIFA tournament India"],
    lines: ["EA FC", "tournaments."],
    intro:
      "1v1 EA FC tournaments with brackets, schedules and results in the Hash app. Play online or book a PS5 at a gaming cafe near you.",
    format: [
      "EA FC tournaments are usually 1v1, played on PlayStation, Xbox or PC.",
      "Players meet in knockout brackets or groups followed by knockouts, with each tie decided over one or two matches.",
      "Rules set match length, team choice and what happens in a draw, so read them before you register.",
    ],
    faqs: [
      { q: "How do I join an EA FC tournament on Hash?", a: "Get the Hash app, open the Compete tab, filter by EA FC and register for a tournament." },
      { q: "Is there an EA FC tournament near me?", a: "Hash lists gaming cafes near you with PS5s and other consoles, and cafes on Hash host tournaments at their venues. Check the Compete tab for events in your city." },
      { q: "Is there prize money in EA FC tournaments?", a: "Each tournament shows its prize pool and entry fee, if any, before you sign up. Winners' rewards go to their Hash wallet." },
      { q: "What are the usual EA FC tournament rules?", a: "Most set the match length, allowed teams, controller and console rules and what happens in a draw. The rules tab on each Hash tournament has the details." },
      { q: "Can I book a PS5 to play EA FC?", a: "Yes. Book a PS5 or other console at a gaming cafe near you on the Hash app, and your slot is held for you." },
    ],
  },
  {
    slug: "cod-mobile",
    name: "Call of Duty Mobile",
    full: "Call of Duty: Mobile",
    title: "COD Mobile Tournaments: Free Entry",
    description:
      "Join Call of Duty Mobile tournaments on the Hash app: team registration, free and paid entry, match details in the app, results and rankings.",
    keywords: ["COD Mobile tournament", "COD Mobile tournament free entry", "COD Mobile tournament India", "Call of Duty Mobile tournament", "COD Mobile tournament prize money"],
    lines: ["COD Mobile", "tournaments."],
    intro:
      "Call of Duty Mobile tournaments for teams and squads, with registration, match details, results and rankings in one app.",
    format: [
      "Competitive COD Mobile is mostly played in 5v5 multiplayer modes such as Hardpoint and Search and Destroy.",
      "Battle royale tournaments use squads and score placement and eliminations across matches.",
      "Team events usually run as brackets with best-of series in the later rounds.",
    ],
    faqs: [
      { q: "How do I join a COD Mobile tournament on Hash?", a: "Get the Hash app, open the Compete tab, filter by Call of Duty Mobile and register solo or with your team." },
      { q: "Are there free entry COD Mobile tournaments?", a: "Yes. Some are free and some have an entry fee, and each tournament shows which before you register." },
      { q: "Where do I get match details for COD Mobile tournaments?", a: "Room details and the schedule appear on the tournament page in the Hash app before match time." },
      { q: "Is there prize money in COD Mobile tournaments?", a: "Each tournament lists its prize pool and how it is split. Rewards go to the winners' Hash wallets, and playing also earns HashCoins." },
    ],
  },
  {
    slug: "clash-royale",
    name: "Clash Royale",
    full: "Clash Royale",
    title: "Clash Royale Tournaments in India",
    description:
      "Join Clash Royale tournaments in India on the Hash app: 1v1 brackets, free and paid entry, schedules, rules and results, all in one place.",
    keywords: ["Clash Royale tournament", "Clash Royale tournament India", "Clash Royale tournaments to join", "Clash Royale tournament prize money", "Clash Royale tournament rules"],
    lines: ["Clash Royale", "tournaments."],
    intro:
      "1v1 Clash Royale tournaments with brackets, rules and results in the Hash app. Find one to join today.",
    format: [
      "Clash Royale is a 1v1 real-time strategy card game, so tournaments are individual.",
      "Events usually run as knockout brackets, with best-of-three or best-of-five series in later rounds.",
      "Rules can limit deck changes between games, so check them before you register.",
    ],
    faqs: [
      { q: "How do I join a Clash Royale tournament on Hash?", a: "Get the Hash app, open the Compete tab, filter by Clash Royale and register." },
      { q: "Are Clash Royale tournaments free to join?", a: "Some are free and some have an entry fee. Every tournament on Hash shows which, along with the prize pool, before you sign up." },
      { q: "What are common Clash Royale tournament rules?", a: "Rules usually cover the series length, deck changes between games and what to do if a player disconnects. Each Hash tournament has a rules tab." },
      { q: "Do Clash Royale tournaments have prize money?", a: "Each tournament lists its prize pool. Rewards go to winners' Hash wallets, and every match also earns HashCoins." },
    ],
  },
  {
    slug: "tekken",
    name: "Tekken",
    full: "Tekken",
    title: "Tekken Tournaments in India",
    description:
      "Play Tekken tournaments in India on the Hash app: 1v1 brackets online and at gaming cafes, free and paid entry, schedules and results.",
    keywords: ["Tekken tournament", "Tekken tournament India", "Tekken tournament near me", "Tekken 8 tournament", "fighting game tournament near me"],
    lines: ["Tekken", "tournaments."],
    intro:
      "1v1 Tekken tournaments with brackets and results in the Hash app. Play online or at a gaming cafe near you.",
    format: [
      "Tekken tournaments are 1v1, played on PlayStation, Xbox or PC.",
      "Most use double elimination brackets, so a player has to lose twice to be knocked out.",
      "Sets are usually best of three or best of five games, each played to a set number of rounds.",
    ],
    faqs: [
      { q: "How do I join a Tekken tournament on Hash?", a: "Get the Hash app, open the Compete tab, filter by Tekken and register." },
      { q: "Is there a Tekken tournament near me?", a: "Gaming cafes on Hash host tournaments at their venues. Check the Compete tab for events in your city, or book a console at a cafe near you to practise." },
      { q: "What is double elimination in Tekken tournaments?", a: "Players who lose once drop to a losers bracket and can still fight their way back to the grand final. A second loss knocks them out." },
      { q: "Is there prize money in Tekken tournaments?", a: "Each tournament lists its prize pool and entry fee, if any, before you sign up. Winners' rewards go to their Hash wallet." },
    ],
  },
].map((g) => ({ ...g, steps: JOIN_STEPS(g.name) }));

export const getTournamentGame = (slug) => TOURNAMENT_GAMES.find((g) => g.slug === slug);
