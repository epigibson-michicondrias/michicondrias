/**
 * useMyApplications — solicitudes propias de adopción (`(app)/adopciones/mis-solicitudes`).
 * Espejo de `mobile/src/hooks/adopciones/useMyApplications.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { getMyRequests } from "@/services/adopciones";
import type { AdoptionRequest } from "@/types/adopciones";

const STEPS = [
  { key: "PENDING", label: "Enviada" },
  { key: "REVIEWING", label: "Revisión" },
  { key: "INTERVIEW_SCHEDULED", label: "Entrevista" },
  { key: "APPROVED", label: "Aprobada" },
  { key: "ADOPTED", label: "Finalizada" },
] as const;

export function useMyApplications() {
  const {
    data: requests = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["my-requests"],
    queryFn: getMyRequests,
    refetchInterval: 30000,
  });

  const getProgressIndex = (status: string) => {
    if (status === "REJECTED") return -1;
    const index = STEPS.findIndex((s) => s.key === status);
    return index !== -1 ? index : 0;
  };

  return {
    requests,
    isLoading,
    isRefetching,
    refetch,
    getProgressIndex,
    STEPS,
  };
}

export type { AdoptionRequest };
