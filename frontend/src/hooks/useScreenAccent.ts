"use client";

/**
 * Color de identidad de la pantalla actual, deducido de la ruta (espejo de `mobile/src/hooks/useScreenAccent.ts`).
 * Orden: zona de rol (`ROUTE_ACCESS`) → módulo de la ruta → vitrina de un rol → `undefined` (degradado de la marca).
 */
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getRouteRule } from "@/constants/roleTools";
import { normalizeRole } from "@/constants/roles";
import { MODULE_ACCENTS, ROLE_ACCENTS, SEGMENT_ROLES, getModuleForPath } from "@/constants/modules";

export function useScreenAccent(): string | undefined {
  const pathname = usePathname() ?? "/";
  const { user } = useAuth();

  const rule = getRouteRule(pathname);
  if (rule) {
    const userRole = normalizeRole(user?.role_name);
    const allowed = rule.roles.map(normalizeRole);
    const role = allowed.length === 0 ? "admin" : allowed.includes(userRole) ? userRole : allowed[0];
    return ROLE_ACCENTS[role];
  }

  const moduleKey = getModuleForPath(pathname);
  if (moduleKey) return MODULE_ACCENTS[moduleKey];

  const segmentRole = SEGMENT_ROLES[pathname.split("/").filter(Boolean)[0] ?? ""];
  return segmentRole ? ROLE_ACCENTS[segmentRole] : undefined;
}
