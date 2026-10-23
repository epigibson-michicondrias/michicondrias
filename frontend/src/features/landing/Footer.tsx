"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { PawPrint } from "lucide-react";
import shared from "./landing.module.css";
import { LOGIN_URL, REGISTER_URL } from "./links";
import styles from "./Footer.module.css";
import { Curl, Rise } from "./effects";

export default function Footer() {
  const cardRef = useRef<HTMLDivElement>(null);
  // La tarjeta se abre desde un cuadro en la esquina inferior izquierda hasta ocupar todo su espacio.
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start 95%", "start 30%"] });
  const top = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const right = useTransform(scrollYProgress, [0, 1], [55, 0]);
  const clipPath = useTransform(() => `inset(${top.get()}% ${right.get()}% 0% 0% round 2rem)`);

  return (
    <footer className={styles.footer}>
      <div className={shared.container}>
        <motion.div ref={cardRef} className={styles.card} style={{ clipPath }}>
          <Image
            src="/landing/cierre.webp"
            alt="Un gato negro y un cachorro dorado dormidos juntos sobre una cobija"
            fill
            sizes="(max-width: 1340px) 100vw, 82rem"
            className={styles.photo}
          />
          <div className={styles.shade} aria-hidden />

          <div className={styles.cta}>
            <Rise text="Empieza hoy con el carnet de tu mascota." className={styles.title} />
            <Link href={REGISTER_URL} className={`${shared.btn} ${shared.btnGold}`}>
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
              <a href="#funciones">Funciones</a>
              <a href="#profesionales">Profesionales</a>
              <a href="#preguntas">Preguntas</a>
              <Link href={LOGIN_URL}>Entrar</Link>
            </nav>
          </div>
        </motion.div>

        <p className={styles.legal}>© {new Date().getFullYear()} Michicondrias. Hecho en México.</p>

        <div className={styles.wordmark} aria-hidden>
          <Rise as="p" text="Michicondrias" className={styles.wordmarkText} />
          <Curl className={styles.wordmarkCurl} />
        </div>
      </div>
    </footer>
  );
}
