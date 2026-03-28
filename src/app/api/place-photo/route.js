import { NextResponse } from "next/server";

const DEFAULT_GOOGLE_PLACES_KEY = "AIzaSyBcpDY2rbM00JHrL-CGaXQQl-bmvInLNbA";
const GOOGLE_PLACES_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
  DEFAULT_GOOGLE_PLACES_KEY;

async function getPhotoReference(placeId) {
  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set("fields", "photo");
  detailsUrl.searchParams.set("key", GOOGLE_PLACES_KEY);

  const response = await fetch(detailsUrl.toString(), {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`details_${response.status}`);
  }

  const payload = await response.json();
  const reference = payload?.result?.photos?.[0]?.photo_reference;

  if (!reference) {
    return null;
  }

  return reference;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json({ error: "Missing placeId" }, { status: 400 });
  }

  if (!GOOGLE_PLACES_KEY) {
    return NextResponse.json({ error: "Missing Google Places key" }, { status: 503 });
  }

  try {
    const photoReference = await getPhotoReference(placeId);

    if (!photoReference) {
      return NextResponse.json({ error: "No photo found" }, { status: 404 });
    }

    const photoUrl = new URL("https://maps.googleapis.com/maps/api/place/photo");
    photoUrl.searchParams.set("maxwidth", "1200");
    photoUrl.searchParams.set("photo_reference", photoReference);
    photoUrl.searchParams.set("key", GOOGLE_PLACES_KEY);

    return NextResponse.redirect(photoUrl.toString(), {
      status: 307,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Google Places photo lookup failed" },
      { status: 502 }
    );
  }
}
