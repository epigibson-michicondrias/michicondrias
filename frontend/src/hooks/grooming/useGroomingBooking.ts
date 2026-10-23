/**
 * useGroomingBooking — flujo de agendar cita de estética (`(app)/grooming/agendar`).
 * Servicio → mascota → fecha → horario → confirmar. Espejo de `mobile/src/hooks/grooming/useGroomingBooking.ts`.
 */
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";
import { getActiveServices, getAvailableSlots, createAppointment } from "@/services/grooming";
import type { GroomingService, GroomingAppointmentCreate } from "@/services/grooming";
import { getUserPets } from "@/services/mascotas";
import type { Pet } from "@/types/mascotas";

/** Fecha local como `YYYY-MM-DD` (sin desfase de zona horaria). */
function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function useGroomingBooking() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState(params.get("service_id") || "");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");

  const { data: services = [], isLoading: servicesLoading } = useQuery<GroomingService[]>({
    queryKey: ["grooming-services"],
    queryFn: () => getActiveServices(),
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["user-pets", user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
  );

  const dateString = useMemo(() => toLocalIsoDate(selectedDate), [selectedDate]);
  const groomerId = selectedService?.groomer_id ?? "";

  const {
    data: availableSlots = [],
    isLoading: slotsLoading,
    isFetching: slotsFetching,
  } = useQuery<string[]>({
    queryKey: ["grooming-slots", groomerId, dateString],
    queryFn: () => getAvailableSlots(groomerId, dateString),
    enabled: !!groomerId && !!dateString,
  });

  const createMutation = useMutation({
    mutationFn: (data: GroomingAppointmentCreate) => createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-client-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["grooming-provider-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["grooming-slots"] });
      showAlert({
        type: "success",
        title: "¡Cita Agendada!",
        message: "Tu cita de grooming ha sido programada exitosamente.",
        onButtonPress: () => router.back(),
      });
    },
    onError: (e) => {
      queryClient.invalidateQueries({ queryKey: ["grooming-slots"] });
      showAlert({
        type: "error",
        title: "No se pudo agendar",
        message: errorMessage(e, "No se pudo agendar la cita. Intenta de nuevo."),
      });
    },
  });

  const canSubmit = !!selectedServiceId && !!selectedPetId && !!selectedSlot && !createMutation.isPending;

  const handleBook = () => {
    if (!selectedServiceId) {
      showAlert({ type: "error", title: "Error", message: "Selecciona un servicio." });
      return;
    }
    if (!selectedPetId) {
      showAlert({ type: "error", title: "Error", message: "Selecciona una mascota." });
      return;
    }
    if (!selectedSlot) {
      showAlert({ type: "error", title: "Error", message: "Selecciona un horario disponible." });
      return;
    }

    createMutation.mutate({
      groomer_id: groomerId,
      pet_id: selectedPetId,
      date: dateString,
      time: selectedSlot,
      service_type: selectedService?.name ?? "",
    });
  };

  return {
    services,
    pets,
    availableSlots,
    selectedService,
    selectedServiceId,
    selectedPetId,
    selectedDate,
    selectedSlot,
    dateString,
    servicesLoading,
    petsLoading,
    slotsLoading: slotsLoading || slotsFetching,
    isPending: createMutation.isPending,
    setSelectedServiceId,
    setSelectedPetId,
    setSelectedDate,
    setSelectedSlot,
    handleBook,
    canSubmit,
  };
}
