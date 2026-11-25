import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Armchair, Bath, Check, Clock, Coffee, CreditCard, Gamepad2, MapPin, Navigation, ParkingCircle, Snowflake, Volume2, Wallet, Wifi } from "lucide-react";
import CafeGallery from "@/components/play/CafeGallery";
import { ShareMenu } from "@/components/play/ProductDetail";
import { OpenBadge } from "@/components/play/CafeDirectory";
import JsonLd from "@/components/JsonLd";
import { withQuery } from "@/lib/verticals";
import CafeBooking from "@/components/play/CafeBooking";
import CafePasses from "@/components/play/CafePasses";
import { CafeCard } from "@/components/play/CafeDirectory";
import { Breadcrumbs, Container, CrossSell, FaqList, SectionHeading, breadcrumbsLd, faqLd } from "@/components/play/parts";
import { loadCafeDetail, loadCafes } from "@/lib/server/ops/booking";
import { SITE_LOGO, SITE_NAME, SITE_URL, buildPageMetadata } from "@/lib/site";
import { BOOK, cafeIdFromSlug, cafeLocality, cafePath } from "@/lib/verticals";

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = String(t).split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const inr = (n) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

function amenityIcon(name) {
  const k = String(name).toLowerCase();
  if (/\bac\b|air ?con/.test(k)) return Snowflake;
  if (/wi-?fi|internet/.test(k)) return Wifi;
  if (/park/.test(k)) return ParkingCircle;
  if (/snack|food|drink|cafe|coffee|bever/.test(k)) return Coffee;
  if (/sound|speaker|audio/.test(k)) return Volume2;
  if (/wash|toilet|rest ?room/.test(k)) return Bath;
  if (/seat|lounge|chair|sofa/.test(k)) return Armchair;
  if (/24/.test(k)) return Clock;
  return Check;
}

async function getData(slug) {
  const id = cafeIdFromSlug(slug);
  if (!id) return null;
  try {
    return await loadCafeDetail(id);
  } catch {
    return null;
  }
}

function priceRange(consoles) {
  const prices = consoles.map((c) => c.pricePerSlot).filter((p) => p > 0);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return buildPageMetadata({ title: "Gaming cafe not found", path: `${BOOK.root}/${slug}`, noIndex: true });
  const { cafe, consoles } = data;
  const locality = cafeLocality(cafe);
  const range = priceRange(consoles);
  const kinds = [...new Set(consoles.map((c) => c.name))].slice(0, 4).join(", ");
  return buildPageMetadata({
    title: `Book ${cafe.name}${locality ? `, ${locality}` : ""}: Slots & Prices`,
    description: `Book ${cafe.name}${cafe.area ? ` in ${cafe.area}` : ""} online with Hash.${kinds ? ` ${kinds}.` : ""}${
      range ? ` From ${inr(range.min)} per slot.` : ""
    } See live slots, opening hours and directions, and pay online or at the cafe.`,
    path: cafePath(cafe),
    image: cafe.images?.[0] || undefined,
    keywords: [`book ${cafe.name}`, `${cafe.name} ${locality}`.trim(), `gaming cafe ${locality}`.trim(), `${cafe.name} price`],
  });
}

