import Link from "next/link";

export function Brand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const text = tone === "light" ? "text-white" : "text-[#12141a]";
  const accent = tone === "light" ? "text-indigo-200" : "text-indigo-600";
  const mark = tone === "light" ? "text-white/70" : "text-slate-400";

  return (
    <Link href="/" aria-label="BerogetAI home" className="inline-flex items-center gap-2.5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-900/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/90 font-extrabold text-white">B</span>
      </span>
      <span className={`text-[22px] font-extrabold tracking-[-0.06em] ${text}`}>
        Beroget<span className={accent}>AI</span>
        <span className={`ml-1 align-top text-[10px] font-bold tracking-normal ${mark}`}>®</span>
      </span>
    </Link>
  );
}
