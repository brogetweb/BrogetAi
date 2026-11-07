import Image from "next/image";
import Link from "next/link";

export function Brand({ tone = "dark", size = "md" }: { tone?: "dark" | "light"; size?: "md" | "lg" }) {
  const max = size === "lg" ? "4rem" : "3.1rem";
  return (
    <Link href="/" aria-label="BrogetAI home" className={`inline-flex shrink-0 items-center ${tone === "light" ? "rounded-xl bg-white px-2.5 py-1.5" : ""}`}>
      <Image
        src="/brand/broget-logo.jpg"
        alt="BrogetAI. Travel, finance, invest, smarter."
        width={929}
        height={242}
        priority
        className="h-auto w-auto max-w-[min(15rem,52vw)] object-contain object-left"
        style={{ width: "auto", height: "auto", maxHeight: max }}
      />
    </Link>
  );
}
