import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-[#eef1f6] bg-white p-8">
      <h1 className="text-2xl font-extrabold">That page is not on the desk</h1>
      <Link href="/" className="mt-4 inline-block text-sm font-extrabold text-[#2f6bff]">Back to overview</Link>
    </div>
  );
}
