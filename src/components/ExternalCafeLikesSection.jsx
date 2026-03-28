'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, MapPin, Search, Star } from 'lucide-react';
import { db } from '@/lib/firebase-client';

const MAX_CAFES = 12;
const FALLBACK_CAFE_IMAGES = [
  "/images/cafe-fallbacks/cafe-fallback-1.jpg",
  "/images/cafe-fallbacks/cafe-fallback-2.jpg",
  "/images/cafe-fallbacks/cafe-fallback-3.jpg",
];

function formatRating(rating) {
  if (rating === null || rating === undefined || Number.isNaN(Number(rating))) {
    return 'NA';
  }

  return Number(rating).toFixed(1);
}

function buildMapsUrl(cafe) {
  const queryText = encodeURIComponent(`${cafe.name} ${cafe.vicinity}`.trim());

  if (cafe.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${queryText}&query_place_id=${encodeURIComponent(
      cafe.placeId
    )}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${queryText}`;
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function buildCafeImageUrl(cafe, index, useFallbackOnly = false) {
  if (cafe.imageUrl) {
    return cafe.imageUrl;
  }

  if (!useFallbackOnly && cafe.placeId) {
    return `/api/place-photo?placeId=${encodeURIComponent(cafe.placeId)}`;
  }

  return FALLBACK_CAFE_IMAGES[index % FALLBACK_CAFE_IMAGES.length];
}

function OverflowText({ text, className = '', marquee = false }) {
  if (!text) return null;

  if (marquee) {
    return (
      <div className={`overflow-hidden whitespace-nowrap ${className}`}>
        <div className="inline-block min-w-full animate-[cafe-marquee_12s_linear_infinite] pr-10">
          {text}
        </div>
      </div>
    );
  }

  return <p className={className}>{text}</p>;
}

export default function ExternalCafeLikesSection() {
  const [cafes, setCafes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCafes() {
      try {
        setLoading(true);
        setError('');

        const cafesQuery = query(
          collection(db, 'cafes_external'),
          where('total_likes', '>', 0),
          orderBy('total_likes', 'desc'),
          limit(MAX_CAFES)
        );

        const snapshot = await getDocs(cafesQuery);
        const nextCafes = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            placeId: data.place_id || doc.id,
            name: data.name || 'Unnamed cafe',
            vicinity: data.vicinity || 'Location unavailable',
            rating: data.rating ?? null,
            totalLikes: Number(data.total_likes || 0),
            lastLikedAt: data.last_liked_at || null,
            imageUrl: data.image_url || data.google_image_url || null,
            photoReference: data.photo_reference || null,
          };
        }).filter((cafe) => cafe.totalLikes > 0);

        if (isMounted) {
          setCafes(nextCafes);
          setFailedImages({});
        }
      } catch (loadError) {
        if (isMounted) {
          setError('Could not load cafes from Firebase right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCafes();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCafes = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return cafes;
    }

    return cafes.filter((cafe) => {
      return (
        cafe.name.toLowerCase().includes(normalized) ||
        cafe.placeId.toLowerCase().includes(normalized)
      );
    });
  }, [cafes, search]);

  const scrollCarousel = (direction) => {
    const container = carouselRef.current;
    if (!container) return;

    const cardWidth = container.clientWidth > 1024 ? 430 : 360;
    container.scrollBy({
      left: direction * cardWidth,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const syncFocusedCard = () => {
      const center = container.scrollLeft + container.clientWidth / 2;
      let nextIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(center - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          nextIndex = index;
        }
      });

      setFocusedIndex(nextIndex);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      container.scrollBy({
        left: event.deltaY,
      });
    };

    syncFocusedCard();
    container.addEventListener('scroll', syncFocusedCard, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('scroll', syncFocusedCard);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [filteredCafes.length]);

  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,#03070b_0%,#061017_45%,#03070b_100%)] px-4 py-14 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_75%_32%,rgba(56,189,248,0.14),transparent_26%)]" />

      <div className="relative mx-auto flex w-full max-w-[1380px] flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#16FF00]">
              Upcoming Cafes
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.1em] text-white sm:text-4xl lg:text-5xl">
              The next cafes players want Hash to own.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              This strip pulls live from Firebase and only shows external cafes that already have real player likes behind them.
            </p>
          </div>

          <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <label className="flex w-full items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-3 text-white/72 backdrop-blur-md sm:max-w-md">
              <Search size={18} className="text-[#16FF00]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="text"
                placeholder="Search cafe name or place id"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel(-1)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:border-[#16FF00]/35 hover:text-[#16FF00]"
                aria-label="Scroll cafes left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel(1)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:border-[#16FF00]/35 hover:text-[#16FF00]"
                aria-label="Scroll cafes right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[10vw] pb-6 pt-3 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] sm:px-[12vw] lg:px-[16vw]"
        >
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="aspect-[16/9] min-w-[340px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.04] sm:min-w-[380px] lg:min-w-[420px]"
              />
            ))}

          {!loading &&
            filteredCafes.map((cafe, index) => {
              const cafeImageUrl = buildCafeImageUrl(cafe, index, Boolean(failedImages[cafe.id]));

              return (
              <article
                key={cafe.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={`group relative aspect-[16/9] min-w-[340px] snap-center overflow-hidden rounded-[26px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] backdrop-blur-md transition-all duration-500 ease-out sm:min-w-[380px] lg:min-w-[420px] ${
                  focusedIndex === index
                    ? 'z-20 scale-100 border-[#16FF00]/35 shadow-[0_28px_90px_rgba(0,0,0,0.42)]'
                    : 'z-0 scale-[0.9] border-white/8 opacity-70 shadow-[0_10px_35px_rgba(0,0,0,0.2)]'
                }`}
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                    focusedIndex === index
                      ? 'opacity-100'
                      : 'opacity-0'
                  } bg-[radial-gradient(circle_at_top,rgba(22,255,0,0.14),transparent_42%)]`}
                />

                <div className="relative h-[64px] overflow-hidden">
                  {cafeImageUrl ? (
                    <img
                      src={cafeImageUrl}
                      alt={cafe.name}
                      className="h-full w-full scale-110 object-cover blur-[1.5px]"
                      onError={() =>
                        setFailedImages((current) => ({
                          ...current,
                          [cafe.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.26),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.24),transparent_24%),linear-gradient(135deg,#081017_0%,#111827_48%,#050505_100%)]" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.6)_100%)]" />

                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-black/30 text-[11px] font-black tracking-[0.1em] text-white backdrop-blur-md">
                      {getInitials(cafe.name)}
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        Upcoming Rank {String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75">
                        Firebase signal
                      </p>
                    </div>
                  </div>

                  <a
                    href={buildMapsUrl(cafe)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/78 backdrop-blur-md transition hover:border-[#16FF00]/35 hover:text-[#16FF00]"
                  >
                    Google Maps
                    <ExternalLink size={10} />
                  </a>

                </div>

                <div className="flex h-[calc(100%-64px)] flex-col justify-between p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <OverflowText
                        text={cafe.name}
                        marquee={cafe.name.length > 26}
                        className="max-w-[270px] text-sm font-black uppercase tracking-[0.03em] text-white"
                      />
                      <p className="mt-1 text-[10px] leading-4 text-white/68">
                        Strong player demand already exists here.
                      </p>
                    </div>

                    <div className="rounded-full border border-[#16FF00]/20 bg-[#16FF00]/10 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#16FF00]">
                      {focusedIndex === index ? 'Active' : 'Upcoming'}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-[0.9fr_0.9fr_1.5fr] gap-2">
                    <div className="rounded-[16px] border border-white/8 bg-black/25 p-2">
                      <div className="flex items-center gap-1.5 text-[#FB7185]">
                        <Heart size={12} />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/58">
                          Likes
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-black text-white">{cafe.totalLikes}</p>
                    </div>

                    <div className="rounded-[16px] border border-white/8 bg-black/25 p-2">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Star size={12} />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/58">
                          Rating
                        </span>
                      </div>
                      <p className="mt-1 text-lg font-black text-white">{formatRating(cafe.rating)}</p>
                    </div>

                    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-2">
                      <div className="flex items-start gap-2 text-white/72">
                      <MapPin size={12} className="mt-0.5 shrink-0 text-cyan-300" />
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
                          Vicinity
                        </p>
                        <OverflowText
                          text={cafe.vicinity}
                          marquee={cafe.vicinity.length > 54}
                          className="mt-1 text-[10px] leading-4"
                        />
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/48">
                    <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">
                      {cafe.placeId}
                    </span>
                    {cafe.lastLikedAt ? (
                      <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">
                        last like {new Date(cafe.lastLikedAt).toLocaleDateString('en-IN')}
                      </span>
                    ) : null}
                    {cafeImageUrl ? (
                      <span className="rounded-full border border-white/8 bg-black/20 px-2 py-1">
                        visual ready
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
              );
            })}
        </div>

        {!loading && !filteredCafes.length ? (
          <div className="rounded-[30px] border border-white/10 bg-black/35 px-6 py-8 text-center text-white/70 backdrop-blur-md">
            {error || 'No liked cafes matched the current filter.'}
          </div>
        ) : null}

        {error && cafes.length > 0 ? (
          <div className="rounded-[28px] border border-amber-300/25 bg-amber-300/10 px-5 py-4 text-sm text-amber-100">
            {error}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes cafe-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
}
