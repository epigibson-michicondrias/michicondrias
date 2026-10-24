/**
 * useProRole — rol profesional del usuario (espejo de `mobile/src/hooks/servicios-pro/useProRole.ts`).
 * La API entrega "paseador" / "cuidador"; "walker" / "sitter" son alias heredados.
 */
import { useAuth } from "@/contexts/AuthContext";

export function useProRole() {
  const { user } = useAuth();
  const role = user?.role_name || "";
  const isWalker = role === "paseador" || role === "walker";
  const isSitter = role === "cuidador" || role === "sitter";
  return { role, isWalker, isSitter, isProvider: isWalker || isSitter };
}
