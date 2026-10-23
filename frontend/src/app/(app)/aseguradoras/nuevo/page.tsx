"use client";

/**
 * Nuevo plan de seguro (aseguradora). Espejo de `mobile/app/aseguradoras/nuevo.tsx`.
 */
import { Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import RoleGuard from "@/components/RoleGuard";
import { useInsuranceAdmin } from "@/hooks/insurance/useInsuranceAdmin";

function NuevoPlanContent() {
  const { planForm, updatePlanField, allowedSpecies, toggleSpecies, handleCreatePlan, isCreatingPlan } =
    useInsuranceAdmin();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nuevo Plan" subtitle="Registra un plan de seguro" />

      <FormSection title="Información del plan">
        <FormField
          label="Nombre *"
          value={planForm.name}
          onChangeText={(v) => updatePlanField("name", v)}
          placeholder="Ej. Plan Esencial"
        />
        <FormField
          label="Descripción"
          value={planForm.description}
          onChangeText={(v) => updatePlanField("description", v)}
          placeholder="Describe la cobertura y beneficios"
          multiline
          numberOfLines={3}
        />
        <FormField
          label="Cobertura máxima (MXN) *"
          value={planForm.coverage_limit}
          onChangeText={(v) => updatePlanField("coverage_limit", v)}
          placeholder="Ej. 50000"
          keyboardType="decimal-pad"
        />
        <FormField
          label="Prima base mensual (MXN) *"
          value={planForm.base_premium}
          onChangeText={(v) => updatePlanField("base_premium", v)}
          placeholder="Ej. 450"
          keyboardType="decimal-pad"
        />
      </FormSection>

      <FormSection title="Elegibilidad">
        <FormField
          label="Edad mínima (años)"
          value={planForm.min_age}
          onChangeText={(v) => updatePlanField("min_age", v)}
          keyboardType="number-pad"
        />
        <FormField
          label="Edad máxima (años)"
          value={planForm.max_age}
          onChangeText={(v) => updatePlanField("max_age", v)}
          keyboardType="number-pad"
        />
        <FormSwitch
          label="Perros"
          description="El plan aplica a perros"
          variant="checkbox"
          value={allowedSpecies.includes("dog")}
          onChange={() => toggleSpecies("dog")}
        />
        <FormSwitch
          label="Gatos"
          description="El plan aplica a gatos"
          variant="checkbox"
          value={allowedSpecies.includes("cat")}
          onChange={() => toggleSpecies("cat")}
        />
      </FormSection>

      <Button
        label={isCreatingPlan ? "Guardando…" : "Publicar plan"}
        onPress={handleCreatePlan}
        loading={isCreatingPlan}
        icon={<Check size={18} />}
      />
    </ScreenContainer>
  );
}

export default function NuevoPlanPage() {
  return (
    <RoleGuard roles={["aseguradora"]} message="Esta sección es para cuentas de aseguradora.">
      <NuevoPlanContent />
    </RoleGuard>
  );
}
