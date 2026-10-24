"use client";

/**
 * Laboratorio de la clínica (`/mi-clinica/laboratorio`): órdenes pendientes y completadas, solicitar y capturar
 * resultados. Espejo de `mobile/app/mi-clinica/laboratorio.tsx`.
 */
import { CheckCircle2, Clock, Edit3, FlaskConical, Plus, TestTube2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import SegmentedControl from "@/components/SegmentedControl";
import { SkeletonList } from "@/components/Skeleton";
import ClinicGuard from "@/features/mi-clinica/ClinicGuard";
import PatientPicker from "@/features/mi-clinica/PatientPicker";
import { formatDateMx } from "@/features/mi-clinica/format";
import { useLaboratory } from "@/hooks/clinica/useLaboratory";
import s from "@/features/mi-clinica/clinica.module.css";

const TABS: { value: "pending" | "completed"; label: string; icon: typeof Clock }[] = [
  { value: "pending", label: "Pendientes", icon: Clock },
  { value: "completed", label: "Completados", icon: CheckCircle2 },
];

export default function LaboratorioPage() {
  return (
    <ClinicGuard>
      <Laboratorio />
    </ClinicGuard>
  );
}

function Laboratorio() {
  const l = useLaboratory();
  const pending = l.filter === "pending";
  const open = () => l.setModalVisible(true);

  return (
    <ScreenContainer>
      <ScreenHeader title="Laboratorio" actions={[{ icon: Plus, label: "Nueva orden de laboratorio", onPress: open }]} />

      <div className={s.filters}>
        <SegmentedControl value={l.filter} onChange={l.setFilter} options={TABS} accessibilityLabel="Estado de las pruebas" />
      </div>

      {l.loadingClinics || l.loadingTests ? (
        <SkeletonList count={3} />
      ) : l.labTests.length === 0 ? (
        <EmptyState
          icon={<TestTube2 size={28} />}
          title={pending ? "No hay pruebas pendientes" : "Aún no hay resultados"}
          subtitle={pending ? "Solicita una prueba para un paciente de la clínica." : "Las pruebas con resultados capturados aparecen aquí."}
          actionLabel={pending ? "Solicitar prueba" : undefined}
          onAction={pending ? open : undefined}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {l.labTests.map((test) => (
            <article key={test.id} className={s.card}>
              <div className={s.cardHead}>
                <span className={s.iconBox} style={{ ["--c" as string]: pending ? "var(--color-warning)" : "var(--color-success)" }}>
                  <FlaskConical size={20} />
                </span>
                <div className={s.cardInfo}>
                  <span className={s.cardTitle}>{test.testName}</span>
                  <span className={s.cardSub}>{test.testType}</span>
                </div>
              </div>
              <div className={s.stats} style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className={s.stat}>
                  <span className={s.statLabel}>Paciente</span>
                  <span className={s.statValue}>{test.patientName || "Paciente"}</span>
                </div>
                <div className={s.stat}>
                  <span className={s.statLabel}>Solicitado</span>
                  <span className={s.statValue}>{formatDateMx(test.requestedDate) || "—"}</span>
                </div>
              </div>
              {!pending && test.results ? (
                <div className={s.subCard}>
                  <span className={s.statLabel}>Resultados</span>
                  <span>{typeof test.results === "string" ? test.results : JSON.stringify(test.results)}</span>
                  {test.interpretation ? <span className={s.muted}>{test.interpretation}</span> : null}
                </div>
              ) : null}
              {pending ? (
                <div className={s.actions}>
                  <Button label="Capturar resultados" icon={<Edit3 size={16} />} size="sm" variant="secondary" onPress={() => l.handleOpenResultModal(test.id)} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Modal
        open={l.modalVisible}
        title="Solicitar prueba"
        onClose={() => l.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => l.setModalVisible(false)} />
            <Button label="Solicitar" onPress={l.handleSaveTest} loading={l.loadingAction} />
          </>
        }
      >
        <PatientPicker value={l.newTest.patientId} onChange={(id) => l.setNewTest({ ...l.newTest, patientId: id })} />
        <FormField label="Tipo de prueba *" value={l.newTest.testType} onChangeText={(t) => l.setNewTest({ ...l.newTest, testType: t })} placeholder="Sangre, orina, genética..." />
        <FormField label="Nombre del examen *" value={l.newTest.testName} onChangeText={(t) => l.setNewTest({ ...l.newTest, testName: t })} placeholder="Ej: hemograma completo" />
        <FormField label="Notas" value={l.newTest.description ?? ""} onChangeText={(t) => l.setNewTest({ ...l.newTest, description: t })} placeholder="Instrucciones adicionales" multiline />
      </Modal>

      <Modal
        open={l.resultModalVisible}
        title="Capturar resultados"
        onClose={() => l.setResultModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => l.setResultModalVisible(false)} />
            <Button label="Guardar" onPress={l.handleSaveResults} loading={l.isSavingResults} />
          </>
        }
      >
        <FormField label="Resultados *" value={l.resultData.results} onChangeText={(t) => l.setResultData({ ...l.resultData, results: t })} placeholder="Valores y hallazgos del examen" multiline />
        <FormField label="Notas" value={l.resultData.notes} onChangeText={(t) => l.setResultData({ ...l.resultData, notes: t })} placeholder="Observaciones" multiline />
      </Modal>
    </ScreenContainer>
  );
}
