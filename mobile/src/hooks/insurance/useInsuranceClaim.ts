/**
 * useInsuranceClaim -- Hook for filing insurance claims
 * Manages claim form state, pet/policy data, and submission
 */
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { createClaim, verifyClaimReceipt, getActivePolicyByPet } from '@/src/services/insurance';
import type { InsuranceClaimCreate, InsuranceClaim, PetInsurancePolicy } from '@/src/services/insurance';
import { getUserPets, getMascotasPresignedUrl } from '@/src/services/mascotas';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';
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
    const { pet_id } = useLocalSearchParams<{ pet_id?: string }>();
    const [selectedPetId, setSelectedPetId] = useState<string | null>(pet_id || null);
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
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
                message: 'La aseguradora revisará tu reclamo y te avisaremos cuando lo resuelva. Puedes seguirlo en Mis Pólizas.',
                onButtonPress: () => router.replace('/aseguradoras/mis-polizas' as any),
            });
            setForm({ ...CLAIM_FORM_DEFAULTS });
            setReceiptUri(null);
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No pudimos enviar el reclamo', message: e.message || 'Inténtalo de nuevo.' });
        },
    });

    // Verify receipt mutation
    const verifyMutation = useMutation({
        mutationFn: (claimId: string) => verifyClaimReceipt(claimId),
        onSuccess: (data) => {
            setVerificationResult(data);
            showAlert({
                type: data?.is_valid ? 'info' : 'warning',
                title: 'Revisión del comprobante',
                message: data?.message || 'No se pudo revisar el comprobante.',
            });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo verificar el recibo.' });
        },
    });

    const handleSubmit = async () => {
        if (!activePolicy) {
            showAlert({ type: 'error', title: 'Sin póliza', message: 'La mascota seleccionada no tiene una póliza activa.' });
            return;
        }
        if (!form.reason.trim()) {
            showAlert({ type: 'error', title: 'Falta el motivo', message: 'Describe el motivo del reclamo.' });
            return;
        }
        const amount = parseFloat(form.amount_claimed.replace(',', '.'));
        if (!form.amount_claimed || isNaN(amount) || amount <= 0) {
            showAlert({ type: 'error', title: 'Monto inválido', message: 'Ingresa un monto reclamado mayor a cero.' });
            return;
        }

        let receiptUrl: string | undefined = form.medical_receipt_url.trim() || undefined;
        if (receiptUri) {
            setIsUploading(true);
            try {
                const ext = getFileExtension(receiptUri);
                const { url, object_key } = await getMascotasPresignedUrl(ext);
                await uploadImageToPresignedUrl(receiptUri, url, ext);
                receiptUrl = getS3Url(object_key);
            } catch {
                showAlert({ type: 'error', title: 'No se pudo subir el comprobante', message: 'Revisa tu conexión e inténtalo de nuevo.' });
                return;
            } finally {
                setIsUploading(false);
            }
        }

        claimMutation.mutate({
            policy_id: activePolicy.id,
            amount_claimed: amount,
            reason: form.reason.trim(),
            medical_receipt_url: receiptUrl,
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
        isSubmitting: claimMutation.isPending || isUploading,
        receiptUri,
        setReceiptUri,
        isVerifying: verifyMutation.isPending,

        // Actions
        setSelectedPetId,
        handleSubmit,
        verifyReceipt: verifyMutation.mutate,
    };
}
