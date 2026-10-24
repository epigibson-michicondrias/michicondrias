"use client";

/**
 * Recetas médicas (`/mi-clinica/recetas`): emitidas por la clínica, surtir o cancelar, y emitir nuevas.
 * Espejo de `mobile/app/mi-clinica/recetas.tsx`. El paciente se elige con `PatientPicker` (sin segundo modal).
 */
import { AlertCircle, FileText, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import ClinicGuard from "@/features/mi-clinica/ClinicGuard";
import PatientPicker from "@/features/mi-clinica/PatientPicker";
import { formatDateMx } from "@/features/mi-clinica/format";
import { usePrescriptions } from "@/hooks/clinica/usePrescriptions";
import s from "@/features/mi-clinica/clinica.module.css";

const STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "var(--color-success)" },
  filled: { label: "Surtida", color: "var(--color-info)" },
  cancelled: { label: "Cancelada", color: "var(--color-error)" },
  expired: { label: "Vencida", color: "var(--color-text-muted)" },
};

export default function RecetasPage() {
  return (
    <ClinicGuard>
      <Recetas />
    </ClinicGuard>
  );
}

function Recetas() {
  const r = usePrescriptions();
  const med = r.newPresc.medications[0];
  const setMed = (field: keyof typeof med, value: string) =>
    r.setNewPresc({ ...r.newPresc, medications: [{ ...med, [field]: value }] });
  const open = () => r.setModalVisible(true);

  return (
    <ScreenContainer>
      <ScreenHeader title="Recetas médicas" actions={[{ icon: Plus, label: "Emitir receta", onPress: open }]} />

      {r.loadingClinics || r.loadingPrescriptions ? (
        <SkeletonList count={3} />
      ) : r.prescriptions.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No hay recetas emitidas"
          subtitle="Las recetas que emitas aquí o desde una ficha médica aparecen en esta lista."
          actionLabel="Emitir receta"
          onAction={open}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {r.prescriptions.map((p) => {
            const st = STATUS[p.status] ?? { label: p.status, color: "var(--color-warning)" };
            return (
              <article key={p.id} className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.iconBox} style={{ ["--c" as string]: "var(--color-success)" }}>
                    <FileText size={20} />
                  </span>
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>{p.patientName || "Paciente"}</span>
                    <span className={s.cardSub}>Emitida: {formatDateMx(p.issuedDate) || "—"}</span>
                  </div>
                  <Badge label={st.label} color={st.color} size="sm" />
                </div>
                <div className={s.subCard}>
                  {p.medications.map((m, idx) => (
                    <div key={idx}>
                      <div className={s.strong}>{m.name}</div>
                      <div className={s.muted}>{[m.dosage, m.frequency, m.duration && `por ${m.duration}`].filter(Boolean).join(" · ")}</div>
                    </div>
                  ))}
                </div>
                {p.notes ? (
                  <div className={s.note}>
                    <AlertCircle size={14} />
                    <span>{p.notes}</span>
                  </div>
                ) : null}
                {p.status === "active" ? (
                  <div className={s.actions}>
                    <Button label="Marcar surtida" size="sm" onPress={() => r.handleUpdateStatus(p.id, "filled")} disabled={r.isUpdatingStatus} />
                    <Button label="Cancelar receta" size="sm" variant="ghost" onPress={() => r.handleUpdateStatus(p.id, "cancelled")} disabled={r.isUpdatingStatus} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={r.modalVisible}
        title="Nueva receta"
        onClose={() => r.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => r.setModalVisible(false)} />
            <Button label="Emitir receta" onPress={r.handleSavePrescription} loading={r.loadingAction} />
          </>
        }
      >
        <PatientPicker value={r.newPresc.patientId} onChange={r.selectPatient} />
        <FormField label="Medicamento *" value={med.name} onChangeText={(t) => setMed("name", t)} placeholder="Ej: Amoxicilina 250 mg" />
        <div className={s.row2}>
          <FormField label="Dosis" value={med.dosage} onChangeText={(t) => setMed("dosage", t)} placeholder="1 tableta" />
          <FormField label="Frecuencia" value={med.frequency} onChangeText={(t) => setMed("frequency", t)} placeholder="Cada 12 horas" />
        </div>
        <FormField label="Duración" value={med.duration} onChangeText={(t) => setMed("duration", t)} placeholder="7 días" />
        <FormField
          label="Notas"
          value={r.newPresc.notes ?? ""}
          onChangeText={(t) => r.setNewPresc({ ...r.newPresc, notes: t })}
          placeholder="Dar con alimento..."
          multiline
        />
      </Modal>
    </ScreenContainer>
  );
}
