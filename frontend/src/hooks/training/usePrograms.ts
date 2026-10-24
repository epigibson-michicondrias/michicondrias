/**
 * usePrograms — listado público de programas de entrenamiento (`(app)/entrenadores`).
 * Espejo de `mobile/src/hooks/training/usePrograms.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { getAllPrograms, type TrainingProgram } from "@/services/training";

export function usePrograms() {
  const {
    data: programs = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<TrainingProgram[]>({
    queryKey: ["trainingPrograms"],
    queryFn: () => getAllPrograms(),
  });

  return {
    programs,
    isLoading,
    refetch,
    isRefetching,
  };
}

export type { TrainingProgram };
