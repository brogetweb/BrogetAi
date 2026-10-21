"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-drawer";

export default function RegisterPage() {
  const { openAuth } = useAuth();
  const router = useRouter();
  useEffect(() => {
    openAuth("register");
    router.replace("/");
  }, [openAuth, router]);
  return null;
}
