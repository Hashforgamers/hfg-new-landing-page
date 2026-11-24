import { Container } from "@/components/play/parts";
import { buildPageMetadata } from "@/lib/site";
import CartCheckout from "@/components/play/CartCheckout";

export const metadata = buildPageMetadata({ title: "Your Cart", path: "/marketplace/cart", noIndex: true });

export default function CartPage() {
  return (
    <Container className="py-10 sm:py-14">
      <CartCheckout />
    </Container>
  );
}
