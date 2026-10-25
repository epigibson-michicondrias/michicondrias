"use client";

/**
 * TodayDoses — panel «Lo que toca hoy» en la pestaña Tratamientos.
 * Lista las tomas del día (atrasadas y próximas) como checklist de vidrio: un clic marca cada una.
 */
import { useMemo } from "react";
import { Check, Pill, Sun } from "lucide-react";
import Button from "@/components/Button";
import type { Treatment, TreatmentDose } from "@/services/reminders";
import s from "./TodayDoses.module.css";

interface TodayItem {
  dose: TreatmentDose;
  treatment: Treatment;
  overdue: boolean;
  label: string;
}

function doseLabel(d: TreatmentDose): { text: string; overdue: boolean } {
  const when = new Date(d.remind_at);
  const time = when.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  if (d.isOverdue) {
    return { text: `${time} · atrasada`, overdue: true };
  }
  return { text: time, overdue: false };
}

export function TodayDoses({
  treatments,
  onCheck,
  isChecking,
  canCheck,
}: {
  treatments: Treatment[];
  onCheck: (id: string) => void;
  isChecking: boolean;
  canCheck: boolean;
}) {
  const items = useMemo<TodayItem[]>(() => {
    const list: TodayItem[] = [];
    for (const t of treatments) {
      for (const d of t.doses) {
        if (d.sent) continue;
        if (d.isOverdue || d.isToday) {
          const { text, overdue } = doseLabel(d);
          list.push({ dose: d, treatment: t, overdue, label: text });
        }
      }
    }
    return list.sort((a, b) => new Date(a.dose.remind_at).getTime() - new Date(b.dose.remind_at).getTime());
  }, [treatments]);

  const pending = items.filter((i) => !i.dose.sent);
  const overdueCount = items.filter((i) => i.overdue).length;

  // Próxima toma futura (para el estado vacío)
  let nextFuture: { t: Treatment; d: TreatmentDose } | null = null;
  for (const t of treatments) {
    for (const d of t.doses) {
      if (!d.sent && !d.isOverdue && !d.isToday) {
        nextFuture = { t, d };
        break;
      }
    }
    if (nextFuture) break;
  }

  return (
    <section className={s.glass} aria-label="Lo que toca hoy">
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Lo que toca hoy</p>
          <h2 className={s.title}>
            {items.length === 0
              ? "Todo al día"
              : pending.length === 0
                ? "Tomas del día completadas"
                : `${pending.length} ${pending.length === 1 ? "toma por dar" : "tomas por dar"}`}
          </h2>
        </div>
        <div className={s.dateCol}>
          <Sun size={18} className={s.dateIcon} />
          <span className={s.dateText}>
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={s.emptyOk}>
          <span className={s.emptyCheck}><Check size={20} /></span>
          <div>
            <p className={s.emptyTitle}>Sin tomas pendientes hoy</p>
            {nextFuture ? (
              <p className={s.emptySub}>
                Próxima: {nextFuture.t.medication_name} ·{" "}
                {new Date(nextFuture.d.remind_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}{" "}
                {new Date(nextFuture.d.remind_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
              </p>
            ) : (
              <p className={s.emptySub}>No hay más tomas programadas.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <ul className={s.list}>
            {items.map(({ dose, treatment, overdue, label }) => (
              <li key={dose.id} className={`${s.row} ${overdue ? s.rowOverdue : ""}`}>
                <button
                  type="button"
                  className={`${s.checkbox} ${overdue ? s.checkboxOverdue : ""}`}
                  disabled={isChecking || !canCheck}
                  onClick={() => onCheck(dose.id)}
                  aria-label={`Marcar ${treatment.medication_name} como tomado`}
                >
                  {isChecking ? <span className={s.spinner} /> : <Check size={14} />}
                </button>
                <div className={s.rowBody}>
                  <span className={s.rowName}>{treatment.medication_name}</span>
                  <span className={s.rowMeta}>
                    {treatment.dosage} · {label}
                  </span>
                </div>
                {overdue && <span className={s.overdueBadge}>Atrasada</span>}
              </li>
            ))}
          </ul>
          {pending.length > 1 && canCheck && (
            <Button
              label={`Marcar las ${pending.length} tomas`}
              variant="secondary"
              onPress={() => pending.forEach((i) => onCheck(i.dose.id))}
              disabled={isChecking}
            />
          )}
        </>
      )}
    </section>
  );
}
