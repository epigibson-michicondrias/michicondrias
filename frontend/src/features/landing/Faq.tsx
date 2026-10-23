"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import shared from "./landing.module.css";
import { Rise } from "./effects";
import styles from "./Faq.module.css";

const QUESTIONS = [
  {
    q: "¿Cuánto cuesta?",
    a: "Crear tu cuenta, llevar el carnet de tu mascota, adoptar y buscar veterinario no cuesta nada. Algunas funciones, como Michi-Tracker Pro, tienen una suscripción opcional.",
  },
  {
    q: "¿Quién puede publicar mascotas en adopción?",
    a: "Refugios y hogares temporales verificados. Cada publicación se revisa antes de aparecer, para que adoptes con confianza.",
  },
  {
    q: "¿Cómo me registro como profesional?",
    a: "Crea tu cuenta, entra a tu perfil y elige «Ser profesional». Sube tu identificación y los documentos de tu oficio. Cuando el equipo los aprueba, tus herramientas aparecen sin volver a iniciar sesión.",
  },
  {
    q: "¿Qué pasa con mis documentos de identidad?",
    a: "Se guardan en un almacenamiento privado, separado de las fotos públicas, y solo el equipo de verificación puede revisarlos.",
  },
  {
    q: "¿Qué hago si mi mascota se pierde?",
    a: "Publica un reporte con su foto y el último lugar donde la viste. Quien la vea puede registrar un avistamiento y te avisamos al momento. También te mostramos reportes parecidos a menos de 10 km.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="preguntas" className={styles.section} aria-labelledby="faq-title">
      <div className={`${shared.container} ${styles.grid}`}>
        <Rise id="faq-title" text="Preguntas frecuentes" className={shared.sectionTitle} />

        <ul className={styles.list}>
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-${i}`;
            return (
              <li key={item.q} className={styles.item}>
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <motion.span
                    className={styles.icon}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    aria-hidden
                  >
                    <Plus size={20} strokeWidth={1.75} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      id={panelId}
                      className={styles.answerWrap}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className={styles.answer}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
