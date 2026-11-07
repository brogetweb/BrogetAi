import { Hero, ServiceTicker } from "@/components/home/hero";
import { Faq, LiveProducts, Stats, Steps } from "@/components/home/sections";
import { ServicesDirectory } from "@/components/home/services";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <main className="bg-white pt-[4.5rem] text-slate-900">
        <Hero />
        <ServiceTicker />
        <ServicesDirectory />
        <LiveProducts />
        <Stats />
        <Steps />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
