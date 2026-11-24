import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Clock, CreditCard, Navigation, Wallet } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { withQuery } from "@/lib/verticals";
import CafeBooking from "@/components/play/CafeBooking";
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
    nearby = (await loadCafes()).filter((c) => c.id !== cafe.id && c.state && c.state === cafe.state).slice(0, 3);
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

      <Container className="pt-8">
        <Breadcrumbs items={crumbs} />
      </Container>

      <Container className="pb-16 pt-6">
        {/* Phone/tablet order: header, booking, details. Desktop: header + details on the left, booking sticky on the right. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-[#ff9a3d]">Gaming cafe{locality ? ` · ${locality}` : ""}</p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6.5vw,5.5rem)] uppercase leading-[0.9] text-white">{cafe.name}</h1>
            {cafe.area && <p className="mt-4 text-lg text-white/60">{cafe.area}</p>}

            <dl className="mt-8 grid gap-px overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3">
              <div className="bg-black p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/40"><Clock className="h-3.5 w-3.5" aria-hidden /> Hours</dt>
                <dd className="mt-2 text-[15px] text-white">{cafe.opens && cafe.closes ? `${fmtTime(cafe.opens)} – ${fmtTime(cafe.closes)}` : "See booking"}</dd>
              </div>
              <div className="bg-black p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/40"><Wallet className="h-3.5 w-3.5" aria-hidden /> Price</dt>
                <dd className="mt-2 text-[15px] text-white">{range ? `From ${inr(range.min)} / slot` : "Shown at booking"}</dd>
              </div>
              <div className="bg-black p-5">
                <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/40"><CreditCard className="h-3.5 w-3.5" aria-hidden /> Payment</dt>
                <dd className="mt-2 text-[15px] text-white">{cafe.payAtCafe ? "Online or at the cafe" : "Pay online"}</dd>
              </div>
            </dl>
          </div>

          <aside className="min-w-0 scroll-mt-32 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start" id="book">
            <CafeBooking vendorId={cafe.id} initial={data} cafeUrl={canonical} />
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2 [&>section:first-child]:mt-0 lg:[&>section:first-child]:mt-14">
            {cafe.images?.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:mt-8">
                {cafe.images.slice(0, 5).map((src, i) => (
                  <div
                    key={src}
                    className={`overflow-hidden rounded-[20px] bg-white/[0.04] ${i === 0 ? "col-span-4 aspect-[16/9]" : "aspect-square"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={i === 0 ? `${cafe.name} gaming cafe` : `${cafe.name} photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {consoles.length > 0 && (
              <section className="mt-14" aria-labelledby="consoles-title">
                <SectionHeading id="consoles-title" title="Consoles and prices." />
                <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {consoles.map((c) => (
                    <li key={c.gameId} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-[17px] font-medium text-white">{c.name}</p>
                        {c.units ? <p className="text-sm text-white/45">{c.units} {c.units === 1 ? "station" : "stations"}{c.multiplayer ? " · multiplayer" : ""}</p> : null}
                      </div>
                      <p className="text-[17px] text-white">{c.pricePerSlot > 0 ? <>{inr(c.pricePerSlot)} <span className="text-sm text-white/40">per slot</span></> : <span className="text-sm text-white/45">Price at booking</span>}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {cafe.amenities?.length > 0 && (
              <section className="mt-14" aria-labelledby="amenities-title">
                <SectionHeading id="amenities-title" title="What's there." />
                <ul className="mt-6 flex flex-wrap gap-2">
                  {cafe.amenities.map((a) => (
                    <li key={a} className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/80">{a}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-14" aria-labelledby="location-title">
              <SectionHeading id="location-title" title="Getting there." />
              <div className="mt-6 flex flex-col gap-5 rounded-[24px] border border-white/[0.08] p-6 sm:flex-row sm:items-center sm:justify-between">
                <address className="not-italic text-[15px] leading-7 text-white/70">
                  <span className="block font-medium text-white">{cafe.name}</span>
                  {cafe.addressLine}
                  {cafe.pincode ? `, ${cafe.pincode}` : ""}
                </address>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black">
                  <Navigation className="h-4 w-4" aria-hidden /> Directions
                </a>
              </div>
            </section>

            <section className="mt-14" aria-labelledby="faq-title">
              <SectionHeading id="faq-title" title="Good to know." />
              <div className="mt-6">
                <FaqList items={faqs} />
              </div>
            </section>
          </div>
        </div>
      </Container>

      {nearby.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <Container className="py-16">
            <SectionHeading title={`More gaming cafes${cafe.state ? ` in ${cafe.state}` : ""}.`} action={<Link href={BOOK.root} className="text-[15px] font-semibold text-white hover:text-[#ff9a3d]">All cafes →</Link>} />
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
