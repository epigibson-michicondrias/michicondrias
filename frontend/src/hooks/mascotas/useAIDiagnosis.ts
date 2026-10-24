/**
 * useAIDiagnosis — Diagnóstico IA (`(app)/mascotas/diagnostico-ia`).
 * Espejo de `mobile/src/hooks/mascotas/useAIDiagnosis.ts`: estado del formulario, llamadas a la IA y handlers.
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/AppAlert';
import {
  getUserPets,
  aiSymptomCheck,
  aiDietPlan,
  type SymptomCheckResponse,
  type DietPlanResponse,
} from '@/services/mascotas';

export function useAIDiagnosis(petId?: string) {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'triage' | 'diet'>('triage');

  // Triage
  const [symptoms, setSymptoms] = useState('');
  const [durationHours, setDurationHours] = useState('12');
  const [triagePetId, setTriagePetId] = useState(petId || '');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SymptomCheckResponse | null>(null);

  // Plan de dieta
  const [selectedPetId, setSelectedPetId] = useState(petId || '');
  const [activityLevel, setActivityLevel] = useState('medio');
  const [allergies, setAllergies] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dietLoading, setDietLoading] = useState(false);
  const [dietResult, setDietResult] = useState<DietPlanResponse | null>(null);

  const { data: pets = [], isLoading: loadingPets } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => (user ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const handleSymptomCheck = useCallback(async () => {
    if (symptoms.trim().length < 3) {
      showAlert({ type: 'error', title: 'Faltan datos', message: 'Describe los síntomas de tu mascota (al menos unas palabras).' });
      return;
    }
    const hours = durationHours.trim() === '' ? 12 : parseInt(durationHours, 10);
    if (isNaN(hours) || hours < 0 || hours > 24 * 365) {
      showAlert({ type: 'error', title: 'Faltan datos', message: 'Indica las horas desde que comenzaron los síntomas (número entero).' });
      return;
    }

    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await aiSymptomCheck({
        symptom_description: symptoms.trim(),
        duration_hours: hours,
        pet_id: triagePetId || undefined,
      });
      setTriageResult(res);
    } catch (err: any) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo completar el análisis de la IA.' });
    } finally {
      setTriageLoading(false);
    }
  }, [symptoms, durationHours, triagePetId]);

  /** Sin peso registrado no hay plan que calcular: la salida es ir a editarlo. */
  const alertMissingWeight = useCallback(() => {
    showAlert({
      type: 'info',
      title: 'Falta el peso',
      message: 'Registra el peso de tu mascota para calcular su plan de nutrición.',
      showCancel: true,
      cancelText: 'Ahora no',
      buttonText: 'Editar mascota',
      onButtonPress: () => router.push(`/mascotas/editar/${selectedPetId}`),
    });
  }, [router, selectedPetId]);

  const handleDietPlan = useCallback(async () => {
    if (!selectedPetId) {
      showAlert({ type: 'error', title: 'Faltan datos', message: 'Por favor selecciona una mascota.' });
      return;
    }
    const pet = pets.find((p) => p.id === selectedPetId);
    if (pet && (!pet.weight_kg || pet.weight_kg <= 0)) {
      alertMissingWeight();
      return;
    }
    const target = targetWeight.trim() === '' ? undefined : parseFloat(targetWeight.replace(',', '.'));
    if (target !== undefined && (isNaN(target) || target <= 0)) {
      showAlert({ type: 'error', title: 'Faltan datos', message: 'El peso objetivo debe ser un número mayor a cero.' });
      return;
    }

    setDietLoading(true);
    setDietResult(null);
    try {
      const res = await aiDietPlan(selectedPetId, {
        activity_level: activityLevel,
        allergies: allergies.trim() ? allergies : undefined,
        target_weight_kg: target,
      });
      setDietResult(res);
    } catch (err: any) {
      if (err?.status === 400 && /peso/i.test(err?.message || '')) {
        alertMissingWeight();
      } else {
        showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo generar el plan de nutrición.' });
      }
    } finally {
      setDietLoading(false);
    }
  }, [selectedPetId, activityLevel, allergies, targetWeight, pets, alertMissingWeight]);

  /** Urgencia → variable CSS del tema (sin hex: se pinta distinto en claro y oscuro). */
  const getTriageColor = useCallback((urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'alta':
        return 'var(--color-error)';
      case 'media':
        return 'var(--color-warning)';
      case 'baja':
        return 'var(--color-success)';
      default:
        return 'var(--color-primary)';
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    symptoms,
    setSymptoms,
    durationHours,
    setDurationHours,
    triagePetId,
    setTriagePetId,
    triageLoading,
    triageResult,
    handleSymptomCheck,
    selectedPetId,
    setSelectedPetId,
    activityLevel,
    setActivityLevel,
    allergies,
    setAllergies,
    targetWeight,
    setTargetWeight,
    dietLoading,
    dietResult,
    handleDietPlan,
    pets,
    loadingPets,
    getTriageColor,
    goAddPet: () => router.push('/mascotas/nuevo'),
  };
}
