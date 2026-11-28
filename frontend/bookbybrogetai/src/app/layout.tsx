import type { Metadata } from "next";
import { Footer, Header } from "@/components/chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Book by Broget AI | Cheap flights, easy booking", template: "%s · Book by Broget AI" },
  description: "Search and book domestic and international flights at the best fares. Create your profile once and book in minutes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
