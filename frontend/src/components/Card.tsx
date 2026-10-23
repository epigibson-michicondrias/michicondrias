"use client";

/** Tarjeta (espejo de `mobile/src/components/Card.tsx`). Con `onPress` es un botón. */
import type { CSSProperties, ReactNode } from "react";
import s from "./kit.module.css";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Quita el padding interno (para imágenes a sangre). */
  flush?: boolean;
  /** Sombra más marcada para tarjetas destacadas. */
  elevated?: boolean;
  style?: CSSProperties;
  accessibilityLabel?: string;
}

export default function Card({ children, onPress, flush, elevated, style, accessibilityLabel }: CardProps) {
  const cls = [s.card, flush && s.cardFlush, elevated && s.cardElevated].filter(Boolean).join(" ");
  if (onPress) {
    return (
      <button type="button" className={cls} onClick={onPress} style={style} aria-label={accessibilityLabel}>
        {children}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}
