"use client";

/** Botón de solo ícono de 44 px (espejo de `mobile/src/components/IconButton.tsx`). */
import type { ComponentType, CSSProperties } from "react";
import s from "./kit.module.css";

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
export type IconButtonVariant = "subtle" | "surface" | "primary" | "glass";

interface IconButtonProps {
  icon: IconComponent;
  /** Texto para lectores de pantalla (obligatorio: el botón no tiene texto visible). */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  color?: string;
  strokeWidth?: number;
  disabled?: boolean;
  loading?: boolean;
  /** Contador sobre la esquina. No se muestra si es 0. */
  badge?: number;
  size?: "sm" | "md";
  style?: CSSProperties;
}

const VARIANT: Record<IconButtonVariant, string | undefined> = {
  subtle: undefined,
  surface: s.iconSurface,
  primary: s.iconPrimary,
  glass: s.iconGlass,
};

export default function IconButton({
  icon: Icon, accessibilityLabel, onPress, variant = "subtle", color, strokeWidth = 2, disabled, loading,
  badge, size = "md", style,
}: IconButtonProps) {
  const cls = [s.iconBtn, VARIANT[variant], size === "sm" && s.iconBtnSm].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      className={cls}
      onClick={onPress}
      disabled={disabled || loading}
      aria-label={accessibilityLabel}
      title={accessibilityLabel}
      style={style}
    >
      {loading ? <span className={s.spinner} aria-hidden /> : <Icon size={size === "sm" ? 18 : 20} color={color} strokeWidth={strokeWidth} />}
      {badge ? <span className={s.iconBadge}>{badge > 99 ? "99+" : badge}</span> : null}
    </button>
  );
}
