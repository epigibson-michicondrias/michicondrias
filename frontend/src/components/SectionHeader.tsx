"use client";

/** Título de sección con acción opcional (espejo de `mobile/src/components/SectionHeader.tsx`). */
import type { ReactNode } from "react";
import s from "./kit.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Estilo "etiqueta" en mayúsculas (para listas de Más/Ajustes). */
  overline?: boolean;
}

export default function SectionHeader({ title, subtitle, icon, actionLabel, onAction, overline }: SectionHeaderProps) {
  return (
    <div className={s.sectionHeader}>
      <div className={s.sectionLeft}>
        {icon}
        <div>
          <h2 className={overline ? s.sectionOverline : s.sectionTitle}>{title}</h2>
          {subtitle ? <p className={s.sectionSubtitle}>{subtitle}</p> : null}
        </div>
      </div>
      {actionLabel && onAction ? (
        <button type="button" className={s.link} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
