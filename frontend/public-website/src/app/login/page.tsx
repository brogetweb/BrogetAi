"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-drawer";

export default function LoginPage() {
  const { openAuth } = useAuth();
  const router = useRouter();
  useEffect(() => {
    openAuth("login");
    router.replace("/");
  }, [openAuth, router]);
  return null;
}
