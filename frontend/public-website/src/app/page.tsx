import { Hero } from "@/components/home/hero";
import { Cta, Faq, LiveProducts, Stats, Steps } from "@/components/home/sections";
import { LiveOn, ServicesDirectory } from "@/components/home/services";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <main className="bg-white pt-[5.25rem] text-slate-900">
        <Hero />
        <LiveOn />
        <ServicesDirectory />
        <LiveProducts />
        <Stats />
        <Steps />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
