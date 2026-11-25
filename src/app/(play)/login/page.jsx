import { Container } from "@/components/play/parts";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/site";
import LoginView from "@/components/play/LoginView";

export const metadata = buildPageMetadata({
  title: "Login",
  description: "Sign in to Hash For Gamers to book gaming cafes and shop the Hash marketplace.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Container className="min-h-[70vh] py-10">
      {/* The fallback keeps the page tall while the form loads, so it never opens scrolled to the footer. */}
      <Suspense fallback={<div className="mx-auto min-h-[420px] max-w-md" aria-hidden />}>
        <LoginView />
      </Suspense>
    </Container>
  );
}
