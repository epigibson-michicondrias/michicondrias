"use client";

/**
 * Cabecera estándar (espejo de `mobile/src/components/layout/ScreenHeader.tsx`, mismas props): volver + título +
 * `actions`. Hero por defecto con el color que deduce la ruta (`useScreenAccent`); `variant="plain"` sin fondo.
 */
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import IconButton from "../IconButton";
import { useScreenAccent } from "@/hooks/useScreenAccent";
import { MODULE_ACCENTS, type ModuleKey } from "@/constants/modules";
import l from "./layout.module.css";

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export interface HeaderAction {
  icon: IconComponent;
  /** Texto para lectores de pantalla. */
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  badge?: number;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Muestra el botón de volver (por defecto sí). */
  showBack?: boolean;
  /** Acción de volver propia; por defecto el historial o el inicio. */
  onBack?: () => void;
  actions?: HeaderAction[];
  /** Forma corta de una sola acción. */
  actionIcon?: IconComponent;
  onAction?: () => void;
  actionLabel?: string;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
  variant?: "hero" | "plain";
  /** Fuerza el color de un módulo. */
  module?: ModuleKey;
  /** Fuerza un color. */
  accent?: string;
}

export default function ScreenHeader({
  title, subtitle, showBack = true, onBack, actions, actionIcon, onAction, actionLabel, rightElement, leftElement,
  variant = "hero", module, accent,
}: ScreenHeaderProps) {
  const router = useRouter();
  const routeAccent = useScreenAccent();
  const color = accent ?? (module ? MODULE_ACCENTS[module] : routeAccent);
  const hero = variant === "hero";

  const all: HeaderAction[] = [...(actions ?? [])];
  if (actionIcon && onAction) all.push({ icon: actionIcon, label: actionLabel || "Acción", onPress: onAction });

  const back = onBack ?? (() => (window.history.length > 1 ? router.back() : router.replace("/")));
  const style = hero && color
    ? ({ "--accent-gradient": `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, black))` } as CSSProperties)
    : undefined;

  return (
    <header className={`${l.header} ${hero ? l.hero : ""}`} style={style}>
      {leftElement ?? (showBack ? (
        <IconButton icon={ChevronLeft} accessibilityLabel="Volver" onPress={back} variant={hero ? "glass" : "subtle"} />
      ) : null)}
      <div className={l.titles}>
        <h1 className={l.title}>{title}</h1>
        {subtitle ? <p className={l.subtitle}>{subtitle}</p> : null}
      </div>
      {all.length ? (
        <div className={l.actions}>
          {all.map((a) => (
            <IconButton
              key={a.label}
              icon={a.icon}
              accessibilityLabel={a.label}
              onPress={a.onPress}
              loading={a.loading}
              disabled={a.disabled}
              badge={a.badge}
              variant={hero ? "glass" : "surface"}
            />
          ))}
        </div>
      ) : null}
      {rightElement}
    </header>
  );
}
