import { HomeAbout } from "@/components/home-about";
import { HomeFaq } from "@/components/home-faq";
import { HomeHero } from "@/components/home-hero";
import { HomeLive } from "@/components/home-live";
import { HomeCta, HomeSteps } from "@/components/home-steps";
import { Offerings } from "@/components/offerings";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pt-[5.25rem] pb-20 text-[#17191e]">
        <HomeHero />
        <HomeLive />
        <Offerings />
        <HomeSteps />
        <HomeAbout />
        <HomeFaq />
        <HomeCta />
      </main>
      <SiteFooter />
    </>
  );
}
