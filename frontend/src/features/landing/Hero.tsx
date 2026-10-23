"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { BellRing, Cat, Check, Clock3, Stethoscope } from "lucide-react";
import shared from "./landing.module.css";
import styles from "./Hero.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE = ["Toda la vida", "de tu mascota,", "en un solo lugar."];

const VACCINES = [
  { name: "Triple felina", date: "14 mar 2026", done: true },
  { name: "Rabia", date: "2 abr 2026", done: true },
  { name: "Leucemia felina", date: "Toca el 12 nov", done: false },
];

const line: Variants = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE } }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } }),
};

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.glowGold} aria-hidden />
      <div className={styles.glowNavy} aria-hidden />

      <div className={`${shared.container} ${styles.grid}`}>
        <motion.div className={styles.copy} initial="hidden" animate="show">
          <h1 id="hero-title" className={styles.title}>
            {HEADLINE.map((text, i) => (
              <span key={text} className={styles.mask}>
                <motion.span className={styles.line} variants={line} custom={i}>
                  {text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className={styles.lead} variants={fade} custom={0.55}>
            Adopta, lleva su carnet de vacunas, encuentra veterinario y pide ayuda si se pierde. Todo con la misma
            cuenta, en la web y en la app.
          </motion.p>

          <motion.div className={styles.ctas} variants={fade} custom={0.7}>
            <Link href="/register" className={`${shared.btn} ${shared.btnGold}`}>
              Crear cuenta gratis
            </Link>
            <Link href="/login" className={`${shared.btn} ${shared.btnGhost}`}>
              Ya tengo cuenta
            </Link>
          </motion.div>
        </motion.div>

        <CarnetDemo />
      </div>
    </section>
  );
}

/** Carnet de ejemplo: muestra el producto en lugar de describirlo. Es el único momento animado al cargar. */
function CarnetDemo() {
  return (
    <div className={styles.demo} aria-label="Ejemplo de carnet digital de una gata llamada Luna" role="img">
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 48, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
      >
        <div className={styles.cardHead}>
          <span className={styles.avatar}>
            <Cat size={26} strokeWidth={1.5} />
          </span>
          <div>
            <p className={styles.petName}>Luna</p>
            <p className={styles.petMeta}>Gata mestiza de 3 años</p>
          </div>
          <span className={styles.badge}>Al día</span>
        </div>

        <p className={styles.cardLabel}>Vacunas</p>
        <ul className={styles.vaccines}>
          {VACCINES.map((v, i) => (
            <motion.li
              key={v.name}
              className={styles.vaccine}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.18, ease: EASE }}
            >
              <motion.span
                className={v.done ? styles.tick : styles.pending}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: 1.15 + i * 0.18 }}
              >
                {v.done ? <Check size={14} strokeWidth={2.5} /> : <Clock3 size={14} strokeWidth={2} />}
              </motion.span>
              <span className={styles.vaccineName}>{v.name}</span>
              <span className={styles.vaccineDate}>{v.date}</span>
            </motion.li>
          ))}
        </ul>

        <div className={styles.visit}>
          <Stethoscope size={18} strokeWidth={1.75} className={styles.visitIcon} />
          <div>
            <p className={styles.visitTitle}>Próxima consulta</p>
            <p className={styles.visitMeta}>Jueves 10:30 con la Dra. Paula Ríos</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={styles.toast}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.8, delay: 2 }}
      >
        <BellRing size={18} strokeWidth={1.75} className={styles.toastIcon} />
        <span>Mañana toca desparasitar a Luna</span>
      </motion.div>
    </div>
  );
}
