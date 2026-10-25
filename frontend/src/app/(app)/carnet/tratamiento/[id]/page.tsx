"use client";

/**
 * Ficha de tratamiento (medicamento recetado). Documento premium: hero con progreso, datos en rejilla,
 * línea de tiempo de cada toma con conectores de color y panel lateral de acciones.
 */
import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bell, BellOff, CalendarDays, Check, CheckCircle2, ChevronRight, Clock,
  Pill, Printer, Timer, TrendingUp,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import FormSwitch from "@/components/forms/FormSwitch";
import { useTreatmentDetail } from "@/hooks/carnet/useTreatmentDetail";
import { formatDate } from "@/utils/formatters";
import { printElement } from "@/lib/printElement";
import s from "./tratamiento.module.css";

const STATUS_LABEL: Record<string, string> = {
  "en-curso": "En curso",
  terminado: "Terminado",
  "por-iniciar": "Por iniciar",
};

function fmtDateTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`;
}

function TreatmentDetailContent() {
  const { treatment, pet, isLoading, error, checkReminder, isChecking, toggleReminders, isToggling, setStartDate, isSettingStart } = useTreatmentDetail();
  const router = useRouter();
  const docRef = useRef<HTMLDivElement>(null);
  const [editingStart, setEditingStart] = useState(false);
  const [startInput, setStartInput] = useState("");

  if (isLoading) {
    return (
      <ScreenContainer>
        <Skeleton height={120} borderRadius={20} />
        <Skeleton height={280} borderRadius={16} />
        <Skeleton height={360} borderRadius={16} />
      </ScreenContainer>
    );
  }
  if (error || !treatment) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<Pill size={28} />}
          title="No pudimos cargar el tratamiento"
          subtitle="Puede que ya no exista. Revisa tu conexión e inténtalo de nuevo."
          actionLabel="Volver"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const t = treatment;
  const total = t.doses.length;
  const taken = t.doses.filter((d) => d.sent).length;
  const nextDose = t.doses.find((d) => !d.sent);
  const takenDoses = t.doses.filter((d) => d.sent);
  const pendingDoses = t.doses.filter((d) => !d.sent);
  const progress = total ? taken / total : 0;
  const startDate = t.start_date || t.record_date;
  const endDate = (() => {
    const d = new Date(startDate!);
    d.setDate(d.getDate() + (t.duration_days || 0));
    return d.toISOString();
  })();

  return (
    <ScreenContainer>
      <div ref={docRef} id="tratamiento-doc">
        {/* Hero */}
        <header className={s.hero}>
          <Link href={`/mascotas/${t.pet_id}?tab=tratamientos`} className={s.back}>
            <ArrowLeft size={16} /> Tratamientos de {pet?.name || "tu mascota"}
          </Link>
          <div className={s.heroCard}>
            <div className={s.heroLeft}>
              <div className={s.heroIcon}><Pill size={28} /></div>
              <div>
                <h1 className={s.heroTitle}>{t.medication_name}</h1>
                <p className={s.heroSub}>{t.dosage} · cada {t.frequency_hours} h · {t.duration_days} días</p>
              </div>
            </div>
            <div className={s.heroRight}>
              <div className={s.ringWrap}>
                <svg className={s.ring} viewBox="0 0 80 80" aria-hidden>
                  <circle className={s.ringTrack} cx="40" cy="40" r="34" />
                  <circle
                    className={s.ringFill}
                    cx="40" cy="40" r="34"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress)}`}
                  />
                </svg>
                <span className={s.ringLabel}>{Math.round(progress * 100)}%</span>
              </div>
              <div className={s.heroStats}>
                <span className={s.heroStat}>{taken} de {total} tomas</span>
                <span className={`${s.heroBadge} ${s[`badge_${t.status}`]}`}>{STATUS_LABEL[t.status] || t.status}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={s.layout}>
          {/* Columna principal */}
          <div className={s.main}>
            {/* Datos */}
            <section className={s.section}>
              <h2 className={s.sectionTitle}>Datos del tratamiento</h2>
              <div className={s.grid}>
                {[
                  { icon: <Pill size={15} />, label: "Medicamento", value: t.medication_name },
                  { icon: <Clock size={15} />, label: "Dosis", value: t.dosage },
                  { icon: <Timer size={15} />, label: "Frecuencia", value: `Cada ${t.frequency_hours} h` },
                  { icon: <CalendarDays size={15} />, label: "Duración", value: `${t.duration_days} días` },
                  { icon: <CalendarDays size={15} />, label: "Inicio", value: formatDate(startDate) },
                  { icon: <CalendarDays size={15} />, label: "Fin", value: formatDate(endDate) },
                ].map((c) => (
                  <div key={c.label} className={s.cell}>
                    <span className={s.cellLabel}>{c.icon}{c.label}</span>
                    <span className={s.cellValue}>{c.value}</span>
                  </div>
                ))}
              </div>
              {t.instructions && (
                <div className={s.noteBlock}>
                  <span className={s.cellLabel}>Indicaciones</span>
                  <p className={s.noteText}>{t.instructions}</p>
                </div>
              )}
              {t.diagnosis && (
                <div className={s.noteBlock}>
                  <span className={s.cellLabel}>Diagnóstico de la consulta</span>
                  <p className={s.noteText}>{t.diagnosis}</p>
                </div>
              )}
            </section>

            {/* Próxima toma destacada */}
            {nextDose && (
              <section className={`${s.section} ${s.nextHero}`}>
                <div className={s.nextLeft}>
                  <span className={s.nextEyebrow}>Próxima toma</span>
                  <span className={s.nextTime}>{fmtDateTime(nextDose.remind_at)}</span>
                  {nextDose.isOverdue && <span className={s.nextOverdue}>Atrasada</span>}
                </div>
                {nextDose.isDue && (
                  <Button
                    label={isChecking ? "Marcando…" : "Marcar como tomado"}
                    onPress={() => checkReminder(nextDose.id)}
                    disabled={isChecking}
                    loading={isChecking}
                  />
                )}
                {!nextDose.isDue && <span className={s.nextHint}>Podrás marcarla cuando toque</span>}
              </section>
            )}

            {/* Línea de tiempo */}
            <section className={s.section}>
              <h2 className={s.sectionTitle}>Cada toma</h2>
              <ol className={s.timeline}>
                {t.doses.map((d, i) => (
                  <li key={d.id} className={`${s.tlItem} ${d.sent ? s.tlDone : d.isDue ? s.tlDue : s.tlPending}`}>
                    <div className={s.tlRail}>
                      <span className={s.tlDot}>
                        {d.sent ? <Check size={11} strokeWidth={3} /> : i + 1}
                      </span>
                      {i < t.doses.length - 1 && <span className={s.tlLine} />}
                    </div>
                    <div className={s.tlBody}>
                      <div className={s.tlRow}>
                        <span className={s.tlTime}>{fmtDateTime(d.remind_at)}</span>
                        <span className={`${s.tlChip} ${d.sent ? s.chipDone : d.isOverdue ? s.chipLate : d.isDue ? s.chipDue : s.chipPending}`}>
                          {d.sent ? "Tomado" : d.isOverdue ? "Atrasada" : d.isDue ? "Ya toca" : "Pendiente"}
                        </span>
                      </div>
                      {d.sent && d.taken_at && (
                        <span className={s.tlDetail}>Registrada {fmtDateTime(d.taken_at)}</span>
                      )}
                    </div>
                    {!d.sent && d.isDue && (
                      <Button
                        label={isChecking ? "…" : "Marcar"}
                        size="sm"
                        variant="secondary"
                        fullWidth={false}
                        disabled={isChecking}
                        onPress={() => checkReminder(d.id)}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Panel lateral */}
          <aside className={s.aside}>
            <section className={s.sideCard}>
              <h3 className={s.sideTitle}>Acciones</h3>
              <FormSwitch
                label="Avisos"
                description="Notificaciones cuando toca cada dosis"
                value={t.reminders_enabled}
                onChange={(v) => toggleReminders(v)}
              />
              {pet && (
                <Link href={`/mascotas/${pet.id}?tab=salud`} className={s.sideLink}>
                  Ver carnet de {pet.name} <ChevronRight size={15} />
                </Link>
              )}
            </section>

            <section className={s.sideCard}>
              <h3 className={s.sideTitle}>Inicio del tratamiento</h3>
              <p className={s.sideNote}>No siempre se empieza el mismo día de la receta.</p>
              {editingStart ? (
                <div className={s.startEdit}>
                  <input
                    type="date"
                    className={s.dateInput}
                    value={startInput || (startDate || "").slice(0, 10)}
                    onChange={(e) => setStartInput(e.target.value)}
                  />
                  <div className={s.startActions}>
                    <Button
                      label={isSettingStart ? "Guardando…" : "Guardar"}
                      size="sm"
                      disabled={isSettingStart || !startInput}
                      onPress={() => { setStartDate(startInput); setEditingStart(false); }}
                    />
                    <Button label="Cancelar" size="sm" variant="secondary" onPress={() => setEditingStart(false)} />
                  </div>
                </div>
              ) : (
                <div className={s.startRow}>
                  <span className={s.startDate}>{formatDate(startDate)}</span>
                  {t.status !== "terminado" && (
                    <Button
                      label="Cambiar"
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      onPress={() => { setStartInput((startDate || "").slice(0, 10)); setEditingStart(true); }}
                    />
                  )}
                </div>
              )}
            </section>

            <section className={s.sideCard}>
              <h3 className={s.sideTitle}>Resumen</h3>
              <ul className={s.summaryList}>
                <li><TrendingUp size={14} /> {taken} de {total} tomas registradas</li>
                {takenDoses.length > 0 && <li><CheckCircle2 size={14} /> {takenDoses.length} tomadas</li>}
                {pendingDoses.length > 0 && <li><Clock size={14} /> {pendingDoses.length} pendientes</li>}
                <li>{t.reminders_enabled ? <><Bell size={14} /> Avisos activos</> : <><BellOff size={14} /> Avisos apagados</>}</li>
              </ul>
              <Button label="Imprimir o guardar PDF" variant="secondary" icon={<Printer size={15} />} onPress={() => printElement(docRef.current!, `Tratamiento ${t.medication_name}${pet ? ` · ${pet.name}` : ""}`)} />
            </section>
          </aside>
        </div>
      </div>
    </ScreenContainer>
  );
}

export default function TreatmentDetailPage() {
  return (
    <Suspense fallback={null}>
      <TreatmentDetailContent />
    </Suspense>
  );
}
