/**
 * useInsuranceAdmin -- Hook for insurance provider management
 * Plans CRUD, policy creation, and claims management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMyPlans,
    setPlanActive,
    getProviderClaims,
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
    InsuranceClaimDetail,
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
        queryKey: ['insurancePlansMine'],
        queryFn: () => getMyPlans(),
    });

    // Reclamos sobre las pólizas de esta aseguradora
    const {
        data: allClaims = [],
        isLoading: isLoadingClaims,
    } = useQuery<InsuranceClaimDetail[]>({
        queryKey: ['insuranceClaims', 'provider'],
        queryFn: () => getProviderClaims(),
    });

    const toggleActiveMutation = useMutation<InsurancePlan, Error, { planId: string; active: boolean }>({
        mutationFn: ({ planId, active }) => setPlanActive(planId, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurancePlansMine'] });
            queryClient.invalidateQueries({ queryKey: ['insurancePlans'] });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    // Create plan mutation
    const createPlanMutation = useMutation<InsurancePlan, Error, InsurancePlanCreate>({
        mutationFn: (data) => createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insurancePlans'] });
            queryClient.invalidateQueries({ queryKey: ['insurancePlansMine'] });
            showAlert({
                type: 'success',
                title: '¡Plan creado!',
                message: 'El plan de seguro ha sido registrado exitosamente.',
            });
            setPlanForm({ ...PLAN_FORM_DEFAULTS });
            setShowCreateForm(false);
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No pudimos crear el plan', message: e.message || 'Inténtalo de nuevo.' });
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
        onError: (e) => {
            showAlert({ type: 'error', title: 'No pudimos actualizar el reclamo', message: e.message || 'Inténtalo de nuevo.' });
        },
    });

    const handleCreatePlan = () => {
        if (!planForm.name.trim() || !planForm.coverage_limit || !planForm.base_premium) {
            showAlert({ type: 'error', title: 'Datos incompletos', message: 'Por favor completa los campos obligatorios.' });
            return;
        }
        const coverage = parseFloat(planForm.coverage_limit.replace(',', '.'));
        const premium = parseFloat(planForm.base_premium.replace(',', '.'));
        if (isNaN(coverage) || coverage <= 0 || isNaN(premium) || premium <= 0) {
            showAlert({ type: 'error', title: 'Montos inválidos', message: 'La cobertura y la prima deben ser mayores a cero.' });
            return;
        }
        const minAge = parseInt(planForm.min_age) || 0;
        const maxAge = parseInt(planForm.max_age) || 20;
        if (minAge > maxAge) {
            showAlert({ type: 'error', title: 'Edades inválidas', message: 'La edad mínima no puede ser mayor que la máxima.' });
            return;
        }
        if (allowedSpecies.length === 0) {
            showAlert({ type: 'error', title: 'Especies', message: 'Selecciona al menos una especie.' });
            return;
        }

        createPlanMutation.mutate({
            name: planForm.name.trim(),
            description: planForm.description || undefined,
            coverage_limit: coverage,
            base_premium: premium,
            min_age: minAge,
            max_age: maxAge,
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
            cancelText: 'Volver',
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
        isLoadingClaims,
        toggleActive: (planId: string, active: boolean) => toggleActiveMutation.mutate({ planId, active }),
        handleUpdateClaimStatus,
        isUpdatingClaim: updateClaimMutation.isPending,

        // Policy
        createPolicyMutation,
    };
}
