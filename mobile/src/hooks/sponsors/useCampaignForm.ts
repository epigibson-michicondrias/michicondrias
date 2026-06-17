/**
 * useCampaignForm — Hook for campaign creation and boosted alert forms
 * Manages form state, validation, and API mutations
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    createCampaign,
    createBoostedAlert,
    SponsorCampaign,
    BoostedAlert,
    SponsorCampaignCreate,
    BoostedAlertCreate,
} from '@/src/services/sponsors';
import { getReports, LostPetReport } from '@/src/services/perdidas';
import { showAlert } from '@/src/components/AppAlert';

export interface CampaignFormData {
    title: string;
    banner_url: string;
    target_link: string;
    budget_limit: string;
    is_boosted: boolean;
}

export interface BoostFormData {
    lost_pet_report_id: string;
    extra_radius_meters: string;
    amount_paid: string;
}

export function useCampaignForm(mode: 'campaign' | 'boost' = 'campaign') {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Campaign form state
    const [campaignForm, setCampaignForm] = useState<CampaignFormData>({
        title: '',
        banner_url: '',
        target_link: '',
        budget_limit: '',
        is_boosted: false,
    });

    // Boost form state
    const [boostForm, setBoostForm] = useState<BoostFormData>({
        lost_pet_report_id: '',
        extra_radius_meters: '5000',
        amount_paid: '',
    });

    // Fetch lost pet reports for boost mode
    const { data: lostPetReports = [], isLoading: isLoadingReports } = useQuery<LostPetReport[]>({
        queryKey: ['lost-pet-reports-active'],
        queryFn: () => getReports('lost', 'active'),
        enabled: mode === 'boost',
    });

    // Create campaign mutation
    const createCampaignMutation = useMutation<SponsorCampaign, Error, SponsorCampaignCreate>({
        mutationFn: (data) => createCampaign(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sponsor-campaigns'] });
            showAlert({
                type: 'success',
                title: '¡Campaña creada!',
                message: 'Tu campaña publicitaria ha sido creada exitosamente.',
            });
            router.back();
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo crear la campaña. Intenta de nuevo.',
            });
        },
    });

    // Create boosted alert mutation
    const createBoostMutation = useMutation<BoostedAlert, Error, BoostedAlertCreate>({
        mutationFn: (data) => createBoostedAlert(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sponsor-campaigns'] });
            showAlert({
                type: 'success',
                title: '¡Alerta impulsada!',
                message: 'Tu alerta de mascota perdida ha sido impulsada exitosamente.',
            });
            router.back();
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo impulsar la alerta. Intenta de nuevo.',
            });
        },
    });

    const updateCampaignField = (field: keyof CampaignFormData, value: string | boolean) => {
        setCampaignForm(prev => ({ ...prev, [field]: value }));
    };

    const updateBoostField = (field: keyof BoostFormData, value: string) => {
        setBoostForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitCampaign = () => {
        if (!campaignForm.title.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre de la campaña es requerido.' });
            return;
        }
        if (!campaignForm.budget_limit || Number(campaignForm.budget_limit) <= 0) {
            showAlert({ type: 'error', title: 'Error', message: 'El presupuesto debe ser mayor a 0.' });
            return;
        }
        if (!campaignForm.banner_url.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'La URL del banner es requerida.' });
            return;
        }

        createCampaignMutation.mutate({
            title: campaignForm.title.trim(),
            banner_url: campaignForm.banner_url.trim(),
            target_link: campaignForm.target_link.trim() || undefined,
            budget_limit: Number(campaignForm.budget_limit),
        });
    };

    const handleSubmitBoost = () => {
        if (!boostForm.lost_pet_report_id) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona un reporte de mascota perdida.' });
            return;
        }
        if (!boostForm.amount_paid || Number(boostForm.amount_paid) <= 0) {
            showAlert({ type: 'error', title: 'Error', message: 'El monto debe ser mayor a 0.' });
            return;
        }

        createBoostMutation.mutate({
            lost_pet_report_id: boostForm.lost_pet_report_id,
            extra_radius_meters: Number(boostForm.extra_radius_meters) || undefined,
            amount_paid: Number(boostForm.amount_paid),
        });
    };

    return {
        // Campaign form
        campaignForm,
        updateCampaignField,
        handleSubmitCampaign,
        isSubmittingCampaign: createCampaignMutation.isPending,

        // Boost form
        boostForm,
        updateBoostField,
        handleSubmitBoost,
        isSubmittingBoost: createBoostMutation.isPending,

        // Lost pet reports
        lostPetReports,
        isLoadingReports,

        // Navigation
        router,
    };
}
