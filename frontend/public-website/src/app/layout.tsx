import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-drawer";
import { PageMotion } from "@/components/page-motion";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Broget AI — Go further. Feel every moment.",
  description: "Broget AI for travel booking, banking, payments, and services across education, health, agriculture, and builder work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <AuthProvider>
          <SiteHeader />
          <PageMotion>{children}</PageMotion>
        </AuthProvider>
      </body>
    </html>
  );
}
