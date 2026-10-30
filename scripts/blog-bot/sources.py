"""Where the blog bot looks for stories.

FEEDS are publisher RSS feeds with direct article links. SEARCHES are Bing News RSS queries, which
cover the India-specific topics no single feed does; Bing wraps each link and the real article URL is
in its `url` query parameter.
"""

FEEDS = [
    ("PC Gamer", "https://www.pcgamer.com/rss/"),
    ("Eurogamer", "https://www.eurogamer.net/feed"),
    ("Polygon", "https://www.polygon.com/rss/index.xml"),
    ("Inc42", "https://inc42.com/feed/"),
    ("IGN", "https://feeds.feedburner.com/ign/all"),
    ("GameSpot", "https://www.gamespot.com/feeds/mashup/"),
    ("Kotaku", "https://kotaku.com/rss"),
    ("Rock Paper Shotgun", "https://www.rockpapershotgun.com/feed"),
    ("VGC", "https://www.videogameschronicle.com/feed/"),
    ("Dexerto", "https://www.dexerto.com/feed/"),
    ("GamesIndustry.biz", "https://www.gamesindustry.biz/feed"),
    ("TouchArcade", "https://toucharcade.com/feed/"),
]

# (category, query). Categories must match BLOG_CATEGORIES in src/lib/blog.js.
SEARCHES = [
    ("gta", "GTA 6 Rockstar"),
    ("esports", "Indian esports"),
    ("esports", "BGMI tournament"),
    ("esports", "Valorant India esports"),
    ("business", "Nazara Technologies"),
    ("business", "esports funding India"),
    ("business", "gaming startup India funding"),
    ("cafes", "gaming cafe India"),
    ("hardware", "graphics card price India"),
    ("industry", "video game industry news"),
    ("games", "new game releases this week"),
    ("games", "PlayStation 5 news"),
    ("games", "Xbox news"),
    ("games", "Nintendo Switch 2"),
    ("mobile", "mobile gaming India"),
    ("mobile", "Free Fire India"),
    ("esports", "Esports World Cup"),
]

BING_NEWS_RSS = "https://www.bing.com/news/search?q={query}&format=rss&setlang=en-IN&cc=IN"

# Feed items must mention at least one of these to be considered (publisher feeds are broad).
RELEVANT = [
    "game", "gaming", "esports", "e-sports", "gta", "rockstar", "bgmi", "pubg", "valorant", "free fire",
    "playstation", "ps5", "xbox", "nintendo", "steam", "gpu", "graphics card", "nvidia", "amd", "intel arc",
    "nazara", "krafton", "riot", "tournament", "console", "cafe", "switch", "roblox", "minecraft",
    "fortnite", "call of duty", "review", "trailer", "release date", "mobile",
]
