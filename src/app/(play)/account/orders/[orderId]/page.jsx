import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/site";
import OrderTracker from "@/components/play/OrderTracker";

export const metadata = buildPageMetadata({ title: "Order Tracking", path: "/account", noIndex: true });

export default async function OrderPage({ params }) {
  const { orderId } = await params;
  if (!/^order_[A-Za-z0-9]{1,60}$/.test(orderId)) notFound();
  return <OrderTracker orderId={orderId} />;
}
