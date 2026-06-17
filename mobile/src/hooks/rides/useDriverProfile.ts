/**
 * useDriverProfile — Hook for driver profile management screen
 * Loads existing profile, manages form state, handles create/update
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  getMyDriverProfile,
  createOrUpdateDriverProfile,
} from '@/src/services/rides';
import type { DriverProfile, DriverProfileCreate } from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

export interface DriverProfileFormData {
  vehicle_model: string;
  vehicle_plate: string;
  max_capacity: string;
  has_air_conditioning: boolean;
  has_carriers: boolean;
  is_available: boolean;
}

const FORM_DEFAULTS: DriverProfileFormData = {
  vehicle_model: '',
  vehicle_plate: '',
  max_capacity: '1',
  has_air_conditioning: false,
  has_carriers: false,
  is_available: true,
};

export function useDriverProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DriverProfileFormData>(FORM_DEFAULTS);

  // Load existing profile
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<DriverProfile>({
    queryKey: ['my-driver-profile'],
    queryFn: () => getMyDriverProfile(),
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        vehicle_model: profile.vehicle_model,
        vehicle_plate: profile.vehicle_plate,
        max_capacity: String(profile.max_capacity),
        has_air_conditioning: profile.has_air_conditioning,
        has_carriers: profile.has_carriers,
        is_available: profile.is_available,
      });
    }
  }, [profile]);

  // Save/update mutation
  const saveMutation = useMutation({
    mutationFn: (data: DriverProfileCreate) => createOrUpdateDriverProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-driver-profile'] });
      showAlert({
        type: 'success',
        title: '¡Perfil Guardado!',
        message: 'Tu perfil de conductor ha sido actualizado exitosamente.',
      });
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar el perfil. Intenta de nuevo.',
      });
    },
  });

  const updateForm = (updates: Partial<DriverProfileFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    if (!form.vehicle_model.trim() || !form.vehicle_plate.trim()) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'El modelo y placa del vehículo son obligatorios.',
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
    // Form state
    form,
    updateForm,

    // Data
    isLoading,
    isError,
    isExistingProfile,

    // Actions
    handleSave,
    isSaving: saveMutation.isPending,

    // Navigation
    router,
  };
}
