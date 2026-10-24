"use client";

/**
 * Receta médica — espejo de `mobile/app/carnet/receta/[id].tsx`. Ticket de solo lectura.
 */
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Pill, ShoppingBag } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { usePrescriptionDetail } from "@/hooks/carnet/usePrescriptionDetail";
import { copyText } from "@/utils/helpers";
import s from "./receta.module.css";

function RecetaContent() {
  const { record, pet, recordId, loading } = usePrescriptionDetail();
  const router = useRouter();

  if (loading) {
    return (
      <ScreenContainer>
        <Skeleton height={28} width="40%" />
        <Skeleton height={120} borderRadius={12} />
        <Skeleton height={160} borderRadius={12} />
        <Skeleton height={80} borderRadius={12} />
      </ScreenContainer>
    );
  }

  if (!record || !pet) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Receta médica" />
        <p className={s.emptyTitle}>Receta no encontrada</p>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  const folio = `RX-${String(recordId).slice(0, 8)}`;
  const meds = record.prescriptions ?? [];

  const shareText =
    `Receta ${folio} — ${pet.name}\n` +
    meds.map((m) => `• ${m.medication_name}: ${m.dosage}, cada ${m.frequency_hours} h por ${m.duration_days} días`).join("\n");

  return (
    <ScreenContainer>
      <ScreenHeader title="Receta médica" />

      <div className={s.ticket}>
        <header className={s.ticketHeader}>
          <div>
            <p className={s.brand}>RECETA DIGITAL</p>
            <p className={s.clinic}>Michicondrias</p>
          </div>
          <ShoppingBag size={28} aria-hidden />
        </header>

        <div className={s.folioRow}>
          <span>{folio}</span>
          <span>{record.date?.slice(0, 10)}</span>
        </div>

        <section className={s.block}>
          <p className={s.blockTitle}>Paciente</p>
          <p className={s.line}><strong>Nombre:</strong> {pet.name}</p>
          <p className={s.line}><strong>Especie / Raza:</strong> {pet.species}{pet.breed ? ` / ${pet.breed}` : ""}</p>
          {record.weight_kg != null && <p className={s.line}><strong>Peso registrado:</strong> {record.weight_kg} kg</p>}
        </section>

        <section className={s.block}>
          <p className={s.blockTitle}>Consulta</p>
          <p className={s.line}><strong>Motivo:</strong> {record.reason_for_visit}</p>
          {record.diagnosis && <p className={s.line}><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
        </section>

        <section className={s.block}>
          <p className={s.blockTitle}>Medicamentos prescritos</p>
          {meds.length === 0 ? (
            <p className={s.line}>Sin medicamentos en esta consulta.</p>
          ) : (
            meds.map((m, i) => (
              <div key={i} className={s.med}>
                <Pill size={18} aria-hidden />
                <div>
                  <p className={s.medName}>{m.medication_name}</p>
                  <p className={s.line}>{m.dosage}</p>
                  <p className={s.line}>Cada {m.frequency_hours} horas por {m.duration_days} días</p>
                  {m.instructions && <p className={s.line}>{m.instructions}</p>}
                </div>
              </div>
            ))
          )}
        </section>

        <section className={s.block}>
          <p className={s.blockTitle}>Recordatorios</p>
          <p className={s.line}>
            Te avisamos cuando le toque cada dosis. Puedes marcarlas como dadas en la pestaña Salud de {pet.name}.
          </p>
        </section>

        <footer className={s.footer}>
          <p className={s.blockTitle}>Surtir en farmacia</p>
          <p className={s.folio}>{folio}</p>
          <p className={s.line}>Muestra este código en la farmacia para surtir la receta.</p>
        </footer>
      </div>

      <Button
        label="Compartir receta"
        onPress={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title: `Receta ${folio}`, text: shareText });
              return;
            } catch {
              // cancelado por el usuario o sin permiso: cae al portapapeles
            }
          }
          const ok = await copyText(shareText);
          showAlert({
            type: ok ? "success" : "error",
            title: ok ? "Receta copiada" : "No se pudo compartir",
            message: ok ? "Pégala donde quieras." : "Inténtalo de nuevo.",
          });
        }}
      />
    </ScreenContainer>
  );
}

export default function RecetaPage() {
  return (
    <Suspense fallback={null}>
      <RecetaContent />
    </Suspense>
  );
}
