"use client";

/**
 * Layout de `(app)`: proveedores + guarda de sesión + guarda de rol por ruta + shell (sidebar / barra inferior).
 * Sin sesión manda a `/login` (como la guarda de `mobile/app/_layout.tsx`).
 */
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppProviders from "@/components/AppProviders";
import AppShell from "@/components/AppShell";
import RoleGuard from "@/components/RoleGuard";
import { getRouteRule } from "@/constants/roleTools";
import { useAuth } from "@/contexts/AuthContext";

function AppGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading) return null;
  if (!user) return null;

  // Zonas de rol (`ROUTE_ACCESS`, espejo del backend): la regla más específica decide; admin siempre pasa.
  const rule = getRouteRule(pathname);
  return <AppShell>{rule ? <RoleGuard roles={rule.roles}>{children}</RoleGuard> : children}</AppShell>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <AppGate>{children}</AppGate>
    </AppProviders>
  );
}
