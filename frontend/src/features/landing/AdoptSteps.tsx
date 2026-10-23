"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import shared from "./landing.module.css";
import { REGISTER_URL } from "./links";
import styles from "./AdoptSteps.module.css";
import { Rise } from "./effects";

/** El flujo real de adopción en la app (mobile/app/adopciones/*). Es una secuencia, por eso va numerado. */
const STEPS = [
  { title: "Explora perfiles", text: "Gatos y perros de refugios verificados, con su historia, su salud y su carácter." },
  { title: "Formulario de compatibilidad", text: "Cuéntanos de tu casa, tu experiencia y tu rutina para saber si son el uno para el otro." },
  { title: "El refugio revisa", text: "Tu solicitud llega al refugio, que la revisa y te responde en la app." },
  { title: "Contrato y a casa", text: "Ambos firman el contrato de adopción en línea. Bienvenido a la familia." },
];

function Step({ i, progress, title, text }: { i: number; progress: MotionValue<number>; title: string; text: string }) {
  // Cada paso se enciende cuando la línea dorada llega a él.
  const at = i / (STEPS.length - 1);
  const lit = useTransform(progress, [at - 0.08, at], [0, 1]);
  const bg = useTransform(lit, [0, 1], ["#131826", "#e9c883"]);
  const color = useTransform(lit, [0, 1], ["#9aa3b5", "#101c3d"]);

  return (
    <li className={styles.step}>
      <motion.span className={styles.num} style={{ backgroundColor: bg, color }}>
        {i + 1}
      </motion.span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
    </li>
  );
}

export default function AdoptSteps() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 80%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <section className={styles.section} aria-labelledby="adoptar-title">
      <div className={shared.container}>
        <div className={styles.head}>
          <Rise id="adoptar-title" text="Así funciona adoptar" className={shared.sectionTitle} />
          <p className={shared.sectionLead}>Un proceso claro para que la adopción sea para siempre.</p>
        </div>

        <div ref={listRef} className={styles.wrap}>
          <span className={styles.line} aria-hidden>
            <motion.span className={styles.lineFill} style={{ scaleX: progress }} />
          </span>
          <span className={styles.lineV} aria-hidden>
            <motion.span className={styles.lineFillV} style={{ scaleY: progress }} />
          </span>
          <ol className={styles.list}>
            {STEPS.map((s, i) => (
              <Step key={s.title} i={i} progress={progress} title={s.title} text={s.text} />
            ))}
          </ol>
        </div>

        <div className={styles.ctas}>
          <Link href={REGISTER_URL} className={`${shared.btn} ${shared.btnGold}`}>
            Ver michis en adopción
          </Link>
        </div>
      </div>
    </section>
  );
}
