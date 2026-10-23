/**
 * useDriverProfile — perfil de conductor (`(app)/transportistas/perfil-conductor`): alta/edición del vehículo.
 * Espejo de `mobile/src/hooks/rides/useDriverProfile.ts`; el formulario se deriva del perfil cargado
 * (sin `setState` en `useEffect`) y solo se vuelve local al editar.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMyDriverProfile, createOrUpdateDriverProfile } from "@/services/rides";
import type { DriverProfile, DriverProfileCreate } from "@/services/rides";
import { showAlert } from "@/components/AppAlert";

export interface DriverProfileFormData {
  vehicle_model: string;
  vehicle_plate: string;
  max_capacity: string;
  has_air_conditioning: boolean;
  has_carriers: boolean;
  is_available: boolean;
}

const FORM_DEFAULTS: DriverProfileFormData = {
  vehicle_model: "",
  vehicle_plate: "",
  max_capacity: "1",
  has_air_conditioning: false,
  has_carriers: false,
  is_available: true,
};

function fromProfile(p: DriverProfile): DriverProfileFormData {
  return {
    vehicle_model: p.vehicle_model,
    vehicle_plate: p.vehicle_plate,
    max_capacity: String(p.max_capacity),
    has_air_conditioning: p.has_air_conditioning,
    has_carriers: p.has_carriers,
    is_available: p.is_available,
  };
}

export function useDriverProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // null = aún sin editar: se muestra lo que venga del servidor
  const [draft, setDraft] = useState<DriverProfileFormData | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<DriverProfile>({
    queryKey: ["my-driver-profile"],
    queryFn: () => getMyDriverProfile(),
  });

  const form = draft ?? (profile ? fromProfile(profile) : FORM_DEFAULTS);

  const saveMutation = useMutation({
    mutationFn: (data: DriverProfileCreate) => createOrUpdateDriverProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-driver-profile"] });
      showAlert({
        type: "success",
        title: "¡Perfil Guardado!",
        message: "Tu perfil de conductor ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      showAlert({
        type: "error",
        title: "Error",
        message: "No se pudo guardar el perfil. Intenta de nuevo.",
      });
    },
  });

  const updateForm = (updates: Partial<DriverProfileFormData>) => {
    setDraft((prev) => ({ ...(prev ?? form), ...updates }));
  };

  const handleSave = () => {
    if (!form.vehicle_model.trim() || !form.vehicle_plate.trim()) {
      showAlert({
        type: "error",
        title: "Error",
        message: "El modelo y placa del vehículo son obligatorios.",
      });
      return;
    }

    saveMutation.mutate({
      vehicle_model: form.vehicle_model,
      vehicle_plate: form.vehicle_plate,
      max_capacity: parseInt(form.max_capacity, 10) || 1,
      has_air_conditioning: form.has_air_conditioning,
      has_carriers: form.has_carriers,
      is_available: form.is_available,
    });
  };

  const isExistingProfile = !!profile;

  return {
    form,
    updateForm,
    isLoading,
    isError,
    isExistingProfile,
    handleSave,
    isSaving: saveMutation.isPending,
    router,
  };
}
