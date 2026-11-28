"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { afterAuth } from "@/components/auth-drawer";
import { LoginForm } from "@/components/auth-forms";
import { AuthLayout } from "@/components/auth-layout";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Log in to your profile"
      subtitle="Use the email you signed up with."
      notice={
        params.get("reason") === "book" ? (
          <p className="mb-4 flex gap-2 rounded-2xl border border-brand/20 bg-[#eef4ff] px-4 py-3 text-sm text-brand-dark">
            <Icon name="plane" size={18} className="mt-0.5 shrink-0" />
            <span><b>Almost there!</b> Log in or create a free profile to book your flight.</span>
          </p>
        ) : null
      }
    >
      <LoginForm onDone={(user) => afterAuth(router, user, next)} onSwitch={() => router.push(`/register?next=${encodeURIComponent(next)}`)} />
    </AuthLayout>
  );
}
