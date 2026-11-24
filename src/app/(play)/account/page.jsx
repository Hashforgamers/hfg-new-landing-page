import { buildPageMetadata } from "@/lib/site";
import AccountView from "@/components/play/AccountView";

export const metadata = buildPageMetadata({ title: "My Account", path: "/account", noIndex: true });

export default function AccountPage() {
  return <AccountView />;
}
