"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import shared from "./landing.module.css";
import styles from "./Promises.module.css";
import { Rise } from "./effects";

/** Compromisos que la plataforma ya cumple (KYC, revisión de publicaciones, Stripe, bucket privado). */
const PROMISES = [
  { word: "Identidad verificada.", text: "Cada profesional pasa por verificación de identidad antes de ofrecer sus servicios." },
  { word: "Adopciones revisadas.", text: "Cada publicación de adopción se revisa antes de aparecer en la app." },
  { word: "Pagos seguros.", text: "Los pagos con tarjeta los procesa Stripe. Los datos de tu tarjeta nunca pasan por Michicondrias." },
  { word: "Documentos privados.", text: "Tu identificación se guarda aparte y solo la ve el equipo de verificación." },
];

/* Inclinación inicial de cada tarjeta: grados, desplazamiento vertical y horizontal (px). */
const TILT = [
  [-7, -50, 34],
  [6, 40, -26],
  [-5, -26, 30],
  [8, 56, -36],
];

/** Cada tarjeta se endereza según su propia posición: en móvil, una debajo de otra, todas terminan igual. */
function PromiseCard({ i, word, text }: { i: number; word: string; text: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: progress } = useScroll({ target: ref, offset: ["start 98%", "start 50%"] });
  const [r, y, x] = TILT[i];
  const rotate = useTransform(progress, [0, 1], [r, 0]);
  const ty = useTransform(progress, [0, 1], [y, 0]);
  const tx = useTransform(progress, [0, 1], [x, 0]);
  const bg = useTransform(progress, [0.35, 0.95], ["#e9c883", "#131826"]);
  const color = useTransform(progress, [0.35, 0.95], ["#101c3d", "#f5f1e8"]);
  const weight = useTransform(progress, [0.25, 0.95], [800, 300]);

  return (
    <motion.li ref={ref} className={styles.card} style={{ rotate, y: ty, x: tx, backgroundColor: bg, color }}>
      <motion.p className={styles.word} style={{ fontWeight: weight }}>
        {word}
      </motion.p>
      <p className={styles.text}>{text}</p>
    </motion.li>
  );
}

export default function Promises() {
  return (
    <section className={styles.section} aria-labelledby="promesas-title">
      <div className={shared.container}>
        <div className={styles.head}>
          <Rise id="promesas-title" text="Lo que cuidamos por ti" className={shared.sectionTitle} />
          <p className={shared.sectionLead}>Confianza antes que cualquier otra cosa: estas reglas no se rompen.</p>
        </div>
        <ul className={styles.list}>
          {PROMISES.map((p, i) => (
            <PromiseCard key={p.word} i={i} word={p.word} text={p.text} />
          ))}
        </ul>
      </div>
    </section>
  );
}
