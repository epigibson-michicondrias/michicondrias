"use client";

/**
 * Layout de `(auth)`: proveedores del núcleo + AuthShell. Si ya hay sesión, manda a Inicio
 * (salvo `reset-password`, que debe abrirse desde el enlace del correo aunque haya sesión).
 */
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppProviders from "@/components/AppProviders";
import AuthShell from "@/components/AuthShell";
import { useAuth } from "@/contexts/AuthContext";

function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPasswordReset = pathname === "/reset-password";

  useEffect(() => {
    if (isLoading) return;
    if (user && !isPasswordReset) router.replace("/inicio");
  }, [user, isLoading, isPasswordReset, router]);

  if (isLoading) return null;
  if (user && !isPasswordReset) return null;

  return <AuthShell>{children}</AuthShell>;
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <AuthGate>{children}</AuthGate>
    </AppProviders>
  );
}
