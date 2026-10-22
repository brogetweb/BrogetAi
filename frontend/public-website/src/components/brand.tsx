import Image from "next/image";
import Link from "next/link";

export function Brand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link href="/" aria-label="BrogetAI home" className={`inline-flex shrink-0 items-center ${tone === "light" ? "rounded-2xl bg-white px-2.5 py-1.5" : ""}`}>
      <Image src="/brand/broget-logo.jpg" alt="BrogetAI. Travel, finance, invest, smarter." width={929} height={242} priority className="h-auto max-h-[4.25rem] w-auto max-w-[min(18rem,58vw)] object-contain object-left" style={{ width: "auto", height: "auto", maxHeight: "4.25rem" }} />
    </Link>
  );
}
