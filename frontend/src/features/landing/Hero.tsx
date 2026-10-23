"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { BellRing, Cat, Check, Clock3, Stethoscope } from "lucide-react";
import shared from "./landing.module.css";
import { LOGIN_URL, REGISTER_URL } from "./links";
import styles from "./Hero.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE = ["Toda la vida", "de tu mascota,", "en un solo lugar."];

const line: Variants = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, delay: 0.35 + i * 0.12, ease: EASE } }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } }),
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="hero-title">
      <motion.div
        className={styles.media}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
        style={{ y: photoY }}
      >
        <Image
          src="/landing/hero.webp"
          alt="Un gato naranja y un golden retriever sentados juntos"
          fill
          priority
          sizes="100vw"
          className={styles.photo}
        />
      </motion.div>
      <div className={styles.shade} aria-hidden />

      <div className={`${shared.container} ${styles.inner}`}>
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

          <motion.p className={styles.lead} variants={fade} custom={0.8}>
            Adopta, lleva su carnet de vacunas, encuentra veterinario y pide ayuda si se pierde. Todo con la misma
            cuenta, en la web y en la app.
          </motion.p>

          <motion.div className={styles.ctas} variants={fade} custom={0.95}>
            <Link href={REGISTER_URL} className={`${shared.btn} ${shared.btnGold}`}>
              Crear cuenta gratis
            </Link>
            <Link href={LOGIN_URL} className={`${shared.btn} ${shared.btnGhost}`}>
              Ya tengo cuenta
            </Link>
          </motion.div>
        </motion.div>

        <CarnetDemo />
      </div>
    </section>
  );
}

const VACCINES = [
  { name: "Triple felina", date: "14 mar 2026", done: true },
  { name: "Rabia", date: "2 abr 2026", done: true },
  { name: "Leucemia felina", date: "Toca el 12 nov", done: false },
];

/** Carnet de ejemplo sobre la foto: muestra el producto en lugar de describirlo. */
function CarnetDemo() {
  return (
    <div className={styles.demo} role="img" aria-label="Ejemplo de carnet digital de una gata llamada Luna">
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
      >
        <div className={styles.cardHead}>
          <span className={styles.avatar}>
            <Cat size={24} strokeWidth={1.5} />
          </span>
          <div>
            <p className={styles.petName}>Luna</p>
            <p className={styles.petMeta}>Gata mestiza de 3 años</p>
          </div>
          <span className={styles.badge}>Al día</span>
        </div>

        <ul className={styles.vaccines}>
          {VACCINES.map((v, i) => (
            <motion.li
              key={v.name}
              className={styles.vaccine}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.3 + i * 0.18, ease: EASE }}
            >
              <motion.span
                className={v.done ? styles.tick : styles.pending}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: 1.45 + i * 0.18 }}
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
        transition={{ type: "spring", bounce: 0.35, duration: 0.8, delay: 2.2 }}
      >
        <BellRing size={18} strokeWidth={1.75} />
        Mañana toca desparasitar a Luna
      </motion.div>
    </div>
  );
}
