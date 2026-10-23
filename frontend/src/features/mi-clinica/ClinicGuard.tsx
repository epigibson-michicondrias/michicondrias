"use client";

/** Protección común de Mi clínica: solo veterinario u hospital (admin pasa). Igual que `ROUTE_ACCESS`. */
import type { ReactNode } from "react";
import RoleGuard from "@/components/RoleGuard";

export default function ClinicGuard({ children, hospitalOnly }: { children: ReactNode; hospitalOnly?: boolean }) {
  return <RoleGuard roles={hospitalOnly ? ["hospital"] : ["veterinario", "hospital"]}>{children}</RoleGuard>;
}
