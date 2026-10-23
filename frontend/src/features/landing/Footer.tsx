import Image from "next/image";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import shared from "./landing.module.css";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={shared.container}>
        <div className={styles.card}>
          <Image
            src="/landing/cierre.webp"
            alt="Un gato negro y un cachorro dorado dormidos juntos sobre una cobija"
            fill
            sizes="(max-width: 1340px) 100vw, 82rem"
            className={styles.photo}
          />
          <div className={styles.shade} aria-hidden />

          <div className={styles.cta}>
            <h2 className={styles.title}>Empieza hoy con el carnet de tu mascota.</h2>
            <Link href="/register" className={`${shared.btn} ${shared.btnGold}`}>
              Crear cuenta gratis
            </Link>
          </div>

          <div className={styles.bottom}>
            <p className={styles.brand}>
              <PawPrint size={22} strokeWidth={1.5} className={styles.mark} aria-hidden />
              Michicondrias
            </p>
            <nav aria-label="Pie de página" className={styles.links}>
              <a href="#etapas">Cómo funciona</a>
              <a href="#profesionales">Profesionales</a>
              <a href="#preguntas">Preguntas</a>
              <Link href="/login">Entrar</Link>
            </nav>
          </div>
        </div>

        <p className={styles.legal}>© {new Date().getFullYear()} Michicondrias. Hecho en México.</p>
      </div>
    </footer>
  );
}
