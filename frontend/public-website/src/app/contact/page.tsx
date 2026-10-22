import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";

const notes = [
  ["01", "Hold reference", "If this is about a fare or a room, include the reference from the hold."],
  ["02", "Route or city", "The cities, the dates, and who is travelling help the desk find the right trip."],
  ["03", "Same email", "Use the email you put on the passenger or guest form."],
];

const paths = [
  { title: "A fare", text: "Times, stops, and the price you held.", href: "/flights", image: "/images/hero-flights-full.jpg" },
  { title: "A room", text: "The city, the dates, and the stay.", href: "/hotels", image: "/images/hotel-room.jpg" },
  { title: "An account", text: "Log in or register without leaving the site.", href: "/login", image: "/images/hero-cibil-score.jpg" },
];

export default function ContactPage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-[5.25rem] h-[300px] overflow-hidden sm:h-[360px]">
          <Image src="/images/hotel-suite.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.72)_0%,rgba(8,16,32,0.28)_42%,transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_top,rgba(8,16,32,0.35),transparent)]" />
          <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8">
            <p className="text-[11px] font-bold tracking-[0.18em] text-amber-100 uppercase">Contact us</p>
            <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">Tell the trip desk what you need.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">A fare, a room, or an account. One note is enough.</p>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-12 grid max-w-7xl items-start gap-5 px-4 sm:px-5 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
          <ContactForm />
          <aside className="overflow-hidden rounded-[1.75rem] bg-[#12141a] text-white">
            <div className="relative h-40">
              <Image src="/images/hotel-exterior.jpg" alt="" fill sizes="400px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] to-black/10" />
            </div>
            <div className="px-7 pb-8">
              <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-200 uppercase">Before you write</p>
              <ul className="mt-6 space-y-6">
                {notes.map(([step, title, text]) => (
                  <li key={title} className="flex gap-4">
                    <span className="text-sm font-semibold text-indigo-300">{step}</span>
                    <span>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/65">{text}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">Or go straight to the trip</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {paths.map((item) => (
              <Link key={item.title} href={item.href} className="group relative h-52 overflow-hidden rounded-3xl">
                <Image src={item.image} alt="" fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xl font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-white/80">{item.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
