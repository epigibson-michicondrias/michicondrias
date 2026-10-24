"use client";

/**
 * Acciones rápidas de contacto (llamar, WhatsApp, cómo llegar, sitio web).
 * Espejo del bloque `QuickAction` de `mobile/app/directorio/clinica/[id].tsx`.
 */
import type { ComponentType } from "react";
import s from "./contact.module.css";

type IconComponent = ComponentType<{ size?: number; color?: string }>;

export interface ContactAction {
  icon: IconComponent;
  label: string;
  color: string;
  onPress: () => void;
}

function QuickAction({ icon: Icon, label, color, onPress }: ContactAction) {
  return (
    <button type="button" className={s.quick} onClick={onPress} aria-label={label}>
      <Icon size={20} color={color} />
      <span className={s.quickLabel}>{label}</span>
    </button>
  );
}

export default function ContactActions({ actions }: { actions: (ContactAction | null | undefined)[] }) {
  const list = actions.filter(Boolean) as ContactAction[];
  if (list.length === 0) return null;
  return (
    <div className={s.quickRow}>
      {list.map((a) => (
        <QuickAction key={a.label} {...a} />
      ))}
    </div>
  );
}
