"use client";

/** Vacío con una sola acción clara (espejo de `mobile/src/components/EmptyState.tsx`). */
import type { ReactNode } from "react";
import Button from "./Button";
import s from "./kit.module.css";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={s.empty}>
      <div className={s.emptyIcon}>{icon}</div>
      <p className={s.emptyTitle}>{title}</p>
      {subtitle ? <p className={s.emptySubtitle}>{subtitle}</p> : null}
      {actionLabel && onAction ? (
        <div className={s.emptyAction}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </div>
      ) : null}
    </div>
  );
}
