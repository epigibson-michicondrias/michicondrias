"use client";

/**
 * Receta médica (web). Misma lógica que `mobile/app/carnet/receta/[id].tsx` (`usePrescriptionDetail`), diseñada como
 * documento: encabezado con folio y estado, quién la emite (clínica y veterinario reales de la consulta), paciente,
 * diagnóstico, cada medicamento con su plan (fechas, tomas, avance) y firma. A un lado, acciones y avance del
 * tratamiento. Se imprime o guarda en PDF solo el documento (`@media print`).
 */
import { Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, Clock, FileText, Pill, Printer, Share2, Stethoscope } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { usePrescriptionDetail } from "@/hooks/carnet/usePrescriptionDetail";
import { STATUS_LABEL, frequencyLabel, type MedicationPlan } from "@/hooks/carnet/prescriptionPlan";
import { capitalize, formatDate } from "@/utils/formatters";
import { copyText } from "@/utils/helpers";
import { printElement } from "@/lib/printElement";
import s from "./receta.module.css";

const isoDay = (d: Date) => d.toISOString();

function MedCard({ plan, index }: { plan: MedicationPlan; index: number }) {
  const m = plan.med;
  return (
    <li className={s.med}>
      <span className={s.medIndex} aria-hidden>{index + 1}</span>
      <div className={s.medBody}>
        <div className={s.medHead}>
          <h3 className={s.medName}>{m.medication_name}</h3>
          <span className={`${s.status} ${s[plan.status]}`}>{STATUS_LABEL[plan.status]}</span>
        </div>
        <dl className={s.medFacts}>
          <div><dt>Dosis</dt><dd>{m.dosage}</dd></div>
          <div><dt>Frecuencia</dt><dd>{frequencyLabel(plan)}</dd></div>
          <div><dt>Duración</dt><dd>{m.duration_days} {m.duration_days === 1 ? "día" : "días"}</dd></div>
          <div><dt>Tomas en total</dt><dd>{plan.totalDoses}</dd></div>
        </dl>
        <p className={s.medDates}>
          <CalendarDays size={14} aria-hidden /> Del {formatDate(isoDay(plan.start))} al {formatDate(isoDay(plan.end))}
        </p>
        {m.instructions && <p className={s.instructions}><strong>Indicaciones:</strong> {m.instructions}</p>}
      </div>
    </li>
  );
}

