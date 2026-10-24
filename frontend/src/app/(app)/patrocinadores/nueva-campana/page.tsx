"use client";

/**
 * Nueva campaña (`/patrocinadores/nueva-campana`).
 * Espejo de `mobile/app/patrocinadores/nueva-campana.tsx`. `/patrocinadores/nuevo` redirige aquí.
 */
import { Info } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import RoleGuard from "@/components/RoleGuard";
import { useCampaignForm } from "@/hooks/sponsors/useCampaignForm";
import s from "@/features/patrocinadores/patrocinadores.module.css";

export default function NuevaCampanaPage() {
  return (
    <RoleGuard roles={["patrocinador"]}>
      <NuevaCampana />
    </RoleGuard>
  );
}

function NuevaCampana() {
  const { campaignForm, campaignErrors, updateCampaignField, handleSubmitCampaign, isSubmittingCampaign } =
    useCampaignForm("campaign");

  return (
    <ScreenContainer>
      <ScreenHeader title="Nueva campaña" subtitle="Crea una campaña publicitaria" />

      <div className={s.form}>
        <FormSection title="Información de la campaña">
          <FormField
            label="Nombre de la campaña *"
            value={campaignForm.title}
            onChangeText={(v) => updateCampaignField("title", v)}
            placeholder="Ej. Promo de esterilización de gatos"
            error={campaignErrors.title}
          />
          <FormField
            label="URL del banner *"
            value={campaignForm.banner_url}
            onChangeText={(v) => updateCampaignField("banner_url", v)}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
            error={campaignErrors.banner_url}
          />
          <FormField
            label="Enlace de destino"
            value={campaignForm.target_link}
            onChangeText={(v) => updateCampaignField("target_link", v)}
            placeholder="https://... (opcional)"
            keyboardType="url"
            autoCapitalize="none"
            error={campaignErrors.target_link}
          />
        </FormSection>

        <FormSection title="Presupuesto">
          <FormField
            label="Presupuesto máximo (MXN) *"
            value={campaignForm.budget_limit}
            onChangeText={(v) => updateCampaignField("budget_limit", v.replace(/[^\d.]/g, ""))}
            placeholder="5000"
            keyboardType="decimal-pad"
            error={campaignErrors.budget_limit}
          />
        </FormSection>

        <div className={s.notice}>
          <Info size={18} className={s.noticeIcon} aria-hidden />
          <span>El presupuesto se irá descontando conforme los usuarios interactúen con tu campaña.</span>
        </div>

        <Button
          label="Crear campaña"
          onPress={handleSubmitCampaign}
          loading={isSubmittingCampaign}
          disabled={isSubmittingCampaign}
        />
      </div>
    </ScreenContainer>
  );
}
