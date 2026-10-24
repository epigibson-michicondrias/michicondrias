"use client";

/** Contenedor de toda pantalla (espejo de `mobile/src/components/layout/ScreenContainer.tsx`). Incluye el banner de error. */
import type { CSSProperties, ReactNode } from "react";
import QueryErrorBanner from "../QueryErrorBanner";
import l from "./layout.module.css";

interface ScreenContainerProps {
  children: ReactNode;
  style?: CSSProperties;
  /** Sin padding (pantallas con fotos o listas a sangre). */
  noPadding?: boolean;
}

export default function ScreenContainer({ children, style, noPadding }: ScreenContainerProps) {
  return (
    <main className={`${l.screen} ${noPadding ? l.noPadding : ""}`} style={style}>
      {children}
      <QueryErrorBanner />
    </main>
  );
}