function RecetaContent() {
  const { record, pet, clinic, vet, plans, status, folio, loading } = usePrescriptionDetail();
  const router = useRouter();
  const docRef = useRef<HTMLElement>(null);

  if (loading) {
    return (
      <ScreenContainer>
        <Skeleton height={20} width="30%" />
        <div className={s.layout}>
          <Skeleton height={640} borderRadius={24} />
          <Skeleton height={280} borderRadius={20} />
        </div>
      </ScreenContainer>
    );
  }

  if (!record || !pet) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<FileText size={28} />}
          title="Receta no encontrada"
          subtitle="Puede que la consulta se haya eliminado o que no tengas acceso a ella."
          actionLabel="Volver"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const vetName = vet ? `${vet.first_name} ${vet.last_name}`.trim() : null;
  const species = capitalize(pet.species);
  const active = plans.filter((p) => p.status === "en-curso");

  const shareText = [
    `Receta ${folio} · ${pet.name} (${species}${pet.breed ? `, ${pet.breed}` : ""})`,
    `Fecha: ${formatDate(record.date)}${vetName ? ` · ${vetName}` : ""}${clinic ? ` · ${clinic.name}` : ""}`,
    record.diagnosis ? `Diagnóstico: ${record.diagnosis}` : `Motivo: ${record.reason_for_visit}`,
    "",
    ...plans.map(
      (p) => `• ${p.med.medication_name}: ${p.med.dosage}, ${frequencyLabel(p).toLowerCase()} por ${p.med.duration_days} días${p.med.instructions ? ` (${p.med.instructions})` : ""}`,
    ),
  ].join("\n");

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Receta ${folio}`, text: shareText });
        return;
      } catch {
        // cancelado o sin permiso: cae al portapapeles
      }
    }
    const ok = await copyText(shareText);
    showAlert({ type: ok ? "success" : "error", title: ok ? "Receta copiada" : "No se pudo compartir", message: ok ? "Pégala donde quieras." : "Inténtalo de nuevo." });
  };

  const print = () => {
    if (docRef.current && !printElement(docRef.current, `Receta ${folio} · ${pet.name}`)) {
      showAlert({ type: "error", title: "No se pudo abrir la receta", message: "Permite las ventanas emergentes de este sitio e inténtalo de nuevo." });
    }
  };

  return (
    <ScreenContainer>
      <nav aria-label="Ruta" className={s.crumbs}>
        <Link href="/mascotas">Mis mascotas</Link>
        <ChevronRight size={14} aria-hidden />
        <Link href={`/mascotas/${pet.id}?tab=historial`}>{pet.name}</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">Receta {folio}</span>
      </nav>

      <div className={s.layout}>
        <article ref={docRef} className={s.doc} aria-label={`Receta ${folio}`}>
          <header className={s.docHead}>
            <div className={s.brand}>
              <span className={s.brandMark} aria-hidden><Stethoscope size={22} /></span>
              <div>
                <p className={s.kicker}>Receta médica veterinaria</p>
                <h1 className={s.title}>{clinic?.name ?? "Michicondrias"}</h1>
                {clinic && (clinic.address || clinic.phone) && (
                  <p className={s.headMeta}>{[clinic.address, clinic.city, clinic.phone].filter(Boolean).join(" · ")}</p>
                )}
              </div>
            </div>
            <div className={s.folioBox}>
              <span className={s.folioLabel}>Folio</span>
              <strong className={s.folio}>{folio}</strong>
              <span className={s.headMeta}>{formatDate(record.date)}</span>
              <span className={`${s.status} ${s[status]}`}>{STATUS_LABEL[status]}</span>
            </div>
          </header>

          <section className={s.grid} aria-label="Paciente y consulta">
            <div className={s.cell}>
              <p className={s.cellLabel}>Paciente</p>
              <p className={s.cellValue}>{pet.name}</p>
              <p className={s.cellMeta}>{[species, pet.breed, record.weight_kg ? `${record.weight_kg} kg` : null].filter(Boolean).join(" · ")}</p>
            </div>
            <div className={s.cell}>
              <p className={s.cellLabel}>Motivo de la consulta</p>
              <p className={s.cellValue}>{record.reason_for_visit}</p>
              {record.temperature_c ? <p className={s.cellMeta}>Temperatura: {record.temperature_c} °C</p> : null}
            </div>
            {record.diagnosis && (
              <div className={`${s.cell} ${s.cellWide}`}>
                <p className={s.cellLabel}>Diagnóstico</p>
                <p className={s.cellValue}>{record.diagnosis}</p>
              </div>
            )}
            {record.treatment && (
              <div className={`${s.cell} ${s.cellWide}`}>
                <p className={s.cellLabel}>Tratamiento indicado</p>
                <p className={s.cellText}>{record.treatment}</p>
              </div>
            )}
          </section>

          <section aria-label="Medicamentos">
            <h2 className={s.sectionTitle}><Pill size={16} aria-hidden /> Medicamentos ({plans.length})</h2>
            {plans.length === 0 ? (
              <p className={s.muted}>Esta consulta no incluye medicamentos.</p>
            ) : (
              <ol className={s.meds}>
                {plans.map((p, i) => <MedCard key={p.med.id ?? i} plan={p} index={i} />)}
              </ol>
            )}
          </section>

          {record.notes && (
            <section className={s.notes} aria-label="Notas">
              <p className={s.cellLabel}>Notas del veterinario</p>
              <p className={s.cellText}>{record.notes}</p>
            </section>
          )}

          <footer className={s.sign}>
            <div>
              <span className={s.signLine} aria-hidden />
              <p className={s.cellValue}>{vetName ?? "Médico veterinario"}</p>
              <p className={s.cellMeta}>
                {[vet?.specialty, vet?.license_number ? `Cédula profesional ${vet.license_number}` : null].filter(Boolean).join(" · ") || "Firma del veterinario tratante"}
              </p>
            </div>
            <p className={s.legal}>Emitida en Michicondrias · {folio}. Sigue las indicaciones de tu veterinario y consúltale ante cualquier reacción.</p>
          </footer>
        </article>

        <aside className={s.aside}>
          <section className={s.panel} aria-label="Acciones">
            <Button label="Imprimir o guardar PDF" variant="gold" icon={<Printer size={18} />} onPress={print} />
            <Button label="Compartir" variant="secondary" icon={<Share2 size={18} />} onPress={share} />
            <Link href={`/mascotas/${pet.id}?tab=historial`} className={s.textLink}>Ver historial de {pet.name}</Link>
          </section>

          {plans.length > 0 && (
            <section className={s.panel} aria-label="Avance del tratamiento">
              <h2 className={s.panelTitle}><Clock size={16} aria-hidden /> Avance del tratamiento</h2>
              <ul className={s.progressList}>
                {plans.map((p, i) => (
                  <li key={p.med.id ?? i}>
                    <div className={s.progressHead}>
                      <span>{p.med.medication_name}</span>
                      <span className={s.muted}>
                        {p.status === "en-curso" ? `${p.daysLeft} ${p.daysLeft === 1 ? "día" : "días"} restantes` : STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <div className={s.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p.progress * 100)} aria-label={`Avance de ${p.med.medication_name}`}>
                      <span style={{ width: `${Math.round(p.progress * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              {active.length > 0 && (
                <p className={s.reminder}>
                  <Bell size={14} aria-hidden /> Te avisamos cuando toque cada dosis; márcalas como dadas en la pestaña Salud de {pet.name}.
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
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
