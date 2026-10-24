"use client";

/**
 * Nueva vacuna — espejo de `mobile/app/carnet/nueva-vacuna.tsx`. Con `?id=` edita una vacuna existente.
 */
import { Suspense } from "react";
import { Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import { useVaccineForm } from "@/hooks/carnet/useVaccineForm";

function NuevaVacunaForm() {
  const {
    isEditing, name, setName, nameError, batch, setBatch,
    appliedOn, setAppliedOn, nextDue, setNextDue, addNextDue, notes, setNotes,
    handleSave, isSaving,
  } = useVaccineForm();

  return (
    <ScreenContainer>
      <ScreenHeader title={isEditing ? "Editar vacuna" : "Nueva vacuna"} />

      <FormSection title="Datos de la vacuna">
        <FormField
          label="Nombre *"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Antirrábica"
          error={nameError}
        />
        <FormField
          label="Lote"
          value={batch}
          onChangeText={setBatch}
          placeholder="Opcional"
        />
        <FormField
          label="Fecha de aplicación"
          value={appliedOn}
          onChangeText={setAppliedOn}
          keyboardType="default"
          hint="Se guarda a mediodía para no desfasar el día"
        />
        <div>
          <FormField
            label="Refuerzo"
            value={nextDue}
            onChangeText={setNextDue}
            placeholder="AAAA-MM-DD"
            hint="Opcional. Propón un año con el botón."
          />
          <Button label="Refuerzo en 1 año" variant="ghost" size="sm" fullWidth={false} onPress={addNextDue} />
        </div>
        <FormField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opcional"
          multiline
          numberOfLines={2}
        />
      </FormSection>

      <Button
        label={isSaving ? "Guardando…" : isEditing ? "Guardar cambios" : "Registrar vacuna"}
        onPress={handleSave}
        loading={isSaving}
        icon={<Check size={20} />}
      />
    </ScreenContainer>
  );
}

export default function NuevaVacunaPage() {
  return (
    <Suspense fallback={null}>
      <NuevaVacunaForm />
    </Suspense>
  );
}
