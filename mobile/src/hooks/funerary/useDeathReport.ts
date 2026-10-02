/**
 * useDeathReport — Hook for death report and certificate screens
 * Handles recording pet death reports and downloading death certificates
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  recordDeathReport,
  downloadDeathCertificate,
  PetDeathCreate,
  PetDeath,
} from '@/src/services/funerary';
import { toISODate } from '@/src/features/salud/format';
import { showAlert } from '@/src/components/AppAlert';

export function useDeathReport(deathId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Form state ---
  const [form, setForm] = useState<PetDeathCreate>({
    pet_id: '',
    date_of_death: toISODate(new Date()),
    cause_of_death: '',
    cremation_type: 'individual',
    urn_model: '',
    notes: '',
  });

  const updateForm = (field: keyof PetDeathCreate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      pet_id: '',
      date_of_death: toISODate(new Date()),
      cause_of_death: '',
      cremation_type: 'individual',
      urn_model: '',
      notes: '',
    });
  };

  // --- Mutations ---
  const reportMutation = useMutation({
    mutationFn: (data: PetDeathCreate) => recordDeathReport(data),
    onSuccess: (result: PetDeath) => {
      queryClient.invalidateQueries({ queryKey: ['user-pets'] });
      queryClient.invalidateQueries({ queryKey: ['funerary-provider-bookings'] });
      showAlert({
        type: 'success',
        title: 'Reporte registrado',
        message: 'El reporte de defunción ha sido registrado exitosamente.',
        onButtonPress: () => router.replace(`/funeraria/certificado/${result.id}` as any),
      });
      resetForm();
    },
    onError: (e: any) => {
      showAlert({
        type: 'error',
        title: 'No se pudo registrar',
        message: e?.message || 'No se pudo registrar el reporte. Intenta de nuevo.',
      });
    },
  });

  const handleSubmitReport = () => {
    if (!form.pet_id || !form.date_of_death) {
      showAlert({
        type: 'error',
        title: 'Datos incompletos',
        message: 'La mascota y la fecha de defunción son obligatorias.',
      });
      return;
    }
    if (form.date_of_death > toISODate(new Date())) {
      showAlert({ type: 'error', title: 'Fecha inválida', message: 'La fecha de defunción no puede ser futura.' });
      return;
    }
    reportMutation.mutate({
      pet_id: form.pet_id,
      date_of_death: form.date_of_death,
      cause_of_death: form.cause_of_death || undefined,
      cremation_type: form.cremation_type || undefined,
      urn_model: form.urn_model || undefined,
      notes: form.notes || undefined,
    });
  };

  // --- Certificate query ---
  const {
    data: certificate,
    isLoading: isLoadingCertificate,
    refetch: refetchCertificate,
  } = useQuery<any>({
    queryKey: ['death-certificate', deathId],
    queryFn: () => downloadDeathCertificate(deathId!),
    enabled: !!deathId,
  });

  return {
    // Form
    form,
    updateForm,
    resetForm,

    // Mutations
    handleSubmitReport,
    isSubmitting: reportMutation.isPending,

    // Certificate
    certificate,
    isLoadingCertificate,
    refetchCertificate,

    // Navigation
    router,
  };
}
