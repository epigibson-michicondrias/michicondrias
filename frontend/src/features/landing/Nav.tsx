"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { PawPrint } from "lucide-react";
import shared from "./landing.module.css";
import { LOGIN_URL, REGISTER_URL } from "./links";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#etapas", label: "Cómo funciona" },
  { href: "#funciones", label: "Funciones" },
  { href: "#profesionales", label: "Profesionales" },
  { href: "#preguntas", label: "Preguntas" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));

  return (
    <motion.header
      className={styles.nav}
      data-solid={solid}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`${shared.container} ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Michicondrias, inicio">
          <PawPrint size={22} strokeWidth={1.75} className={styles.mark} aria-hidden />
          <span>Michicondrias</span>
        </Link>

        <nav aria-label="Secciones" className={styles.links}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href={LOGIN_URL} className={styles.login}>
            Entrar
          </Link>
          <Link href={REGISTER_URL} className={`${shared.btn} ${shared.btnGold} ${styles.cta}`}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
