"use client";

/** Acción (espejo de `mobile/src/components/Button.tsx`, mismas props). */
import type { CSSProperties, ReactNode } from "react";
import s from "./kit.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Icono a la izquierda (nodo ya renderizado). */
  icon?: ReactNode;
  /** Icono a la derecha. */
  iconRight?: ReactNode;
  fullWidth?: boolean;
  style?: CSSProperties;
  accessibilityLabel?: string;
  /** Solo web: `submit` dentro de un `<form>`. */
  type?: "button" | "submit";
}

export default function Button({
  label, onPress, variant = "primary", size = "md", loading, disabled, icon, iconRight,
  fullWidth = true, style, accessibilityLabel, type = "button",
}: ButtonProps) {
  const cls = [s.btn, variant !== "primary" && s[variant], size !== "md" && s[size], fullWidth && s.fullWidth]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={cls}
      onClick={onPress}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={accessibilityLabel}
      style={style}
    >
      {loading ? <span className={s.spinner} aria-hidden /> : icon}
      {label}
      {!loading && iconRight}
    </button>
  );
}
