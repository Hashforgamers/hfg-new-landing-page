import { Container } from "@/components/play/parts";
import { buildPageMetadata } from "@/lib/site";
import AccountView from "@/components/play/AccountView";

export const metadata = buildPageMetadata({ title: "My Account", path: "/account", noIndex: true });

export default function AccountPage() {
  return (
    <Container className="py-10 sm:py-14">
      <AccountView />
    </Container>
  );
}
