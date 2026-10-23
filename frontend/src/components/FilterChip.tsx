"use client";

/** Chip de filtro (espejo de `mobile/src/components/FilterChip.tsx`). */
import type { CSSProperties, ReactNode } from "react";
import s from "./kit.module.css";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Color del chip activo (por defecto `primary`). */
  color?: string;
  icon?: ReactNode;
  count?: number;
}

export default function FilterChip({ label, active, onPress, color, icon, count }: FilterChipProps) {
  return (
    <button
      type="button"
      className={`${s.chip} ${active ? s.chipActive : ""}`}
      onClick={onPress}
      aria-pressed={active}
      style={color ? ({ "--c": color } as CSSProperties) : undefined}
    >
      {icon}
      {label}
      {typeof count === "number" ? <span aria-hidden>{count}</span> : null}
    </button>
  );
}
