/**
 * useDriverProfile — perfil de conductor (`(app)/transportistas/perfil-conductor`): alta/edición del vehículo.
 * El 404 del GET es el flujo de alta (aún no hay perfil), no un error de red.
 * Espejo de `mobile/src/hooks/rides/useDriverProfile.ts`.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyDriverProfile, createOrUpdateDriverProfile } from "@/services/rides";
import type { DriverProfile, DriverProfileCreate } from "@/services/rides";
import { showAlert } from "@/components/AppAlert";
import { ApiError } from "@/lib/api";

export interface DriverProfileFormData {
  vehicle_model: string;
  vehicle_plate: string;
  max_capacity: string;
  has_air_conditioning: boolean;
  has_carriers: boolean;
  is_available: boolean;
}

export type DriverProfileErrors = Partial<
  Record<"vehicle_model" | "vehicle_plate" | "max_capacity", string>
>;

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
  const queryClient = useQueryClient();
  // null = aún sin editar: se muestra lo que venga del servidor
  const [draft, setDraft] = useState<DriverProfileFormData | null>(null);
  const [errors, setErrors] = useState<DriverProfileErrors>({});

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<DriverProfile | null>({
    queryKey: ["my-driver-profile"],
    queryFn: async () => {
      try {
        return await getMyDriverProfile();
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 1,
  });

  const form = draft ?? (profile ? fromProfile(profile) : FORM_DEFAULTS);

  const saveMutation = useMutation({
    mutationFn: (data: DriverProfileCreate) => createOrUpdateDriverProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-driver-profile"] });
      showAlert({
        type: "success",
        title: "¡Perfil guardado!",
        message: "Tu perfil de conductor ha sido actualizado exitosamente.",
      });
    },
    onError: (e: any) => {
      showAlert({
        type: "error",
        title: "No se pudo guardar",
        message: e?.message || "Intenta de nuevo.",
      });
    },
  });

  const updateForm = (updates: Partial<DriverProfileFormData>) => {
    setDraft((prev) => ({ ...(prev ?? form), ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(updates) as (keyof DriverProfileErrors)[]) {
        if (next[k]) next[k] = undefined;
      }
      return next;
    });
  };

  const handleSave = () => {
    const next: DriverProfileErrors = {};
    if (!form.vehicle_model.trim()) next.vehicle_model = "Escribe el modelo del vehículo.";
    if (!form.vehicle_plate.trim()) next.vehicle_plate = "Escribe la placa del vehículo.";
    const capacity = parseInt(form.max_capacity, 10);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20)
      next.max_capacity = "Entre 1 y 20 mascotas.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    saveMutation.mutate({
      vehicle_model: form.vehicle_model.trim(),
      vehicle_plate: form.vehicle_plate.trim(),
      max_capacity: capacity,
      has_air_conditioning: form.has_air_conditioning,
      has_carriers: form.has_carriers,
      is_available: form.is_available,
    });
  };

  const isExistingProfile = !!profile;

  return {
    form,
    errors,
    updateForm,
    isLoading,
    isError,
    isExistingProfile,
    handleSave,
    isSaving: saveMutation.isPending,
    refetch,
    isRefetching,
  };
}
