"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { afterAuth } from "@/components/auth-drawer";
import { RegisterForm } from "@/components/auth-forms";
import { AuthLayout } from "@/components/auth-layout";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Register />
    </Suspense>
  );
}

function Register() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  return (
    <AuthLayout eyebrow="CREATE PROFILE" title="Create your traveller profile" subtitle="Takes 30 seconds. Needed once before your first booking.">
      <RegisterForm onDone={(user) => afterAuth(router, user, next)} onSwitch={() => router.push(`/login?next=${encodeURIComponent(next)}`)} />
    </AuthLayout>
  );
}
