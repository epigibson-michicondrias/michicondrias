"use client";

/**
 * RequestModal — hoja modal para armar la solicitud de paseo/cuidado (espejo del `BottomSheet` de la app).
 */
import type { ReactNode } from "react";
import { useEffect } from "react";
import Button from "@/components/Button";
import s from "./servicios-pro.module.css";

interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  children: ReactNode;
}

export default function RequestModal({
  visible, onClose, title, subtitle, onSubmit, submitting, submitLabel = "Enviar", children,
}: RequestModalProps) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={s.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={s.modalSheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className={s.modalTitle}>{title}</p>
          {subtitle ? <p className={s.modalSubtitle}>{subtitle}</p> : null}
        </div>
        {children}
        <div className={s.modalFooter}>
          <Button label="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button
            label={submitLabel}
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
            style={{ flex: 1.6 }}
          />
        </div>
      </div>
    </div>
  );
}
