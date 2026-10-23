"use client";

/** Selector de opciones tipo chip (espejo de `mobile/src/components/forms/FormSelect.tsx`). */
import { useId } from "react";
import { useInFormSection } from "./FormSection";
import f from "./forms.module.css";

interface SelectOption {
  label: string;
  value: string;
  /** Texto corto opcional antes de la etiqueta. */
  icon?: string;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Si es true, las opciones van en una fila con scroll horizontal. */
  horizontal?: boolean;
}

export default function FormSelect({ label, options, value, onChange, horizontal }: FormSelectProps) {
  const labelId = useId();
  const inSection = useInFormSection();
  return (
    <div className={`${f.field} ${inSection ? f.inSection : ""}`}>
      <p id={labelId} className={f.label}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className={`${f.options} ${horizontal ? f.optionsScroll : ""}`}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${f.option} ${active ? f.optionActive : ""}`}
              onClick={() => onChange(o.value)}
            >
              {o.icon ? <span aria-hidden>{o.icon}</span> : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
