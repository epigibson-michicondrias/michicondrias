"use client";

/** Campo de fecha nativo con la etiqueta del design system. */
import s from "./servicios-pro.module.css";

interface DateFieldProps {
  label: string;
  /** Fecha en formato AAAA-MM-DD. */
  value: string;
  onChange: (iso: string) => void;
  min?: string;
}

export default function DateField({ label, value, onChange, min }: DateFieldProps) {
  return (
    <label className={s.dateField}>
      <span className={s.dateLabel}>{label}</span>
      <input
        type="date"
        className={s.dateInput}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
