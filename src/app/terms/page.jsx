import AppShell from "@/components/AppShell";
import JsonLd from "@/components/JsonLd";
import NavBar from "@/components/landing/NavBar";
import PageHero from "@/components/landing/PageHero";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { breadcrumbLd, buildPageMetadata } from "@/lib/site";
import { TERMS } from "@/lib/terms";

export const metadata = buildPageMetadata({
  title: "Terms & Conditions",
  description: "Terms of use for the Hash For Gamers website and app, owned by Hashforgamers Pvt Ltd, Mumbai.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <AppShell>
      <JsonLd data={breadcrumbLd("Terms & Conditions", "/terms")} />
      <ScrollProgress />
      <NavBar />
      <PageHero eyebrow="Legal" lines={["Terms &", "Conditions."]} body="The terms that apply when you use the Hash For Gamers website and app." actions={false} />
      <section className="bg-black px-4 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-8 text-white/75">
          {TERMS.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
