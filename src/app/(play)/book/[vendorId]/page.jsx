import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/site";
import CafeBooking from "@/components/play/CafeBooking";

export async function generateMetadata({ params }) {
  const { vendorId } = await params;
  return buildPageMetadata({
    title: "Book Your Slot",
    description: "Pick a console, date and time slot and confirm your gaming cafe booking with Hash.",
    path: `/book/${vendorId}`,
  });
}

export default async function CafeBookingPage({ params }) {
  const { vendorId } = await params;
  if (!/^\d{1,9}$/.test(vendorId)) notFound();
  return <CafeBooking vendorId={Number(vendorId)} />;
}
