/**
 * AuthShell — esqueleto común de las páginas de `(auth)` (espejo de `mobile/src/components/AuthShell.tsx`):
 * fondo con degradado del tema, círculos decorativos y contenido centrado. Cada página aporta su contenido.
 */
import type { ReactNode } from "react";
import s from "./AuthShell.module.css";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={s.root}>
      <div className={s.deco1} aria-hidden />
      <div className={s.deco2} aria-hidden />
      <main className={s.scroll}>{children}</main>
    </div>
  );
}
