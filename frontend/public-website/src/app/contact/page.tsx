import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";

const notes = [
  ["01", "Say which desk", "Travel, banking, a payment, or one of the services."],
  ["02", "Add a reference", "If this is about a booking or a report, include the reference you were given."],
  ["03", "Use a reachable phone", "The reply goes to the email and mobile number on the form."],
];

const paths = [
  { title: "Travel", text: "Flights, trains, buses, and hotels.", href: "/#travel", image: "/images/home/home-flight.jpg" },
  { title: "Banking", text: "CIBIL, SIP, and FD & RD.", href: "/#banking", image: "/images/home/home-cibil.jpg" },
  { title: "Payment", text: "Gateway, payment link, and payout.", href: "/#payment", image: "/images/home/home-gateway.jpg" },
  { title: "Our Services", text: "Education, health, agriculture, and builder.", href: "/#products", image: "/images/home/home-education.jpg" },
];

export default function ContactPage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-[5.25rem] overflow-hidden bg-[#07101f] text-white">
          <Image src="/images/home/home-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.9)_0%,rgba(7,16,31,0.62)_52%,rgba(7,16,31,0.28)_100%)]" />
          <div className="relative mx-auto flex min-h-[20rem] max-w-7xl flex-col justify-center px-5 py-14 sm:min-h-[24rem] lg:px-8">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-100 uppercase">Contact us</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Write to the BrogetAI desk.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">A booking, a credit report, a payment, or one of the services. One message is enough.</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-start gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
          <ContactForm />
          <aside className="lg:pt-10">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#1d4ed8] uppercase">Before you write</p>
            <ul className="mt-6 space-y-6">
              {notes.map(([step, title, text]) => (
                <li key={title}>
                  <p className="text-xs font-bold tracking-[0.14em] text-[#1d4ed8]">{step}</p>
                  <p className="mt-1 text-lg font-semibold text-[#163a9a]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#1d4ed8]">{text}</p>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">Or open a section</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">Go straight to the desk you need.</h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {paths.map((item) => (
              <Link key={item.title} href={item.href} className="group overflow-hidden bg-white ring-1 ring-slate-200">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover object-center transition duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="px-4 py-5 text-center">
                  <p className="text-lg font-semibold text-[#1d4ed8]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#1d4ed8]">{item.text}</p>
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
