/**
 * useProgramDetail — ficha de un programa de entrenamiento (`(app)/entrenadores/[id]`).
 * Espejo de `mobile/src/hooks/training/useProgramDetail.ts` con `next/navigation`.
 */
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllPrograms, type TrainingProgram } from "@/services/training";
import { showAlert } from "@/components/AppAlert";

export function useProgramDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: programs = [], isLoading, error } = useQuery<TrainingProgram[]>({
    queryKey: ["trainingPrograms"],
    queryFn: () => getAllPrograms(),
  });

  const program = programs.find((p) => p.id === id);

  const handleEnroll = () => {
    showAlert({
      type: "info",
      title: "Inscribir mascota",
      message: "¿Deseas inscribir a tu mascota en este programa?",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Inscribir",
      onButtonPress: () => {
        if (id) router.push(`/entrenadores/inscribir/${id}`);
      },
    });
  };

  return {
    program,
    isLoading,
    error,
    handleEnroll,
  };
}
