"use client";

/** Interruptor o casilla con etiqueta (espejo de `mobile/src/components/forms/FormSwitch.tsx`). */
import { Check } from "lucide-react";
import { useInFormSection } from "./FormSection";
import f from "./forms.module.css";

interface FormSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Texto de apoyo bajo la etiqueta. */
  description?: string;
  /** `switch` (por defecto) o `checkbox`. */
  variant?: "switch" | "checkbox";
}

export default function FormSwitch({ label, value, onChange, description, variant = "switch" }: FormSwitchProps) {
  const inSection = useInFormSection();
  return (
    <button
      type="button"
      role={variant === "checkbox" ? "checkbox" : "switch"}
      aria-checked={value}
      className={[f.switchRow, value && f.switchOn, inSection && f.inSection].filter(Boolean).join(" ")}
      onClick={() => onChange(!value)}
    >
      <span className={f.switchText}>
        <span className={f.switchLabel}>{label}</span>
        {description ? <span className={f.switchDesc}>{description}</span> : null}
      </span>
      {variant === "checkbox" ? (
        <span className={f.checkbox} aria-hidden>
          {value ? <Check size={14} strokeWidth={3} /> : null}
        </span>
      ) : (
        <span className={f.track} aria-hidden>
          <span className={f.thumb} />
        </span>
      )}
    </button>
  );
}
