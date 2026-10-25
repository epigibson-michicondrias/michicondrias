"use client";

/**
 * FormActionsBar — barra de acciones pegada al pie del formulario (web): «Cancelar» discreto a la izquierda de la
 * acción principal. Siempre visible al desplazarse por formularios largos.
 */
import type { ReactNode } from "react";
import Button from "@/components/Button";
import f from "./forms.module.css";

interface FormActionsBarProps {
  submitLabel: string;
  busy?: boolean;
  onCancel?: () => void;
  icon?: ReactNode;
  /** Texto corto a la izquierda (p. ej. «* Obligatorio»). */
  note?: string;
}

export default function FormActionsBar({ submitLabel, busy, onCancel, icon, note }: FormActionsBarProps) {
  return (
    <div className={f.actionsBar}>
      {note && <p className={f.actionsNote}>{note}</p>}
      <div className={f.actionsButtons}>
        {onCancel && <Button label="Cancelar" variant="ghost" fullWidth={false} onPress={onCancel} disabled={busy} />}
        <Button type="submit" label={submitLabel} loading={busy} icon={icon} fullWidth={false} />
      </div>
    </div>
  );
}
