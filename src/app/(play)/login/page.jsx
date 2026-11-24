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
    <Suspense>
      <Container className="py-10">
        <LoginView />
      </Container>
    </Suspense>
  );
}
