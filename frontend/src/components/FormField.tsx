"use client";

/**
 * Campo estándar (espejo de `mobile/src/components/FormField.tsx`): etiqueta en tipo oración, input, `hint` y `error`
 * inline. Acepta `onChangeText`, `multiline`, `editable`, `keyboardType` y `secureTextEntry` como en la app.
 */
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { useInFormSection } from "./forms/FormSection";
import f from "./forms/forms.module.css";

type KeyboardType = "default" | "email-address" | "numeric" | "number-pad" | "decimal-pad" | "phone-pad" | "url";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Mensaje de error del campo; pinta el borde en rojo. */
  error?: string | null;
  /** Texto de ayuda bajo el campo (se oculta si hay error). */
  hint?: string;
  rightElement?: ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  keyboardType?: KeyboardType;
  secureTextEntry?: boolean;
}

const INPUT_TYPE: Record<KeyboardType, { type: string; inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"] }> = {
  default: { type: "text" },
  "email-address": { type: "email", inputMode: "email" },
  numeric: { type: "text", inputMode: "numeric" },
  "number-pad": { type: "text", inputMode: "numeric" },
  "decimal-pad": { type: "text", inputMode: "decimal" },
  "phone-pad": { type: "tel", inputMode: "tel" },
  url: { type: "url", inputMode: "url" },
};

export default function FormField({
  label, value, onChangeText, error, hint, rightElement, multiline, numberOfLines, editable = true,
  keyboardType = "default", secureTextEntry, id, ...rest
}: FormFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const msgId = `${inputId}-msg`;
  const inSection = useInFormSection();
  const kb = INPUT_TYPE[keyboardType];
  const controlCls = [f.control, error && f.controlError, !editable && f.controlDisabled].filter(Boolean).join(" ");

  return (
    <div className={`${f.field} ${inSection ? f.inSection : ""}`}>
      <label htmlFor={inputId} className={f.label}>
        {label}
      </label>
      <div className={controlCls}>
        {multiline ? (
          <textarea
            id={inputId}
            className={f.input}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            rows={numberOfLines ?? 4}
            readOnly={!editable}
            aria-invalid={!!error}
            aria-describedby={error || hint ? msgId : undefined}
            placeholder={rest.placeholder}
          />
        ) : (
          <input
            {...rest}
            id={inputId}
            className={f.input}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            type={secureTextEntry ? "password" : kb.type}
            inputMode={kb.inputMode}
            readOnly={!editable}
            aria-invalid={!!error}
            aria-describedby={error || hint ? msgId : undefined}
          />
        )}
        {rightElement}
      </div>
      {error ? (
        <p id={msgId} className={f.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className={f.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
