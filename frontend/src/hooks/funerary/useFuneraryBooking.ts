/**
 * useFuneraryBooking — reserva de servicios funerarios (`(app)/funeraria/reservar` y `/mis-reservas`).
 * Espejo de `mobile/src/hooks/funerary/useFuneraryBooking.ts`. Acepta `?service_id=`.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveFuneraryServices,
  getClientBookings,
  createBooking,
  updateBookingStatus,
  type FuneraryService,
  type FuneraryBooking,
  type FuneraryBookingCreate,
} from "@/services/funerary";
import { showAlert } from "@/components/AppAlert";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useFuneraryBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(() =>
    searchParams.get("service_id"),
  );
  const [form, setForm] = useState<Omit<FuneraryBookingCreate, "service_id">>({
    pet_id: "",
    scheduled_date: toISODate(new Date()),
    notes: "",
  });

  const updateForm = (field: keyof Omit<FuneraryBookingCreate, "service_id">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedServiceId(null);
    setForm({ pet_id: "", scheduled_date: toISODate(new Date()), notes: "" });
  };

  const {
    data: availableServices = [],
    isLoading: isLoadingServices,
    refetch: refetchServices,
  } = useQuery<FuneraryService[]>({
    queryKey: ["funerary-services-booking"],
    queryFn: getActiveFuneraryServices,
  });

  const {
    data: clientBookings = [],
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
    isRefetching,
  } = useQuery<FuneraryBooking[]>({
    queryKey: ["funerary-client-bookings"],
    queryFn: getClientBookings,
  });

  const bookingMutation = useMutation({
    mutationFn: (data: FuneraryBookingCreate) => createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funerary-client-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["funerary-provider-bookings"] });
      showAlert({
        type: "success",
        title: "Solicitud enviada",
        message:
          "La funeraria recibirá tu reserva y te avisaremos cuando la confirme. Puedes seguirla en Mis Reservas.",
        onButtonPress: () => router.replace("/funeraria/mis-reservas"),
      });
      resetForm();
    },
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo reservar",
        message: e?.message || "No se pudo crear la reserva. Intenta de nuevo.",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBookingStatus(id, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funerary-client-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["funerary-provider-bookings"] });
    },
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No se pudo cancelar",
        message: e?.message || "Intenta de nuevo.",
      });
    },
  });

  const handleCancel = (id: string) => {
    showAlert({
      type: "warning",
      title: "¿Cancelar la reserva?",
      message: "La funeraria será notificada.",
      buttonText: "Sí, cancelar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => cancelMutation.mutate(id),
    });
  };

  const handleBooking = () => {
    if (!selectedServiceId || !form.pet_id || !form.scheduled_date) {
      showAlert({
        type: "error",
        title: "Datos incompletos",
        message: "Selecciona un servicio, tu mascota y la fecha para continuar.",
      });
      return;
    }
    if (form.scheduled_date < toISODate(new Date())) {
      showAlert({
        type: "error",
        title: "Fecha inválida",
        message: "La fecha no puede estar en el pasado.",
      });
      return;
    }
    bookingMutation.mutate({
      service_id: selectedServiceId,
      pet_id: form.pet_id,
      scheduled_date: form.scheduled_date,
      notes: form.notes || undefined,
    });
  };

  return {
    form,
    updateForm,
    resetForm,
    selectedServiceId,
    setSelectedServiceId,
    availableServices,
    clientBookings,
    isLoadingServices,
    isLoadingBookings,
    isBookingsError,
    isRefetching,
    refetchServices,
    refetchBookings,
    handleBooking,
    isBooking: bookingMutation.isPending,
    handleCancel,
    isCancelling: cancelMutation.isPending,
  };
}

export { toISODate };
