"use client";

/**
 * Registrar consultorio o clínica en el directorio (rol vet/hospital).
 * Espejo de `mobile/app/directorio/nuevo.tsx`.
 */
import { Info, Send } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import RoleGuard from "@/components/RoleGuard";
import { useClinicForm } from "@/hooks/directorio/useClinicForm";
import s from "./nuevo.module.css";

function NuevoRegistroContent() {
  const { form, errors, updateField, handleSubmit, saving } = useClinicForm();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Registrar en el directorio"
        subtitle="Tu consultorio o clínica, visible para los dueños"
      />

      <form
        className={s.content}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FormSection title="Datos">
          <FormField
            label="Nombre *"
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Ej. Veterinaria San José"
            error={errors.name}
          />
          <FormField
            label="Dirección"
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Calle, número y colonia"
            autoComplete="street-address"
          />
          <div className={s.row}>
            <FormField
              label="Ciudad *"
              value={form.city}
              onChangeText={(v) => updateField("city", v)}
              placeholder="Ej. CDMX"
              error={errors.city}
            />
            <FormField
              label="Teléfono *"
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              placeholder="10 dígitos"
              keyboardType="phone-pad"
              autoComplete="tel"
              error={errors.phone}
            />
          </div>
          <FormField
            label="Sitio web o Facebook"
            value={form.website}
            onChangeText={(v) => updateField("website", v)}
            placeholder="https://…"
            keyboardType="url"
            autoCapitalize="none"
            error={errors.website}
          />
          <FormField
            label="Descripción"
            value={form.description}
            onChangeText={(v) => updateField("description", v)}
            placeholder="Especialidades y servicios"
            multiline
            numberOfLines={3}
          />
        </FormSection>

        <FormSection title="Atención">
          <FormSwitch
            variant="switch"
            label="Abierto 24 horas"
            description="Atención todo el día"
            value={form.is_24_hours}
            onChange={(v) => updateField("is_24_hours", v)}
          />
          <FormSwitch
            variant="switch"
            label="Urgencias"
            description="Equipo listo para emergencias"
            value={form.has_emergency}
            onChange={(v) => updateField("has_emergency", v)}
          />
        </FormSection>

        <div className={s.note}>
          <Info size={15} color="var(--color-info)" />
          <p className={s.noteText}>Michicondrias verifica tu cédula y el negocio antes de publicarlo.</p>
        </div>

        <Button
          label="Enviar a revisión"
          icon={<Send size={18} />}
          loading={saving}
          size="lg"
          type="submit"
        />
      </form>
    </ScreenContainer>
  );
}

export default function NuevoRegistroPage() {
  return (
    <RoleGuard roles={["veterinario", "hospital", "admin"]}>
      <NuevoRegistroContent />
    </RoleGuard>
  );
}
