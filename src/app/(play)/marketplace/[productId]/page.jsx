import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/site";
import ProductDetail from "@/components/play/ProductDetail";

export async function generateMetadata({ params }) {
  const { productId } = await params;
  return buildPageMetadata({
    title: "Marketplace Product",
    description: "Gaming gear and services from verified Hash partners.",
    path: `/marketplace/${productId}`,
  });
}

export default async function ProductPage({ params }) {
  const { productId } = await params;
  if (!/^prod_[A-Za-z0-9]{1,60}$/.test(productId)) notFound();
  return <ProductDetail productId={productId} />;
}
