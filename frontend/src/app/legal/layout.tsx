import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/features/legal/legalConfig";
import styles from "@/features/legal/legal.module.css";

export const metadata: Metadata = {
  title: "Legal - Michicondrias",
  description: "Términos y condiciones, aviso de privacidad y políticas de Michicondrias.",
};

/** Layout público de /legal: sin sesión ni menú de la app, para abrirlo desde tiendas, registro y correos. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>🐾 {LEGAL.brand}</Link>
          <Link href="/legal" className={styles.back}>Documentos legales</Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} {LEGAL.brand}. Contacto: {LEGAL.supportEmail}
      </footer>
    </div>
  );
}
