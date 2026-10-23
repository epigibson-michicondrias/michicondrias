"use client";

/**
 * Protege una pantalla para ciertos roles (espejo de `mobile/src/components/RoleGuard.tsx`).
 * El admin siempre pasa (igual que require_role en el backend). Si el rol no coincide muestra un aviso con salida.
 */
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/constants/roles";
import Button from "./Button";
import l from "./layout/layout.module.css";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  message?: string;
}

export default function RoleGuard({ roles, children, message }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  if (isLoading) return null;
  const role = normalizeRole(user?.role_name);
  if (role === "admin" || roles.map(normalizeRole).includes(role)) return <>{children}</>;
  return (
    <div className={l.guard}>
      <Lock size={40} className={l.guardText} aria-hidden />
      <p className={l.guardTitle}>Sección no disponible para tu cuenta</p>
      <p className={l.guardText}>{message || "Esta herramienta es solo para cuentas con el rol correspondiente."}</p>
      <Button
        label="Volver"
        variant="secondary"
        fullWidth={false}
        onPress={() => (window.history.length > 1 ? router.back() : router.replace("/"))}
      />
    </div>
  );
}
