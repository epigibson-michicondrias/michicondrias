"use client";

/**
 * Tabs — pestañas subrayadas de escritorio (la app usa `SegmentedControl`; en web las secciones de una ficha se
 * navegan como pestañas de documento). Accesible: `tablist` con flechas izquierda/derecha.
 */
import type { ComponentType, KeyboardEvent } from "react";
import s from "./Tabs.module.css";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  icon?: ComponentType<{ size?: number }>;
  /** Número opcional junto a la etiqueta (p. ej. vacunas registradas). */
  count?: number;
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  accessibilityLabel: string;
}

export default function Tabs<T extends string>({ value, onChange, options, accessibilityLabel }: TabsProps<T>) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = options.findIndex((o) => o.value === value);
    const next = options[(i + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length];
    onChange(next.value);
  };

  return (
    <div className={s.tabs} role="tablist" aria-label={accessibilityLabel} onKeyDown={onKeyDown}>
      {options.map(({ value: v, label, icon: Icon, count }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={`${s.tab} ${active ? s.active : ""}`}
            onClick={() => onChange(v)}
          >
            {Icon && <Icon size={16} />}
            {label}
            {count != null && <span className={s.count}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
