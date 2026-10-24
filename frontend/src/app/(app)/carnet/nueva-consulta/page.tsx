"use client";

/**
 * Nueva consulta — espejo de `mobile/app/carnet/nueva-consulta.tsx`. Con `?id=` edita.
 */
import { Suspense } from "react";
import { Info, Plus, Save, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import Card from "@/components/Card";
import { useConsultationForm } from "@/hooks/carnet/useConsultationForm";
import s from "../../pages.module.css";

function NuevaConsultaForm() {
  const {
    errors, isEditing,
    reason, setReason, diagnosis, setDiagnosis, treatment, setTreatment, notes, setNotes,
    weight, setWeight, temp, setTemp,
    prescriptions, addPrescription, updatePrescription, removePrescription,
    handleSave, isSaving,
  } = useConsultationForm();

  return (
    <ScreenContainer>
      <ScreenHeader
        title={isEditing ? "Editar consulta" : "Nueva consulta"}
        subtitle="El dueño la ve en el carnet de su mascota"
      />

      <FormSection title="Motivo y diagnóstico">
        <FormField
          label="Motivo *"
          value={reason}
          onChangeText={setReason}
          placeholder="Ej. Control anual"
          error={errors.reason}
        />
        <FormField
          label="Diagnóstico"
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Opcional"
          multiline
          numberOfLines={2}
        />
        <FormField
          label="Tratamiento"
          value={treatment}
          onChangeText={setTreatment}
          placeholder="Opcional"
          multiline
          numberOfLines={2}
        />
        <FormField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opcional"
          multiline
          numberOfLines={2}
        />
      </FormSection>

      <FormSection title="Signos vitales">
        <div className={s.formRow}>
          <FormField
            label="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="Ej. 4.2"
            keyboardType="decimal-pad"
            error={errors.weight}
          />
          <FormField
            label="Temperatura (°C)"
            value={temp}
            onChangeText={setTemp}
            placeholder="Ej. 38.5"
            keyboardType="decimal-pad"
            error={errors.temp}
          />
        </div>
      </FormSection>

      {!isEditing && (
        <FormSection title="Receta">
          {prescriptions.map((p, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong>Medicamento {i + 1}</strong>
                <button
                  type="button"
                  className={s.iconGhost}
                  onClick={() => removePrescription(i)}
                  aria-label={`Quitar medicamento ${i + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <FormField
                label="Nombre"
                value={p.medication_name}
                onChangeText={(v) => updatePrescription(i, "medication_name", v)}
                placeholder="Ej. Amoxicilina"
              />
              <FormField
                label="Dosis"
                value={p.dosage}
                onChangeText={(v) => updatePrescription(i, "dosage", v)}
                placeholder="Ej. 1 tableta"
              />
              <div className={s.formRow}>
                <FormField
                  label="Cada (h)"
                  value={String(p.frequency_hours)}
                  onChangeText={(v) => updatePrescription(i, "frequency_hours", Number(v) || 0)}
                  keyboardType="number-pad"
                />
                <FormField
                  label="Durante (días)"
                  value={String(p.duration_days)}
                  onChangeText={(v) => updatePrescription(i, "duration_days", Number(v) || 0)}
                  keyboardType="number-pad"
                />
              </div>
            </Card>
          ))}
          <Button
            label="Agregar medicamento"
            variant="secondary"
            icon={<Plus size={18} />}
            onPress={addPrescription}
          />
          <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-sm)", display: "flex", gap: 6 }}>
            <Info size={16} aria-hidden />
            Los medicamentos de la receta generan recordatorios para el dueño en la pestaña Salud.
          </p>
        </FormSection>
      )}

      <Button
        label={isSaving ? "Guardando…" : "Guardar consulta"}
        onPress={handleSave}
        loading={isSaving}
        icon={<Save size={20} />}
      />
    </ScreenContainer>
  );
}

export default function NuevaConsultaPage() {
  return (
    <Suspense fallback={null}>
      <NuevaConsultaForm />
    </Suspense>
  );
}
