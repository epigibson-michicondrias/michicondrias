/**
 * useProRequests — solicitudes de paseo o cuidado, vistas como profesional (entrantes) o como cliente (las que hizo).
 * Espejo de `mobile/src/hooks/servicios-pro/useProRequests.ts`. Centraliza consultas, cambios de estado e invalidación.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import {
  getIncomingWalkRequests,
  getMyWalkRequests,
  updateWalkRequestStatus,
  type WalkRequest,
} from "@/services/paseadores";
import {
  getIncomingSitRequests,
  getMySitRequests,
  updateSitRequestStatus,
  type SitRequest,
} from "@/services/cuidadores";
import { useProRole } from "./useProRole";
import { errorMessage, normalizeStatus, STATUS_LABELS } from "./requestStatus";

export type RequestKind = "walk" | "sit";
export type ProRequest = WalkRequest | SitRequest;
export type Perspective = "provider" | "client";

const KEYS = {
  walk: { provider: ["walker-requests"], client: ["my-walk-requests"] },
  sit: { provider: ["sitter-requests"], client: ["my-sit-requests"] },
} as const;

const SUCCESS_MESSAGES: Record<string, string> = {
  accepted: "Solicitud aceptada. El cliente verá el cambio de inmediato.",
  in_progress: "Servicio iniciado.",
  completed: "Servicio completado. El cliente ya puede dejar su reseña.",
  cancelled: "Solicitud cancelada.",
};

export function useProRequests(kind: RequestKind) {
  const queryClient = useQueryClient();
  const { isWalker, isSitter } = useProRole();
  const perspective: Perspective = (kind === "walk" ? isWalker : isSitter) ? "provider" : "client";
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryKey = KEYS[kind][perspective];
  const queryFn =
    kind === "walk"
      ? perspective === "provider"
        ? getIncomingWalkRequests
        : getMyWalkRequests
      : perspective === "provider"
        ? getIncomingSitRequests
        : getMySitRequests;

  const { data = [], isLoading, isRefetching, refetch } = useQuery<ProRequest[]>({
    queryKey: [...queryKey],
    queryFn: queryFn as () => Promise<ProRequest[]>,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<ProRequest> =>
      kind === "walk" ? updateWalkRequestStatus(id, status) : updateSitRequestStatus(id, status),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: [...KEYS[kind].provider] });
      queryClient.invalidateQueries({ queryKey: [...KEYS[kind].client] });
      showAlert({
        type: "success",
        title: STATUS_LABELS[normalizeStatus(vars.status)],
        message: SUCCESS_MESSAGES[vars.status] || "Solicitud actualizada.",
      });
    },
    onError: (error) => {
      showAlert({
        type: "error",
        title: "No se pudo actualizar",
        message: errorMessage(error, "Inténtalo de nuevo en unos segundos."),
      });
      queryClient.invalidateQueries({ queryKey: [...queryKey] });
    },
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.length };
    data.forEach((r) => {
      const s = normalizeStatus(r.status);
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((r) => {
      if (statusFilter !== "all" && normalizeStatus(r.status) !== statusFilter) return false;
      if (!q) return true;
      const walk = r as WalkRequest;
      const sit = r as SitRequest;
      const haystack = [r.pet_name, r.client_name, walk.walker_name, sit.sitter_name, walk.pickup_address, sit.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, statusFilter, searchQuery]);

  return {
    perspective,
    requests: filtered,
    allRequests: data,
    counts,
    isLoading,
    isRefetching,
    refetch,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    updateStatus: (id: string, status: string) => mutation.mutate({ id, status }),
    updatingId: mutation.isPending ? (mutation.variables?.id ?? null) : null,
  };
}
