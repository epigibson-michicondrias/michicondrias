"use client";

/**
 * Configuración de la clínica (`/mi-clinica/config/[id]`): perfil público, contacto y servicios 24 h/urgencias.
 * Espejo de `mobile/app/mi-clinica/config/[id].tsx`.
 */
import { useParams } from "next/navigation";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormImagePicker from "@/components/forms/FormImagePicker";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import { SkeletonList } from "@/components/Skeleton";
import { useClinicConfig } from "@/hooks/clinica/useClinicConfig";
import s from "@/features/mi-clinica/clinica.module.css";

export default function ConfigClinicaPage() {
  return <ConfigClinica />;
}

function ConfigClinica() {
  const { id } = useParams<{ id: string }>();
  const c = useClinicConfig(id);
  const { form, updateField } = c;

  if (c.loadingClinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Configuración" />
        <SkeletonList count={5} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Configuración" subtitle="Perfil de tu clínica" />

      <div className={s.form}>
        <FormImagePicker
          label="Logo de la clínica"
          preview={c.logoFile ? URL.createObjectURL(c.logoFile) : form.logo_url || null}
          onChange={c.setLogoFile}
        />

        <FormSection title="Información general">
          <FormField label="Nombre de la clínica *" value={form.name} onChangeText={(v) => updateField("name", v)} />
          <FormField label="Descripción" value={form.description || ""} onChangeText={(v) => updateField("description", v)} multiline placeholder="Especialidades, equipo, qué te distingue" />
        </FormSection>

        <FormSection title="Contacto y ubicación">
          <FormField label="Dirección" value={form.address || ""} onChangeText={(v) => updateField("address", v)} />
          <div className={s.row2}>
            <FormField label="Ciudad" value={form.city || ""} onChangeText={(v) => updateField("city", v)} />
            <FormField label="Estado" value={form.state || ""} onChangeText={(v) => updateField("state", v)} />
          </div>
          <div className={s.row2}>
            <FormField label="Teléfono" value={form.phone || ""} onChangeText={(v) => updateField("phone", v)} keyboardType="phone-pad" />
            <FormField label="Correo" value={form.email || ""} onChangeText={(v) => updateField("email", v)} keyboardType="email-address" autoCapitalize="none" />
          </div>
          <FormField label="Sitio web" value={form.website || ""} onChangeText={(v) => updateField("website", v)} keyboardType="url" autoCapitalize="none" placeholder="https://" />
        </FormSection>

        <FormSection title="Servicios y disponibilidad">
          <FormSwitch label="Servicio 24 horas" description="Tu clínica nunca cierra" value={!!form.is_24_hours} onChange={(v) => updateField("is_24_hours", v)} />
          <FormSwitch label="Urgencias médicas" description="Ofreces atención inmediata de emergencia" value={!!form.has_emergency} onChange={(v) => updateField("has_emergency", v)} />
        </FormSection>

        <Button label="Guardar cambios" onPress={c.handleSave} loading={c.loading} disabled={c.loading} size="lg" />
      </div>
    </ScreenContainer>
  );
}
