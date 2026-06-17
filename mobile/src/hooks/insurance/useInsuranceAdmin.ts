/**
 * useInsuranceAdmin -- Hook for insurance provider management
 * Plans CRUD, policy creation, and claims management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getActivePlans,
    createPlan,
    createPolicy,
    updateClaimStatus,
} from '@/src/services/insurance';
import type {
    InsurancePlan,
    InsurancePlanCreate,
    PetInsurancePolicy,
    PetInsurancePolicyCreate,
    InsuranceClaim,
    InsuranceClaimUpdate,
} from '@/src/services/insurance';
import { showAlert } from '@/src/components/AppAlert';

export interface PlanFormData {
    name: string;
    description: string;
    coverage_limit: string;
    base_premium: string;
    min_age: string;
    max_age: string;
}

export const PLAN_FORM_DEFAULTS: PlanFormData = {
    name: '',
    description: '',
    coverage_limit: '',
    base_premium: '',
    min_age: '0',
    max_age: '20',
};

export function useInsuranceAdmin() {
    const queryClient = useQueryClient();

    const [planForm, setPlanForm] = useState<PlanFormData>({ ...PLAN_FORM_DEFAULTS });
    const [allowedSpecies, setAllowedSpecies] = useState<string[]>(['dog', 'cat']);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const updatePlanField = <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => {
        setPlanForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleSpecies = (species: string) => {
        setAllowedSpecies((prev) =>
            prev.includes(species) ? prev.filter((s) => s !== species) : [...prev, species]
        );
    };

    // Fetch active plans
    const {
        data: plans = [],
        isLoading: isLoadingPlans,
        refetch: refetchPlans,
        isRefetching: isRefetchingPlans,
    } = useQuery<InsurancePlan[]>({
        queryKey: ['insurancePlans'],
        queryFn: () => getActivePlans(),
    });

    // Collect all claims from plans' policies (if available via API)
    // For now we derive claims from plan data
    const allClaims: (InsuranceClaim & { planName?: string })[] = [];

    // Create plan mutation
    const createPlanMutation = useMutation<InsurancePlan, Error, InsurancePlanCreate>({
        mutationFn: (data) => createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurancePlans'] });
            showAlert({
                type: 'success',
                title: '¡Plan creado!',
                message: 'El plan de seguro ha sido registrado exitosamente.',
            });
            setPlanForm({ ...PLAN_FORM_DEFAULTS });
            setShowCreateForm(false);
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos crear el plan. Inténtalo de nuevo.' });
        },
    });

    // Create policy mutation
    const createPolicyMutation = useMutation<PetInsurancePolicy, Error, PetInsurancePolicyCreate>({
        mutationFn: (data) => createPolicy(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurancePolicies'] });
            showAlert({
                type: 'success',
                title: '¡Póliza creada!',
                message: 'La póliza ha sido emitida correctamente.',
            });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos crear la póliza.' });
        },
    });

    // Update claim status mutation
    const updateClaimMutation = useMutation<
        InsuranceClaim,
        Error,
        { claimId: string; data: InsuranceClaimUpdate }
    >({
        mutationFn: ({ claimId, data }) => updateClaimStatus(claimId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['insuranceClaims'] });
            queryClient.invalidateQueries({ queryKey: ['insurancePolicies'] });
            const statusLabel = variables.data.status === 'approved' ? 'aprobado' : 'rechazado';
            showAlert({
                type: 'success',
                title: 'Estado actualizado',
                message: `El reclamo ha sido ${statusLabel}.`,
            });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No pudimos actualizar el estado del reclamo.' });
        },
    });

    const handleCreatePlan = () => {
        if (!planForm.name || !planForm.coverage_limit || !planForm.base_premium) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios.' });
            return;
        }

        createPlanMutation.mutate({
            name: planForm.name,
            description: planForm.description || undefined,
            coverage_limit: parseFloat(planForm.coverage_limit),
            base_premium: parseFloat(planForm.base_premium),
            min_age: parseInt(planForm.min_age) || 0,
            max_age: parseInt(planForm.max_age) || 20,
            allowed_species: allowedSpecies,
        });
    };

    const handleUpdateClaimStatus = (claimId: string, status: string) => {
        showAlert({
            type: 'warning',
            title: `¿${status === 'approved' ? 'Aprobar' : 'Rechazar'} reclamo?`,
            message: `Esta acción cambiará el estado del reclamo a "${status === 'approved' ? 'Aprobado' : 'Rechazado'}".`,
            buttonText: 'Confirmar',
            showCancel: true,
            onButtonPress: () => updateClaimMutation.mutate({ claimId, data: { status } }),
        });
    };

    return {
        // Plans
        plans,
        isLoadingPlans,
        refetchPlans,
        isRefetchingPlans,

        // Plan form
        planForm,
        updatePlanField,
        allowedSpecies,
        toggleSpecies,
        showCreateForm,
        setShowCreateForm,
        handleCreatePlan,
        isCreatingPlan: createPlanMutation.isPending,

        // Claims
        allClaims,
        handleUpdateClaimStatus,
        isUpdatingClaim: updateClaimMutation.isPending,

        // Policy
        createPolicyMutation,
    };
}
