/**
 * useAIDiagnosis — Hook for AI diagnosis screen
 * Extracts form state, API calls, and handlers from app/mascotas/diagnostico-ia.tsx
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import {
  getUserPets,
  aiSymptomCheck,
  aiDietPlan,
  SymptomCheckResponse,
  DietPlanResponse,
} from '@/src/services/mascotas';

export function useAIDiagnosis() {
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<'triage' | 'diet'>('triage');

  // Triage State
  const [symptoms, setSymptoms] = useState('');
  const [durationHours, setDurationHours] = useState('12');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<SymptomCheckResponse | null>(null);

  // Diet Plan State
  const [selectedPetId, setSelectedPetId] = useState(petId || '');
  const [activityLevel, setActivityLevel] = useState('medio');
  const [allergies, setAllergies] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dietLoading, setDietLoading] = useState(false);
  const [dietResult, setDietResult] = useState<DietPlanResponse | null>(null);

  // Fetch user pets for diet planner selection
  const { data: pets = [], isLoading: loadingPets } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => (user ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const handleSymptomCheck = useCallback(async () => {
    if (!symptoms.trim()) {
      showAlert({ type: 'error', title: 'Error', message: 'Por favor ingresa una descripción de los síntomas.' });
      return;
    }

    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await aiSymptomCheck({
        symptom_description: symptoms,
        duration_hours: parseInt(durationHours, 10) || 12,
      });
      setTriageResult(res);
    } catch (err: any) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo completar el análisis de la IA.' });
    } finally {
      setTriageLoading(false);
    }
  }, [symptoms, durationHours]);

  const handleDietPlan = useCallback(async () => {
    if (!selectedPetId) {
      showAlert({ type: 'error', title: 'Error', message: 'Por favor selecciona una mascota.' });
      return;
    }

    setDietLoading(true);
    setDietResult(null);
    try {
      const res = await aiDietPlan(selectedPetId, {
        activity_level: activityLevel,
        allergies: allergies.trim() ? allergies : undefined,
        target_weight_kg: targetWeight ? parseFloat(targetWeight) : undefined,
      });
      setDietResult(res);
    } catch (err: any) {
      showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo generar el plan de nutrición.' });
    } finally {
      setDietLoading(false);
    }
  }, [selectedPetId, activityLevel, allergies, targetWeight]);

  const getTriageColor = useCallback(
    (urgency: string) => {
      switch (urgency.toLowerCase()) {
        case 'alta':
          return '#ef4444';
        case 'media':
          return '#f59e0b';
        case 'baja':
          return '#10b981';
        default:
          return theme.primary;
      }
    },
    [theme.primary],
  );

  return {
    // Tab
    activeTab,
    setActiveTab,

    // Triage
    symptoms,
    setSymptoms,
    durationHours,
    setDurationHours,
    triageLoading,
    triageResult,
    handleSymptomCheck,

    // Diet
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

    // Pets
    pets,
    loadingPets,

    // Helpers
    getTriageColor,

    // Navigation
    router,
  };
}
