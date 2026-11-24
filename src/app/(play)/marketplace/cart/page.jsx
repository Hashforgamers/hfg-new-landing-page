import { buildPageMetadata } from "@/lib/site";
import CartCheckout from "@/components/play/CartCheckout";

export const metadata = buildPageMetadata({ title: "Your Cart", path: "/marketplace/cart", noIndex: true });

export default function CartPage() {
  return <CartCheckout />;
}
