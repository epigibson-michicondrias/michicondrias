/**
 * useEnrollment — inscripción a un programa y lista de inscripciones del cliente.
 * Rutas: `(app)/entrenadores/inscribir/[programId]` y `mis-inscripciones`.
 * Espejo de `mobile/src/hooks/training/useEnrollment.ts` con `next/navigation`.
 */
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  enrollPet,
  getClientEnrollments,
  getAllPrograms,
  type TrainingEnrollment,
  type TrainingEnrollmentCreate,
  type TrainingProgram,
} from "@/services/training";
import { getUserPets } from "@/services/mascotas";
import type { Pet } from "@/types/mascotas";
import { showAlert } from "@/components/AppAlert";

export function useEnrollment() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ programId?: string }>();
  const programId = params.programId;

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const { data: pets = [], isLoading: isPetsLoading } = useQuery<Pet[]>({
    queryKey: ["user-pets", user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: programs = [], isLoading: isProgramsLoading } = useQuery<TrainingProgram[]>({
    queryKey: ["trainingPrograms"],
    queryFn: () => getAllPrograms(),
  });

  const {
    data: enrollments = [],
    isLoading: isEnrollmentsLoading,
    refetch: refetchEnrollments,
    isRefetching: isRefetchingEnrollments,
  } = useQuery<TrainingEnrollment[]>({
    queryKey: ["clientEnrollments"],
    queryFn: () => getClientEnrollments(),
    enabled: !!user,
  });

  const program = programs.find((p) => p.id === programId);

  const enrollMutation = useMutation({
    mutationFn: (data: TrainingEnrollmentCreate) => enrollPet(data),
    onSuccess: () => {
      showAlert({
        type: "success",
        title: "¡Inscripción exitosa!",
        message: "Tu mascota ha sido inscrita en el programa de entrenamiento.",
      });
      queryClient.invalidateQueries({ queryKey: ["clientEnrollments"] });
      router.back();
    },
    onError: (error: Error) => {
      showAlert({
        type: "error",
        title: "Error",
        message: error.message || "No se pudo completar la inscripción.",
      });
    },
  });

  const handleEnroll = () => {
    if (!selectedPetId) {
      showAlert({
        type: "warning",
        title: "Selecciona una mascota",
        message: "Debes seleccionar una mascota para inscribir.",
      });
      return;
    }
    if (!programId) {
      showAlert({ type: "error", title: "Error", message: "No se encontró el programa." });
      return;
    }

    showAlert({
      type: "info",
      title: "Confirmar inscripción",
      message: `¿Deseas inscribir a tu mascota en "${program?.title || "este programa"}"?`,
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Inscribir",
      onButtonPress: () => {
        enrollMutation.mutate({
          pet_id: selectedPetId,
          program_id: programId,
          start_date: new Date().toISOString().split("T")[0],
        });
      },
    });
  };

  const enrichedEnrollments = enrollments.map((enrollment) => {
    const prog = programs.find((p) => p.id === enrollment.program_id);
    const pet = pets.find((p) => p.id === enrollment.pet_id);
    return {
      ...enrollment,
      programTitle: enrollment.program_title || prog?.title || "Programa",
      petName: enrollment.pet_name || pet?.name || "Mascota",
    };
  });

  return {
    program,
    pets,
    selectedPetId,
    setSelectedPetId,
    handleEnroll,
    isEnrolling: enrollMutation.isPending,
    isLoading: isPetsLoading || isProgramsLoading,
    enrollments: enrichedEnrollments,
    isEnrollmentsLoading: isEnrollmentsLoading || isProgramsLoading || isPetsLoading,
    refetchEnrollments,
    isRefetchingEnrollments,
  };
}
