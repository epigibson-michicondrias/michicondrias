/**
 * useInsuranceAdmin — gestión de la aseguradora (`(app)/aseguradoras/nuevo` y `/gestion`).
 * Espejo de `mobile/src/hooks/insurance/useInsuranceAdmin.ts`.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyPlans,
  setPlanActive,
  getProviderClaims,
  createPlan,
  updateClaimStatus,
} from "@/services/insurance";
import type {
  InsurancePlan,
  InsurancePlanCreate,
  InsuranceClaimUpdate,
  InsuranceClaimDetail,
} from "@/services/insurance";
import { showAlert } from "@/components/AppAlert";

export interface PlanFormData {
  name: string;
  description: string;
  coverage_limit: string;
  base_premium: string;
  min_age: string;
  max_age: string;
}

export const PLAN_FORM_DEFAULTS: PlanFormData = {
  name: "",
  description: "",
  coverage_limit: "",
  base_premium: "",
  min_age: "0",
  max_age: "20",
};

export function useInsuranceAdmin() {
  const queryClient = useQueryClient();

  const [planForm, setPlanForm] = useState<PlanFormData>({ ...PLAN_FORM_DEFAULTS });
  const [allowedSpecies, setAllowedSpecies] = useState<string[]>(["dog", "cat"]);

  const updatePlanField = <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => {
    setPlanForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecies = (species: string) => {
    setAllowedSpecies((prev) =>
      prev.includes(species) ? prev.filter((s) => s !== species) : [...prev, species],
    );
  };

  const {
    data: plans = [],
    isLoading: isLoadingPlans,
    refetch: refetchPlans,
    isRefetching,
  } = useQuery<InsurancePlan[]>({
    queryKey: ["insurancePlansMine"],
    queryFn: getMyPlans,
  });

  const {
    data: allClaims = [],
    isLoading: isLoadingClaims,
  } = useQuery<InsuranceClaimDetail[]>({
    queryKey: ["insuranceClaims", "provider"],
    queryFn: getProviderClaims,
  });

  const toggleActiveMutation = useMutation<InsurancePlan, Error, { planId: string; active: boolean }>({
    mutationFn: ({ planId, active }) => setPlanActive(planId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurancePlansMine"] });
      queryClient.invalidateQueries({ queryKey: ["insurancePlans"] });
    },
    onError: (e) =>
      showAlert({ type: "error", title: "No se pudo actualizar", message: e.message || "Inténtalo de nuevo." }),
  });

  const createPlanMutation = useMutation<InsurancePlan, Error, InsurancePlanCreate>({
    mutationFn: (data) => createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurancePlans"] });
      queryClient.invalidateQueries({ queryKey: ["insurancePlansMine"] });
      showAlert({
        type: "success",
        title: "¡Plan creado!",
        message: "El plan de seguro ha sido registrado exitosamente.",
      });
      setPlanForm({ ...PLAN_FORM_DEFAULTS });
      setAllowedSpecies(["dog", "cat"]);
    },
    onError: (e) =>
      showAlert({ type: "error", title: "No se pudo crear el plan", message: e.message || "Inténtalo de nuevo." }),
  });

  const updateClaimMutation = useMutation<
    unknown,
    Error,
    { claimId: string; data: InsuranceClaimUpdate }
  >({
    mutationFn: ({ claimId, data }) => updateClaimStatus(claimId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurancePolicies"] });
      const statusLabel = variables.data.status === "approved" ? "aprobado" : "rechazado";
      showAlert({
        type: "success",
        title: "Estado actualizado",
        message: `El reclamo ha sido ${statusLabel}.`,
      });
    },
    onError: (e) =>
      showAlert({ type: "error", title: "No se pudo actualizar el reclamo", message: e.message || "Inténtalo de nuevo." }),
  });

  const handleCreatePlan = () => {
    const coverage = parseFloat(planForm.coverage_limit.replace(",", "."));
    const premium = parseFloat(planForm.base_premium.replace(",", "."));
    const minAge = parseInt(planForm.min_age, 10);
    const maxAge = parseInt(planForm.max_age, 10);

    if (!planForm.name.trim()) {
      showAlert({ type: "error", title: "Datos incompletos", message: "El nombre del plan es obligatorio." });
      return;
    }
    if (Number.isNaN(coverage) || coverage <= 0 || Number.isNaN(premium) || premium <= 0) {
      showAlert({
        type: "error",
        title: "Montos inválidos",
        message: "La cobertura y la prima deben ser mayores a cero.",
      });
      return;
    }
    if (Number.isNaN(minAge) || Number.isNaN(maxAge) || minAge < 0 || maxAge < minAge) {
      showAlert({
        type: "error",
        title: "Rango de edad inválido",
        message: "Revisa la edad mínima y máxima del plan.",
      });
      return;
    }
    if (allowedSpecies.length === 0) {
      showAlert({
        type: "error",
        title: "Datos incompletos",
        message: "Selecciona al menos una especie permitida.",
      });
      return;
    }

    createPlanMutation.mutate({
      name: planForm.name.trim(),
      description: planForm.description.trim() || undefined,
      coverage_limit: coverage,
      base_premium: premium,
      min_age: minAge,
      max_age: maxAge,
      allowed_species: allowedSpecies,
    });
  };

  /** Resolución de un reclamo, con confirmación previa (acción difícil de deshacer). */
  const handleUpdateClaimStatus = (claimId: string, status: string) => {
    showAlert({
      type: "warning",
      title: `¿${status === "approved" ? "Aprobar" : "Rechazar"} reclamo?`,
      message: `Esta acción cambiará el estado del reclamo a "${status === "approved" ? "Aprobado" : "Rechazado"}".`,
      buttonText: "Confirmar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => updateClaimMutation.mutate({ claimId, data: { status } }),
    });
  };

  return {
    planForm,
    updatePlanField,
    allowedSpecies,
    toggleSpecies,
    handleCreatePlan,
    isCreatingPlan: createPlanMutation.isPending,
    plans,
    isLoadingPlans,
    refetchPlans,
    isRefetching,
    allClaims,
    isLoadingClaims,
    toggleActive: (planId: string, active: boolean) => toggleActiveMutation.mutate({ planId, active }),
    handleUpdateClaimStatus,
    updateClaimStatus: (claimId: string, status: string) =>
      updateClaimMutation.mutate({ claimId, data: { status } }),
    isUpdatingClaim: updateClaimMutation.isPending,
  };
}
