"use client";

/** Fecha y hora nativas sobre un `Date` (equivale a los dos `DatePicker` de la app). */
import { toISODate } from "./format";
import s from "./clinica.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export default function DateTimeField({ value, onChange, min }: { value: Date; onChange: (d: Date) => void; min?: Date }) {
  const setDate = (iso: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return;
    const n = new Date(value);
    n.setFullYear(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    onChange(n);
  };
  const setTime = (hm: string) => {
    const m = /^(\d{2}):(\d{2})$/.exec(hm);
    if (!m) return;
    const n = new Date(value);
    n.setHours(Number(m[1]), Number(m[2]), 0, 0);
    onChange(n);
  };
  return (
    <div className={s.row2}>
      <label className={s.field}>
        <span className={s.fieldLabel}>Fecha *</span>
        <input type="date" className={s.input} value={toISODate(value)} min={min ? toISODate(min) : undefined} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className={s.field}>
        <span className={s.fieldLabel}>Hora *</span>
        <input type="time" className={s.input} value={`${pad(value.getHours())}:${pad(value.getMinutes())}`} onChange={(e) => setTime(e.target.value)} />
      </label>
    </div>
  );
}
