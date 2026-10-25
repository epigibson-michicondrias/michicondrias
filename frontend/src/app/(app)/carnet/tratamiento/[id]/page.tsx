"use client";

/**
 * Ficha de tratamiento (medicamento recetado). Documento premium con: cabecera con estado y mascota,
 * datos del medicamento, avance con barra de progreso, línea de tiempo de cada toma (tomada / pendiente /
 * atrasada) y panel lateral de acciones (avisos, marcar toma, cambiar inicio).
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
        <Skeleton height={80} borderRadius={16} />
        <Skeleton height={200} borderRadius={16} />
        <Skeleton height={300} borderRadius={16} />
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
      {/* Cabecera */}
      <header className={s.hero}>
        <Link href={`/mascotas/${t.pet_id}?tab=tratamientos`} className={s.back}>
          <ArrowLeft size={18} /> Tratamientos de {pet?.name || "tu mascota"}
        </Link>
        <div className={s.heroRow}>
          <div>
            <h1 className={s.title}>{t.medication_name}</h1>
            <p className={s.subtitle}>
              {t.dosage} · cada {t.frequency_hours} h · {t.duration_days} días
            </p>
          </div>
          <span className={`${s.badge} ${s[`badge_${t.status}`]}`}>{STATUS_LABEL[t.status] || t.status}</span>
        </div>
      </header>

      <div className={s.layout}>
        {/* Columna principal */}
        <div className={s.main}>
          {/* Datos del tratamiento */}
          <Card>
            <h2 className={s.sectionTitle}>Datos del tratamiento</h2>
            <div className={s.grid}>
              <div className={s.cell}>
                <span className={s.cellLabel}><Pill size={14} /> Medicamento</span>
                <span className={s.cellValue}>{t.medication_name}</span>
              </div>
              <div className={s.cell}>
                <span className={s.cellLabel}><Clock size={14} /> Dosis</span>
                <span className={s.cellValue}>{t.dosage}</span>
              </div>
              <div className={s.cell}>
                <span className={s.cellLabel}><Timer size={14} /> Frecuencia</span>
                <span className={s.cellValue}>Cada {t.frequency_hours} h</span>
              </div>
              <div className={s.cell}>
                <span className={s.cellLabel}><CalendarDays size={14} /> Duración</span>
                <span className={s.cellValue}>{t.duration_days} días</span>
              </div>
              <div className={s.cell}>
                <span className={s.cellLabel}><CalendarDays size={14} /> Inicio</span>
                <span className={s.cellValue}>{formatDate(startDate)}</span>
              </div>
              <div className={s.cell}>
                <span className={s.cellLabel}><CalendarDays size={14} /> Fin</span>
                <span className={s.cellValue}>{formatDate(endDate)}</span>
              </div>
            </div>
            {t.instructions && (
              <div className={s.instructions}>
                <span className={s.cellLabel}>Indicaciones</span>
                <p>{t.instructions}</p>
              </div>
            )}
            {t.diagnosis && (
              <div className={s.instructions}>
                <span className={s.cellLabel}>Diagnóstico de la consulta</span>
                <p>{t.diagnosis}</p>
              </div>
            )}
          </Card>

          {/* Avance */}
          <Card>
            <h2 className={s.sectionTitle}>Avance</h2>
            <div className={s.progressRow}>
              <div className={s.progressTrack}>
                <div className={s.progressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <span className={s.progressLabel}>{taken} de {total} tomas</span>
            </div>
            {nextDose && (
              <p className={s.nextLine}>
                Próxima toma: <strong>{fmtDateTime(nextDose.remind_at)}</strong>
                {nextDose.isDue ? " — ya toca" : ""}
              </p>
            )}
            {!nextDose && total > 0 && (
              <p className={s.nextLine}><CheckCircle2 size={14} /> Todas las tomas registradas</p>
            )}
          </Card>

          {/* Línea de tiempo de tomas */}
          <Card>
            <h2 className={s.sectionTitle}>Cada toma</h2>
            <ol className={s.timeline}>
              {t.doses.map((d, i) => (
                <li key={d.id} className={`${s.tlItem} ${d.sent ? s.tlDone : d.isDue ? s.tlDue : s.tlPending}`}>
                  <span className={s.tlDot}>{d.sent ? <Check size={12} /> : i + 1}</span>
                  <div className={s.tlBody}>
                    <span className={s.tlTime}>{fmtDateTime(d.remind_at)}</span>
                    <span className={s.tlStatus}>
                      {d.sent ? `Tomado ${d.taken_at ? fmtDateTime(d.taken_at) : ""}` : d.isDue ? "Ya toca" : "Pendiente"}
                    </span>
                  </div>
                  {!d.sent && d.isDue && (
                    <Button
                      label={isChecking ? "Marcando…" : "Marcar"}
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
          </Card>
        </div>

        {/* Panel lateral */}
        <aside className={s.aside}>
          <Card>
            <h2 className={s.sectionTitle}>Acciones</h2>
            <FormSwitch
              label="Avisos"
              description="Notificaciones en la app cuando toca cada dosis"
              value={t.reminders_enabled}
              onChange={(v) => toggleReminders(v)}
            />
            {nextDose && nextDose.isDue && (
              <Button
                label={isChecking ? "Marcando…" : "Marcar como tomado"}
                onPress={() => checkReminder(nextDose.id)}
                disabled={isChecking}
                loading={isChecking}
              />
            )}
            {nextDose && !nextDose.isDue && (
              <p className={s.muted}>Podrás marcar la próxima toma cuando toque.</p>
            )}
            {pet && (
              <Link href={`/mascotas/${pet.id}?tab=salud`} className={s.linkRow}>
                Ver carnet de {pet.name} <ChevronRight size={16} />
              </Link>
            )}
          </Card>

          <Card>
            <h2 className={s.sectionTitle}>Inicio del tratamiento</h2>
            <p className={s.muted}>
              No siempre se empieza el mismo día de la receta. Indica cuándo comenzaste.
            </p>
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
                <span>{formatDate(startDate)}</span>
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
          </Card>

          <Card>
            <h2 className={s.sectionTitle}>Resumen</h2>
            <ul className={s.summaryList}>
              <li><TrendingUp size={14} /> {taken} de {total} tomas registradas</li>
              <li>{takenDoses.length > 0 ? <><CheckCircle2 size={14} /> {takenDoses.length} tomadas</> : null}</li>
              <li>{pendingDoses.length > 0 ? <><Clock size={14} /> {pendingDoses.length} pendientes</> : null}</li>
              <li>{t.reminders_enabled ? <><Bell size={14} /> Avisos activos</> : <><BellOff size={14} /> Avisos apagados</>}</li>
            </ul>
            <Button label="Imprimir o guardar PDF" variant="secondary" icon={<Printer size={16} />} onPress={() => printElement(docRef.current!, `Tratamiento ${t.medication_name}${pet ? ` · ${pet.name}` : ""}`)} />
          </Card>
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
