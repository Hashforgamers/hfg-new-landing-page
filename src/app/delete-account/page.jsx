import DeleteAccountPage from "@/components/DeleteAccountPage";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Delete Account",
  description:
    "Delete your Hash For Gamers account and review the account deletion policy.",
  alternates: {
    canonical: "/delete-account",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: `Delete Account | ${SITE_NAME}`,
    description:
      "Delete your Hash For Gamers account and review the account deletion policy.",
    url: `${SITE_URL}/delete-account`,
  },
};

export default async function DeleteAccount({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialToken =
    typeof resolvedSearchParams?.token === "string"
      ? resolvedSearchParams.token
      : "";

  return <DeleteAccountPage initialToken={initialToken} />;
}
