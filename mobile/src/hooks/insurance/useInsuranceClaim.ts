/**
 * useInsuranceClaim -- Hook for filing insurance claims
 * Manages claim form state, pet/policy data, and submission
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { createClaim, verifyClaimReceipt, getActivePolicyByPet } from '@/src/services/insurance';
import type { InsuranceClaimCreate, InsuranceClaim, PetInsurancePolicy } from '@/src/services/insurance';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';
import { showAlert } from '@/src/components/AppAlert';

export interface ClaimFormData {
    reason: string;
    amount_claimed: string;
    medical_receipt_url: string;
}

const CLAIM_FORM_DEFAULTS: ClaimFormData = {
    reason: '',
    amount_claimed: '',
    medical_receipt_url: '',
};

export function useInsuranceClaim() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<ClaimFormData>({ ...CLAIM_FORM_DEFAULTS });
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const updateField = <K extends keyof ClaimFormData>(field: K, value: ClaimFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Fetch user's pets
    const {
        data: pets = [],
        isLoading: isLoadingPets,
    } = useQuery<Pet[]>({
        queryKey: ['user-pets', user?.id],
        queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
        enabled: !!user?.id,
    });

    // Fetch active policy for the selected pet
    const {
        data: activePolicy,
        isLoading: isLoadingPolicy,
    } = useQuery<PetInsurancePolicy | null>({
        queryKey: ['petPolicy', selectedPetId],
        queryFn: async () => {
            if (!selectedPetId) return null;
            try {
                return await getActivePolicyByPet(selectedPetId);
            } catch {
                return null;
            }
        },
        enabled: !!selectedPetId,
    });

    const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;

    // Create claim mutation
    const claimMutation = useMutation<InsuranceClaim, Error, InsuranceClaimCreate>({
        mutationFn: (data) => createClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insuranceClaims'] });
            queryClient.invalidateQueries({ queryKey: ['insurancePolicies'] });
            showAlert({
                type: 'success',
                title: '¡Reclamo enviado!',
                message: 'Tu reclamo ha sido registrado y será revisado pronto.',
                onButtonPress: () => router.back(),
            });
            setForm({ ...CLAIM_FORM_DEFAULTS });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos enviar el reclamo.' });
        },
    });

    // Verify receipt mutation
    const verifyMutation = useMutation({
        mutationFn: (claimId: string) => verifyClaimReceipt(claimId),
        onSuccess: (data) => {
            setVerificationResult(data);
            showAlert({
                type: 'success',
                title: 'Verificación completada',
                message: 'El recibo ha sido verificado con IA.',
            });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo verificar el recibo.' });
        },
    });

    const handleSubmit = () => {
        if (!activePolicy) {
            showAlert({ type: 'error', title: 'Error', message: 'La mascota seleccionada no tiene una póliza activa.' });
            return;
        }
        if (!form.reason) {
            showAlert({ type: 'error', title: 'Error', message: 'Describe el motivo del reclamo.' });
            return;
        }
        if (!form.amount_claimed) {
            showAlert({ type: 'error', title: 'Error', message: 'Ingresa el monto reclamado.' });
            return;
        }

        claimMutation.mutate({
            policy_id: activePolicy.id,
            amount_claimed: parseFloat(form.amount_claimed),
            reason: form.reason,
            medical_receipt_url: form.medical_receipt_url || undefined,
        });
    };

    return {
        // Form
        form,
        updateField,

        // Data
        pets,
        selectedPetId,
        selectedPet,
        activePolicy,
        verificationResult,

        // Loading states
        isLoading: isLoadingPets,
        isLoadingPolicy,
        isSubmitting: claimMutation.isPending,
        isVerifying: verifyMutation.isPending,

        // Actions
        setSelectedPetId,
        handleSubmit,
        verifyReceipt: verifyMutation.mutate,
    };
}
