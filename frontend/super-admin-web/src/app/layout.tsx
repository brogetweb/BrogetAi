import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "BerogetAI Super Admin",
  description: "Admin desk for travel bookings, agents, loans, and settings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense>
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </body>
    </html>
  );
}