export default async function CafePage({ params, searchParams }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { cafe, consoles } = data;
  const canonical = cafePath(cafe);
  if (`${BOOK.root}/${slug}` !== canonical) permanentRedirect(withQuery(canonical, await searchParams));

  const locality = cafeLocality(cafe);
  const range = priceRange(consoles);
  let nearby = [];
  try {
    nearby = (await loadCafes()).filter((c) => c.id !== cafe.id && c.state && c.state === cafe.state).slice(0, 4);
  } catch {}
  const mapsUrl =
    cafe.lat && cafe.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name} ${cafe.addressLine} ${cafe.pincode}`)}`;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Book a gaming cafe", href: BOOK.root },
    { name: cafe.name, href: canonical },
  ];
  const faqs = [
    {
      q: `How do I book ${cafe.name}?`,
      a: `Choose a console on this page, pick a date and time slot, and pay online${cafe.payAtCafe ? " or choose pay at the cafe" : ""}. You'll get your booking in the Hash app and under My bookings.`,
    },
    ...(range
      ? [
          {
            q: `How much does ${cafe.name} charge?`,
            a: `Slots at ${cafe.name} start at ${inr(range.min)}${range.max > range.min ? ` and go up to ${inr(range.max)}` : ""} depending on the console. The exact price for your slots is shown before you pay.`,
          },
        ]
      : []),
    ...(cafe.opens && cafe.closes
      ? [{ q: `What are ${cafe.name}'s opening hours?`, a: `${cafe.name} is open from ${fmtTime(cafe.opens)} to ${fmtTime(cafe.closes)}.` }]
      : []),
    ...(cafe.addressLine ? [{ q: `Where is ${cafe.name}?`, a: `${cafe.name} is at ${cafe.addressLine}${cafe.pincode ? `, ${cafe.pincode}` : ""}.` }] : []),
  ];

  const business = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    "@id": `${SITE_URL}${canonical}#cafe`,
    name: cafe.name,
    url: `${SITE_URL}${canonical}`,
    image: cafe.images?.length ? cafe.images : [`${SITE_URL}${SITE_LOGO}`],
    description: `${cafe.name} is a gaming cafe${cafe.area ? ` in ${cafe.area}` : ""}. Book slots online on Hash.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: cafe.addressLine || undefined,
      addressLocality: locality || undefined,
      addressRegion: cafe.state || undefined,
      postalCode: cafe.pincode || undefined,
      addressCountry: "IN",
    },
    ...(cafe.lat && cafe.lng ? { geo: { "@type": "GeoCoordinates", latitude: cafe.lat, longitude: cafe.lng }, hasMap: mapsUrl } : {}),
    ...(cafe.opens && cafe.closes
      ? {
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: cafe.opens.slice(0, 5),
            closes: cafe.closes.slice(0, 5),
          },
        }
      : {}),
    ...(range ? { priceRange: range.max > range.min ? `${inr(range.min)}–${inr(range.max)}` : inr(range.min), currenciesAccepted: "INR" } : {}),
    ...(cafe.amenities?.length ? { amenityFeature: cafe.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })) } : {}),
    ...(consoles.length
      ? {
          makesOffer: consoles
            .filter((c) => c.pricePerSlot > 0)
            .map((c) => ({
              "@type": "Offer",
              name: `${c.name} slot`,
              price: c.pricePerSlot,
              priceCurrency: "INR",
              url: `${SITE_URL}${canonical}`,
            })),
        }
      : {}),
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}${canonical}`, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
      result: { "@type": "Reservation", name: `${cafe.name} gaming slot` },
    },
    brand: { "@type": "Brand", name: SITE_NAME },
  };

  return (
    <>
      <JsonLd data={[business, breadcrumbsLd(crumbs, SITE_URL), faqLd(faqs)]} />

      <Container className="pt-6 sm:pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.75rem)] uppercase leading-[0.92] text-white">{cafe.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-white/60">
              {cafe.area && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-white/40" aria-hidden /> {cafe.area}
                </span>
              )}
              {cafe.opens && cafe.closes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-white/40" aria-hidden /> {fmtTime(cafe.opens)} – {fmtTime(cafe.closes)}
                </span>
              )}
              <OpenBadge opens={cafe.opens} closes={cafe.closes} />
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ShareMenu title={cafe.name} text={`Book ${cafe.name} on Hash`} />
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white/85 transition hover:border-white/40 hover:text-white">
              <Navigation className="h-4 w-4" aria-hidden /> Directions
            </a>
          </div>
        </div>
      </Container>

      <Container className="pb-12 pt-6">
        {/* Phone/tablet: photos, booking, then details. Desktop: photos and details left, booking card right (no inner scroll, so the page scroll always reaches Pay). */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12">
          {/* One left column on desktop, so a tall booking card never stretches the photo row and leaves a gap. */}
          <div className="contents lg:col-start-1 lg:row-start-1 lg:block lg:min-w-0 lg:space-y-10">
            <div className="order-1 min-w-0">
              <CafeGallery images={cafe.images || []} name={cafe.name} />
            </div>

          <div className="order-3 min-w-0 space-y-10">
            <section aria-label="At a glance">
              <dl className="grid grid-cols-2 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0e0e12] sm:grid-cols-4">
                {[
                  [Wallet, "Slots from", range ? `${inr(range.min)}` : "See prices"],
                  [Gamepad2, "Play on", consoles.length ? `${consoles.length} ${consoles.length === 1 ? "setup" : "setups"} · ${consoles.reduce((n, c) => n + (c.units || 0), 0) || "—"} stations` : "—"],
                  [Clock, "Hours", cafe.opens && cafe.closes ? `${fmtTime(cafe.opens)} – ${fmtTime(cafe.closes)}` : "—"],
                  [CreditCard, "Pay", [cafe.payAtCafe && "At the cafe", "Online", cafe.cafePass || cafe.hashPass ? "Passes" : ""].filter(Boolean).join(" · ")],
                ].map(([Icon, label, value], i) => (
                  <div key={label} className={`p-4 sm:p-5 ${i % 2 ? "border-l border-white/[0.08]" : ""} ${i > 1 ? "border-t border-white/[0.08] sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
                    <dt className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">
                      <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-medium text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <CafePasses vendorId={cafe.id} cafeName={cafe.name} />

            {cafe.amenities?.length > 0 && (
              <section aria-labelledby="amenities-title">
                <h2 id="amenities-title" className="text-xl font-semibold tracking-tight text-white">What this cafe offers</h2>
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {cafe.amenities.map((a) => {
                    const Icon = amenityIcon(a);
                    return (
                      <li key={a} className="flex items-center gap-3 text-[15px] text-white/80">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                          <Icon className="h-4 w-4 text-[#ff9a3d]" aria-hidden />
                        </span>
                        <span className="truncate">{a}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section aria-labelledby="location-title">
              <h2 id="location-title" className="text-xl font-semibold tracking-tight text-white">Location</h2>
              <div className="mt-4 grid overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0e0e12] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {cafe.lat && cafe.lng ? (
                  <iframe
                    title={`Map showing ${cafe.name}`}
                    src={`https://www.google.com/maps?q=${cafe.lat},${cafe.lng}&z=15&output=embed`}
                    className="h-[220px] w-full border-0 grayscale-[30%] invert-[90%] hue-rotate-180 md:h-full md:min-h-[220px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : null}
                <div className="flex flex-col justify-between gap-4 p-5">
                  <address className="not-italic text-[15px] leading-7 text-white/70">
                    <span className="block font-medium text-white">{cafe.name}</span>
                    {cafe.addressLine || cafe.area}
                    {cafe.pincode ? `, ${cafe.pincode}` : ""}
                  </address>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#ff3d8b] hover:text-white">
                    <Navigation className="h-4 w-4" aria-hidden /> Get directions
                  </a>
                </div>
              </div>
            </section>

            <section aria-labelledby="faq-title">
              <h2 id="faq-title" className="text-xl font-semibold tracking-tight text-white">Good to know</h2>
              <div className="mt-3">
                <FaqList items={faqs} />
              </div>
            </section>
          </div>
          </div>

          <aside className="order-2 min-w-0 scroll-mt-28 lg:order-none lg:col-start-2 lg:row-start-1 lg:self-start" id="book">
            <CafeBooking vendorId={cafe.id} initial={data} cafeUrl={canonical} />
          </aside>
        </div>
      </Container>

      {nearby.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <Container className="py-12">
            <SectionHeading title={`More gaming cafes${cafe.state ? ` in ${cafe.state}` : ""}.`} action={<Link href={BOOK.root} className="text-[15px] font-semibold text-white hover:text-[#ff9a3d]">All cafes →</Link>} />
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {nearby.map((c) => (
                <li key={c.id}><CafeCard cafe={c} /></li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CrossSell to="marketplace" />
    </>
  );
}
