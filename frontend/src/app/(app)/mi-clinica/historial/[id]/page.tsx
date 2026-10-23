"use client";

/**
 * Generar ficha médica (`/mi-clinica/historial/nuevo?appointment_id=…` o `/mi-clinica/historial/<id de cita>`).
 * Espejo de `mobile/app/mi-clinica/historial/[id].tsx`.
 */
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Pill, Plus, Stethoscope, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import IconButton from "@/components/IconButton";
import { SkeletonList } from "@/components/Skeleton";
import ClinicGuard from "@/features/mi-clinica/ClinicGuard";
import { usePatientHistory } from "@/hooks/clinica/usePatientHistory";
import s from "@/features/mi-clinica/clinica.module.css";

export default function FichaMedicaPage() {
  return (
    <ClinicGuard>
      <Suspense fallback={<SkeletonList count={4} />}>
        <FichaMedica />
      </Suspense>
    </ClinicGuard>
  );
}

function FichaMedica() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = useSearchParams().get("appointment_id") || undefined;
  const h = usePatientHistory(id, appointmentId);

  return (
    <ScreenContainer>
      <ScreenHeader title="Generar ficha" subtitle="Expediente clínico digital" />

      <div className={s.form}>
        <div className={s.banner}>
          <Stethoscope size={24} />
          <div className={s.cardInfo}>
            <span className={s.strong}>Consulta médica</span>
            <span className={s.muted}>
              {h.appointment ? `Paciente: ${h.appointment.pet_name || "sin nombre"}` : "Cargando cita..."}
            </span>
          </div>
        </div>

        <FormSection title="Información de la visita">
          <FormField label="Motivo de consulta *" value={h.reason} onChangeText={h.setReason} placeholder="Ej: revisión postoperatoria" />
          <div className={s.row2}>
            <FormField label="Peso (kg)" value={h.weight} onChangeText={h.setWeight} keyboardType="decimal-pad" placeholder="4.2" />
            <FormField label="Temperatura (°C)" value={h.temp} onChangeText={h.setTemp} keyboardType="decimal-pad" placeholder="38.5" />
          </div>
        </FormSection>

        <FormSection title="Evaluación clínica">
          <FormField label="Diagnóstico *" value={h.diagnosis} onChangeText={h.setDiagnosis} multiline placeholder="Describe el diagnóstico médico..." />
          <FormField label="Tratamiento sugerido" value={h.treatment} onChangeText={h.setTreatment} multiline placeholder="Indica el tratamiento a seguir..." />
          <FormField label="Notas" value={h.notes} onChangeText={h.setNotes} multiline placeholder="Observaciones para el expediente" />
        </FormSection>

        <FormSection title="Receta médica">
          {h.prescriptions.length === 0 ? <div className={s.dashed}>Sin medicamentos recetados.</div> : null}
          {h.prescriptions.map((p, idx) => (
            <div key={idx} className={s.subCard}>
              <div className={s.subCardHead}>
                <Pill size={18} />
                <span>Medicamento {idx + 1}</span>
                <IconButton icon={Trash2} accessibilityLabel={`Quitar medicamento ${idx + 1}`} onPress={() => h.removePrescription(idx)} color="var(--color-error)" size="sm" />
              </div>
              <FormField label="Fármaco" value={p.medication_name} onChangeText={(v) => h.updatePrescription(idx, "medication_name", v)} placeholder="Nombre del medicamento" />
              <FormField label="Dosis" value={p.dosage} onChangeText={(v) => h.updatePrescription(idx, "dosage", v)} placeholder="Ej: 1 tableta, 5 ml" />
              <div className={s.row2}>
                <FormField label="Cada (horas)" value={String(p.frequency_hours)} onChangeText={(v) => h.updatePrescription(idx, "frequency_hours", v.replace(/\D/g, ""))} keyboardType="numeric" />
                <FormField label="Durante (días)" value={String(p.duration_days)} onChangeText={(v) => h.updatePrescription(idx, "duration_days", v.replace(/\D/g, ""))} keyboardType="numeric" />
              </div>
              <FormField label="Instrucciones" value={p.instructions} onChangeText={(v) => h.updatePrescription(idx, "instructions", v)} placeholder="Con alimento, etc." />
            </div>
          ))}
          <Button label="Añadir medicamento" icon={<Plus size={16} />} variant="secondary" onPress={h.addPrescriptionRow} />
        </FormSection>

        <Button label="Guardar expediente" onPress={h.handleSave} loading={h.loading} disabled={h.loading} size="lg" />
      </div>
    </ScreenContainer>
  );
}
