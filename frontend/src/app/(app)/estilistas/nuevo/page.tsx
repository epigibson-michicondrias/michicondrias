"use client";

/**
 * Nuevo servicio de estética (`/estilistas/nuevo`). Espejo de `mobile/app/estilistas/nuevo.tsx`.
 */
import { Scissors, Info } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import RoleGuard from "@/components/RoleGuard";
import { useGroomingForm } from "@/hooks/grooming/useGroomingForm";
import l from "../estilistas.module.css";

function NuevoServicioContent() {
  const { form, errors, loading, updateField, handleSubmit } = useGroomingForm();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nuevo servicio" subtitle="Los clientes lo verán en el catálogo de estética" />

      <FormSection title="Servicio">
        <FormField
          label="Nombre *"
          value={form.name}
          onChangeText={(v) => updateField("name", v)}
          placeholder="Ej. Baño y corte higiénico"
          maxLength={80}
          error={errors.name}
        />
        <FormField
          label="Descripción"
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          placeholder="Qué incluye, productos que usas…"
          multiline
        />
      </FormSection>

      <FormSection title="Precio y duración">
        <div className={l.row2}>
          <FormField
            label="Precio (MXN) *"
            value={form.price}
            onChangeText={(v) => updateField("price", v)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.price}
          />
          <FormField
            label="Duración (min) *"
            value={form.duration_minutes}
            onChangeText={(v) => updateField("duration_minutes", v.replace(/\D/g, ""))}
            placeholder="30"
            keyboardType="number-pad"
            maxLength={3}
            error={errors.duration_minutes}
          />
        </div>
      </FormSection>

      <div className={l.noteBox}>
        <Info size={16} />
        <span>Los clientes podrán agendar este servicio contigo en los horarios libres de tu agenda.</span>
      </div>

      <Button
        label="Publicar servicio"
        icon={<Scissors size={18} />}
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: "var(--space-xl)" }}
      />
    </ScreenContainer>
  );
}

export default function NuevoServicioPage() {
  return (
    <RoleGuard roles={["estilista"]} message="Publicar servicios es solo para cuentas de estilista.">
      <NuevoServicioContent />
    </RoleGuard>
  );
}
