"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import styles from "./MichiNotes.module.css";

// Letra a mano para las notas y la palabra gigante (inspirado en la plantilla «Nocturne» de 21st.dev).
const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], display: "swap" });

const EASE = [0.22, 1, 0.36, 1] as const;

/** Tres estados que cambian con el scroll: palabra, foto y notas alrededor. */
const STATES = [
  {
    word: "Ronronea",
    photo: "/landing/expediente.webp",
    alt: "Un gato gris descansa en el regazo de su dueño",
    notes: ["duerme hasta 16 horas", "calma", "tu regazo es su lugar"],
  },
  {
    word: "Explora",
    photo: "/landing/consientelo.webp",
    alt: "Un gato siamés salta por un juguete de plumas",
    notes: ["salta 5 veces su altura", "curioso", "Michi-Tracker sabe dónde anda"],
  },
  {
    word: "Te elige",
    photo: "/landing/adopta.webp",
    alt: "Una joven abraza al gatito que acaba de adoptar",
    notes: ["para siempre", "adopta", "él decide cuándo hay mimos"],
  },
];

/* Flechas a mano: una por nota, dibujadas con pathLength. */
const ARROWS = [
  "M70 6 C 60 30, 40 52, 8 64 M8 64 L 24 66 M8 64 L 16 50",
  "M6 40 C 30 6, 70 4, 94 30 M94 30 L 80 28 M94 30 L 92 16",
  "M40 4 C 34 26, 26 44, 10 60 M10 60 L 24 58 M10 60 L 12 46",
];

export default function MichiNotes() {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setIndex(Math.min(STATES.length - 1, Math.floor(p * STATES.length)));
  });

  const state = STATES[index];

  return (
    <section ref={ref} className={`${styles.section} ${hand.className}`} aria-label="Así son los michis">
      <div className={styles.sticky}>
        <p className={styles.intro}>
          Michicondrias nació pensando en los gatos: independientes, curiosos y leales a su manera.
        </p>

        <div className={styles.stage}>
          <AnimatePresence mode="wait">
            <motion.div
              key={state.word}
              className={styles.portrait}
              initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.96, rotate: 2 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Image src={state.photo} alt={state.alt} fill sizes="(max-width: 760px) 60vw, 22rem" className={styles.photo} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={state.word} className={styles.notes} aria-hidden>
              {state.notes.map((note, i) => (
                <div key={note} className={styles.note} data-slot={i}>
                  <motion.span
                    className={styles.noteText}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 + i * 0.15 }}
                  >
                    {note}
                  </motion.span>
                  <svg viewBox="0 0 100 70" className={styles.arrow}>
                    <motion.path
                      d={ARROWS[i]}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={state.word}
              className={styles.word}
              initial={{ opacity: 0, y: 30, rotate: -3, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, rotate: -3, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, rotate: -3, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {state.word}
            </motion.p>
          </AnimatePresence>
        </div>

        <ol className={styles.dots} aria-hidden>
          {STATES.map((s, i) => (
            <li key={s.word} data-active={i === index} />
          ))}
        </ol>
      </div>
    </section>
  );
}
