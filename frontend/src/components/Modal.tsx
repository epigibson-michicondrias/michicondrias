"use client";

/**
 * Modal — diálogo con título, contenido y pie de acciones (equivale a los `Modal` de formulario de la app).
 * Cierra con Escape o tocando el fondo. El contenido largo hace scroll dentro del diálogo.
 */
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";
import s from "./modal.module.css";

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** Acciones al pie (normalmente uno o dos `Button`). */
  footer?: ReactNode;
}

export default function Modal({ open, title, subtitle, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={s.head}>
          <div className={s.titles}>
            <h2 className={s.title}>{title}</h2>
            {subtitle ? <p className={s.subtitle}>{subtitle}</p> : null}
          </div>
          <IconButton icon={X} accessibilityLabel="Cerrar" onPress={onClose} size="sm" />
        </header>
        <div className={s.body}>{children}</div>
        {footer ? <footer className={s.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}
