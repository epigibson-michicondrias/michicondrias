/**
 * useBookAppointment — agendar o reagendar una cita.
 * Flujo: mascota → servicio → fecha → horario disponible (del backend) → motivo → confirmar.
 * Espejo de `mobile/src/hooks/directorio/useBookAppointment.ts`, sin efectos de preselección
 * (la selección se deriva de los datos).
 */
import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClinic, getClinicServices, getAvailableSlots, rescheduleAppointment } from "@/services/directorio";
import { getUserPets } from "@/services/mascotas";
import { createAppointment, getAppointment } from "@/services/citas";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";

/** YYYY-MM-DD en hora local (toISOString usa UTC y de noche cambiaría de día). */
export function toLocalYMD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function useBookAppointment() {
  const params = useParams<{ clinic_id: string }>();
  const searchParams = useSearchParams();
  const clinic_id = params.clinic_id;
  const service_id = searchParams.get("service_id") ?? undefined;
  const reschedule_id = searchParams.get("reschedule_id") ?? undefined;
  const pet_id = searchParams.get("pet_id") ?? undefined;
  const vet_id = searchParams.get("vet_id") ?? undefined;

  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [petPick, setPetPick] = useState<string | null>(pet_id ?? null);
  const [servicePick, setServicePick] = useState<string | null>(service_id ?? null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [slotPick, setSlotPick] = useState<{ key: string; slot: string } | null>(null);
  const [reason, setReason] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const isRescheduling = !!reschedule_id;

  const { data: clinic, isLoading: clinicLoading, isError: clinicError, refetch: refetchClinic } = useQuery({
    queryKey: ["clinic", clinic_id],
    queryFn: () => getClinic(clinic_id),
    enabled: !!clinic_id,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["clinic-services", clinic_id],
    queryFn: () => getClinicServices(clinic_id),
    enabled: !!clinic_id,
  });
  const activeServices = useMemo(() => services.filter((s) => s.is_active !== false), [services]);

  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: rescheduleAppointmentData } = useQuery({
    queryKey: ["appointment", reschedule_id],
    queryFn: () => getAppointment(reschedule_id!),
    enabled: !!reschedule_id,
  });

  // Selección derivada: lo que eligió el usuario, o lo único disponible / lo de la cita a reagendar.
  const selectedPet =
    petPick ??
    (isRescheduling ? rescheduleAppointmentData?.pet_id ?? "" : pets.length === 1 ? pets[0].id : "");
  const selectedService =
    servicePick ??
    rescheduleAppointmentData?.service_id ??
    (activeServices.length === 1 ? activeServices[0].id : "");

  const dateStr = toLocalYMD(selectedDate);
  const slotKey = `${dateStr}|${selectedService}`;
  const selectedSlot = slotPick && slotPick.key === slotKey ? slotPick.slot : "";

  const { data: slots = [], isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useQuery({
    queryKey: ["clinic-slots", clinic_id, dateStr, selectedService],
    queryFn: () => getAvailableSlots(clinic_id, dateStr, selectedService),
    enabled: !!clinic_id && !!selectedService,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (isRescheduling) {
        return rescheduleAppointment(reschedule_id!, dateStr, selectedSlot);
      }
      return createAppointment({
        clinic_id: clinic_id,
        pet_id: selectedPet,
        service_id: selectedService,
        date: dateStr,
        start_time: selectedSlot,
        reason: reason.trim(),
        is_emergency: isEmergency,
        ...(vet_id ? { vet_id } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-directorio-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-slots"] });
      showAlert({
        type: "success",
        title: isRescheduling ? "¡Cita reagendada!" : "¡Cita agendada!",
        message: "La clínica confirmará tu cita pronto. Puedes verla en Mis Citas.",
        onButtonPress: () => router.replace("/directorio/citas"),
      });
    },
    onError: (error: Error) => {
      // 409: el horario se ocupó mientras elegías; se refrescan los disponibles
      queryClient.invalidateQueries({ queryKey: ["clinic-slots"] });
      showAlert({
        type: "error",
        title: "No se pudo agendar",
        message: error?.message || "Por favor, intenta nuevamente.",
      });
    },
  });

  const handleAgendar = () => {
    if (!isRescheduling && !selectedPet) {
      showAlert({ type: "error", title: "Falta la mascota", message: "Selecciona a tu mascota." });
      return;
    }
    if (!selectedService) {
      showAlert({ type: "error", title: "Falta el servicio", message: "Elige el servicio que necesitas." });
      return;
    }
    if (!selectedSlot) {
      showAlert({ type: "error", title: "Falta el horario", message: "Elige uno de los horarios disponibles." });
      return;
    }
    if (!isRescheduling && !reason.trim()) {
      showAlert({ type: "error", title: "Falta el motivo", message: "Describe brevemente el motivo de la cita." });
      return;
    }
    mutation.mutate();
  };

  return {
    clinic,
    pets,
    services: activeServices,
    slots,
    clinicLoading,
    clinicError,
    refetchClinic,
    petsLoading,
    servicesLoading,
    slotsLoading,
    slotsError,
    refetchSlots,
    isRescheduling,
    selectedPet,
    selectedService,
    selectedDate,
    selectedSlot,
    reason,
    isEmergency,
    isPending: mutation.isPending,
    setSelectedPet: (id: string) => setPetPick(id),
    setSelectedService: (id: string) => setServicePick(id),
    setSelectedDate,
    setSelectedSlot: (slot: string) => setSlotPick({ key: slotKey, slot }),
    setReason,
    toggleEmergency: () => setIsEmergency((prev) => !prev),
    handleAgendar,
  };
}
