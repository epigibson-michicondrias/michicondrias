/**
 * useQuote -- Hook for insurance quote & subscription flow
 * Fetches active plans, user pets, calculates quotes, and subscribes
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import {
    getActivePlans,
    calculateQuote,
    subscribeToPlan,
} from '@/src/services/insurance';
import type {
    InsurancePlan,
    InsuranceQuoteOut,
    InsuranceQuoteRequest,
    InsuranceSubscribeRequest,
} from '@/src/services/insurance';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';
import { showAlert } from '@/src/components/AppAlert';

export function useQuote() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [hasPreexisting, setHasPreexisting] = useState(false);
    const [quote, setQuote] = useState<InsuranceQuoteOut | null>(null);

    // Fetch active plans
    const {
        data: plans = [],
        isLoading: isLoadingPlans,
    } = useQuery<InsurancePlan[]>({
        queryKey: ['insurancePlans'],
        queryFn: () => getActivePlans(),
    });

    // Fetch user's pets
    const {
        data: pets = [],
        isLoading: isLoadingPets,
    } = useQuery<Pet[]>({
        queryKey: ['user-pets', user?.id],
        queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
        enabled: !!user?.id,
    });

    const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;
    const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

    // Calculate quote mutation
    const quoteMutation = useMutation({
        mutationFn: (data: InsuranceQuoteRequest) => calculateQuote(data),
        onSuccess: (data) => {
            setQuote(data);
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos calcular la cotización.' });
        },
    });

    // Subscribe mutation
    const subscribeMutation = useMutation({
        mutationFn: (data: InsuranceSubscribeRequest) => subscribeToPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurancePolicies'] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            showAlert({
                type: 'success',
                title: '¡Suscripción exitosa!',
                message: 'Tu mascota ahora está asegurada. La póliza ha sido creada.',
                onButtonPress: () => router.back(),
            });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos completar la suscripción.' });
        },
    });

    const handleCalculateQuote = () => {
        if (!selectedPet || !selectedPlanId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona una mascota y un plan.' });
            return;
        }

        const petAgeYears = selectedPet.age_months ? Math.round(selectedPet.age_months / 12) : 1;

        quoteMutation.mutate({
            plan_id: selectedPlanId,
            pet_age: petAgeYears,
            pet_species: selectedPet.species,
            has_preexisting_conditions: hasPreexisting,
        });
    };

    const handleSubscribe = () => {
        if (!selectedPet || !selectedPlanId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona una mascota y un plan.' });
            return;
        }

        const petAgeYears = selectedPet.age_months ? Math.round(selectedPet.age_months / 12) : 1;

        subscribeMutation.mutate({
            pet_id: selectedPet.id,
            plan_id: selectedPlanId,
            pet_age: petAgeYears,
            pet_species: selectedPet.species,
            has_preexisting_conditions: hasPreexisting,
        });
    };

    return {
        // Data
        plans,
        pets,
        quote,
        selectedPetId,
        selectedPlanId,
        selectedPet,
        selectedPlan,
        hasPreexisting,

        // Loading states
        isLoading: isLoadingPlans || isLoadingPets,
        isCalculating: quoteMutation.isPending,
        isSubscribing: subscribeMutation.isPending,

        // Actions
        setSelectedPetId,
        setSelectedPlanId,
        setHasPreexisting,
        handleCalculateQuote,
        handleSubscribe,
    };
}
