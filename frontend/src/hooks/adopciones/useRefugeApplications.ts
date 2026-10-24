/**
 * useRefugeApplications — postulaciones (formularios de compatibilidad) del refugio
 * (`(app)/adopciones/refugio/aplicaciones`). Espejo de `mobile/src/hooks/adopciones/useRefugeApplications.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getRefugeApplications } from "@/services/adopciones";
import type { AdoptionForm } from "@/types/adopciones";

/** Tono semántico por estado; el color real se toma del tema en la pantalla. */
export const STATUS_TONES: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  submitted: "warning",
  under_review: "info",
  approved: "success",
  rejected: "error",
  reviewing: "info",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  submitted: "Pendiente",
  under_review: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  reviewing: "En revisión",
};

export function useRefugeApplications() {
  const router = useRouter();

  const {
    data: applications = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["refuge-applications"],
    queryFn: getRefugeApplications,
  });

  const goToApplicationDetail = (applicationId: string) => {
    router.push(`/adopciones/contrato/${applicationId}`);
  };

  return {
    applications,
    isLoading,
    isRefetching,
    refetch,
    goToApplicationDetail,
  };
}

export type { AdoptionForm };
