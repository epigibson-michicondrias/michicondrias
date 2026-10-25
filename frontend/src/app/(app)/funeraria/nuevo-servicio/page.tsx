"use client";

/**
 * Nuevo Servicio funerario (funeraria). Espejo de `mobile/app/funeraria/nuevo-servicio.tsx`.
 */
import { useRouter } from "next/navigation";
import { Heart, Info, CheckCircle2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import RoleGuard from "@/components/RoleGuard";
import { CREMATION_OPTIONS } from "@/services/funerary";
import { useFuneraryProvider } from "@/hooks/funerary/useFuneraryProvider";
import local from "../funeraria.module.css";

function NuevoServicioContent() {
  const router = useRouter();
  const { form, updateForm, handleCreateService, isCreatingService } = useFuneraryProvider();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nuevo Servicio" subtitle="Registra un servicio funerario" />

      <FormSection title="Información del servicio">
        <FormField
          label="Nombre *"
          value={form.name}
          onChangeText={(v) => updateForm("name", v)}
          placeholder="Ej. Cremación individual"
        />
        <FormField
          label="Descripción"
          value={form.description}
          onChangeText={(v) => updateForm("description", v)}
          placeholder="Describe el servicio..."
          multiline
          numberOfLines={3}
        />
        <FormField
          label="Precio (MXN) *"
          value={form.price}
          onChangeText={(v) => updateForm("price", v)}
          placeholder="Ej. 1500"
          keyboardType="decimal-pad"
        />
        <FormSelect
          label="Tipo de cremación"
          options={CREMATION_OPTIONS}
          value={form.cremation_type}
          onChange={(v) => updateForm("cremation_type", v)}
          horizontal
        />
        <FormSwitch
          label="Urna incluida"
          description="El servicio incluye urna"
          value={form.urn_included}
          onChange={(v) => updateForm("urn_included", v)}
        />
      </FormSection>

      <div className={local.noteBox}>
        <Info size={16} aria-hidden />
        <span>
          El nombre y precio son obligatorios. El servicio quedará visible para los clientes al publicarlo.
        </span>
      </div>

      <div style={{ marginTop: "var(--space-lg)" }}>
        <Button
          label={isCreatingService ? "Registrando..." : "Registrar Servicio"}
          onPress={handleCreateService}
          loading={isCreatingService}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      <div style={{ marginTop: "var(--space-md)" }}>
        <Button
          label="Cancelar"
          variant="ghost"
          onPress={() => (window.history.length > 1 ? router.back() : router.replace("/funeraria"))}
          icon={<Heart size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}

export default function NuevoServicioPage() {
  return (
    <RoleGuard roles={["funeraria"]} message="Esta sección es para cuentas de funeraria.">
      <NuevoServicioContent />
    </RoleGuard>
  );
}
