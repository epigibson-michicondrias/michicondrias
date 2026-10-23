"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/legacy/auth";

/** Si ya hay sesión, la landing no aplica: manda directo al panel. */
export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return null;
}
