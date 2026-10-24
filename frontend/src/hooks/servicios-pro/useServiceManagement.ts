/**
 * useServiceManagement — «Mis tareas» del paseador o cuidador: solicitudes entrantes y sus cambios de estado.
 * Espejo de `mobile/src/hooks/servicios-pro/useServiceManagement.ts`.
 */
import { useMemo, useState } from "react";
import { useProRequests, type RequestKind } from "@/features/servicios-pro/useProRequests";
import { useProRole } from "@/features/servicios-pro/useProRole";
import { normalizeStatus } from "@/features/servicios-pro/requestStatus";

export function useServiceManagement() {
  const { isWalker } = useProRole();
  const kind: RequestKind = isWalker ? "walk" : "sit";
  const base = useProRequests(kind);
  const [filter, setFilter] = useState<string>("pending");

  const { allRequests } = base;
  const filtered = useMemo(
    () => allRequests.filter((r) => filter === "all" || normalizeStatus(r.status) === filter),
    [allRequests, filter],
  );
  const pending = base.counts.pending || 0;
  const active = (base.counts.accepted || 0) + (base.counts.in_progress || 0);

  return {
    kind,
    filter,
    setFilter,
    pending,
    active,
    filtered,
    isLoading: base.isLoading,
    updatingId: base.updatingId,
    updateStatus: base.updateStatus,
  };
}
