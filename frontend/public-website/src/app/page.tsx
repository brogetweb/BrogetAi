import { HomeHero } from "@/components/home-hero";
import { Offerings } from "@/components/offerings";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pt-[5.25rem] pb-20 text-[#17191e]">
        <HomeHero />
        <Offerings />
      </main>
      <SiteFooter />
    </>
  );
}
