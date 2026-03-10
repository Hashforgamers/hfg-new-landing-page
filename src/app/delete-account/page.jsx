import DeleteAccountPage from "@/components/DeleteAccountPage";

export default async function DeleteAccount({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialToken =
    typeof resolvedSearchParams?.token === "string"
      ? resolvedSearchParams.token
      : "";

  return <DeleteAccountPage initialToken={initialToken} />;
}
