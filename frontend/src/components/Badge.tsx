/** Etiqueta de estado (espejo de `mobile/src/components/Badge.tsx`). */
import type { CSSProperties, ReactNode } from "react";
import s from "./kit.module.css";

interface BadgeProps {
  label: string;
  color?: string;
  icon?: ReactNode;
  /** `filled`: tinte suave · `outlined`: solo borde · `solid`: fondo pleno (sobre fotos). */
  variant?: "filled" | "outlined" | "solid";
  size?: "sm" | "md";
  accessibilityLabel?: string;
}

export default function Badge({ label, color, icon, variant = "filled", size = "md", accessibilityLabel }: BadgeProps) {
  const cls = [s.badge, size === "sm" && s.badgeSm, variant === "outlined" && s.badgeOutlined, variant === "solid" && s.badgeSolid]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} style={color ? ({ "--c": color } as CSSProperties) : undefined} aria-label={accessibilityLabel}>
      {icon}
      {label}
    </span>
  );
}
