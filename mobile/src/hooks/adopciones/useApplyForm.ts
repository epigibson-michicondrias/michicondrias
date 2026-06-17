/**
 * useApplyForm — Hook for adoption application form
 * Manages multi-step form state, validation, security gates, and submission
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getListing, requestAdoption, AdoptionRequestCreate } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function useApplyForm() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState<AdoptionRequestCreate>({
        applicant_name: user?.full_name || '',
        house_type: 'Casa',
        has_yard: true,
        own_or_rent: 'Propia',
        landlord_permission: true,
        other_pets: '',
        has_children: false,
        children_ages: '',
        hours_alone: 4,
        financial_commitment: true,
        reason: '',
        previous_experience: '',
    });

    const { data: listing, isLoading: loadingListing } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
    });

    // Security checks
    const isAdminOrVet = user?.role_name === 'admin' || user?.role_name === 'veterinario';
    const isVerified = user?.verification_status === 'VERIFIED';
    const isPending = user?.verification_status === 'PENDING';

    const updateField = <K extends keyof AdoptionRequestCreate>(
        field: K,
        value: AdoptionRequestCreate[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!form.applicant_name) {
                showAlert({ type: 'error', title: 'Error', message: 'Tu nombre es obligatorio' });
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!form.hours_alone && form.hours_alone !== 0) {
                showAlert({ type: 'error', title: 'Error', message: 'Indica las horas que pasará solo' });
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const handleSubmit = async () => {
        if (!form.reason) {
            showAlert({ type: 'error', title: 'Error', message: 'Cuéntanos por qué deseas adoptar' });
            return;
        }
        if (!form.financial_commitment) {
            showAlert({ type: 'error', title: 'Error', message: 'Debes aceptar el compromiso financiero' });
            return;
        }

        setLoading(true);
        try {
            await requestAdoption(id as string, form);
            setSuccess(true);
        } catch (error) {
            console.error(error);
            showAlert({
                type: 'error',
                title: 'Error',
                message: (error as Error).message || 'No se pudo enviar la solicitud.',
            });
        } finally {
            setLoading(false);
        }
    };

    const goToMyApplications = () => router.push('/adopciones/mis-solicitudes');
    const goToVerification = () => router.push('/perfil/verificacion');
    const goBack = () => router.back();

    return {
        // Data
        listing,
        loadingListing,
        form,
        step,
        loading,
        success,
        user,

        // Security
        isAdminOrVet,
        isVerified,
        isPending,

        // Actions
        updateField,
        setForm,
        handleNext,
        handleBack,
        handleSubmit,
        goToMyApplications,
        goToVerification,
        goBack,
    };
}
