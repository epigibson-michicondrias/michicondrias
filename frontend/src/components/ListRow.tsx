"use client";

/** Fila de menú o ajustes (espejo de `mobile/src/components/ListRow.tsx`). */
import type { ComponentType, CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
import s from "./kit.module.css";

interface ListRowProps {
  icon: ComponentType<{ size?: number; color?: string }>;
  label: string;
  desc?: string;
  color?: string;
  onPress?: () => void;
  /** Texto de badge a la derecha (p. ej. "Nuevo", "3"). */
  badge?: string;
  destructive?: boolean;
}

export default function ListRow({ icon: Icon, label, desc, color, onPress, badge, destructive }: ListRowProps) {
  const c = destructive ? "var(--color-error)" : color;
  return (
    <button
      type="button"
      className={`${s.row} ${destructive ? s.rowDestructive : ""}`}
      onClick={onPress}
      style={c ? ({ "--c": c } as CSSProperties) : undefined}
    >
      <span className={s.rowIcon}>
        <Icon size={18} />
      </span>
      <span className={s.rowInfo}>
        <span className={s.rowLabel} style={{ display: "block" }}>{label}</span>
        {desc ? <span className={s.rowDesc} style={{ display: "block" }}>{desc}</span> : null}
      </span>
      {badge ? <span className={s.rowBadge}>{badge}</span> : null}
      {!destructive && <ChevronRight size={16} className={s.muted} aria-hidden />}
    </button>
  );
}
