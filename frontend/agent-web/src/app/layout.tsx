import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Broget AI Agent - CIBIL checks, customers & Broget Pay wallet",
    template: "%s · Broget AI Agent",
  },
  description: "The professional workspace for Broget AI agents: run consent-based CIBIL checks, manage customers and top up your Broget Pay wallet.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
