"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Activity, Cat, Heart, Info, ShieldAlert, Sparkles } from "lucide-react";
import shared from "./landing.module.css";
import { REGISTER_URL } from "./links";
import styles from "./AiDemo.module.css";
import { Rise } from "./effects";

/* Conversación de ejemplo con el formato real de Michi-IA (mobile/app/mascotas/diagnostico-ia.tsx):
   nivel de urgencia, resumen, plan de acción y aviso. */
const QUESTION =
  "Luna lleva dos días comiendo muy poco, está más quieta de lo normal y hoy vomitó una bola de pelo.";

const RESULT = {
  level: "Urgencia media",
  summary:
    "Puede ser una bola de pelo que le irrita el estómago o una molestia digestiva. Dos días comiendo poco ya merecen atención en un gato.",
  plan: "Ofrécele agua fresca y comida húmeda en porciones pequeñas. Si en 24 horas no come, vuelve a vomitar o la ves decaída, agenda una consulta.",
  disclaimer: "Esta orientación no sustituye la revisión de un veterinario.",
};

type Phase = "idle" | "typing" | "thinking" | "done";

export default function AiDemo() {
  const chatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chatRef, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  // Al entrar en pantalla: se escribe la pregunta, Michi-IA "piensa" y aparece la respuesta.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setTyped(QUESTION.length);
      setPhase("done");
      return;
    }
    setPhase("typing");
    let i = 0;
    const typing = window.setInterval(() => {
      i += 2;
      setTyped(Math.min(i, QUESTION.length));
      if (i >= QUESTION.length) {
        window.clearInterval(typing);
        setPhase("thinking");
        window.setTimeout(() => setPhase("done"), 1400);
      }
    }, 28);
    return () => window.clearInterval(typing);
  }, [inView, reduce]);

  return (
    <section className={styles.section} aria-labelledby="ia-title">
      <div className={`${shared.container} ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <Sparkles size={16} strokeWidth={1.75} /> Michi-IA
          </p>
          <Rise id="ia-title" text="Cuéntale qué le pasa" className={shared.sectionTitle} />
          <p className={shared.sectionLead}>
            Describe sus síntomas y Michi-IA te dice qué tan urgente es y qué hacer mientras tanto. Si es grave, te lo
            dice claro y te manda con el veterinario.
          </p>
          <ul className={styles.modes}>
            <li>
              <Activity size={20} strokeWidth={1.6} />
              <div>
                <p className={styles.modeTitle}>Síntomas</p>
                <p className={styles.modeText}>Nivel de urgencia, qué puede ser y un plan de acción.</p>
              </div>
            </li>
            <li>
              <Heart size={20} strokeWidth={1.6} />
              <div>
                <p className={styles.modeTitle}>Nutrición</p>
                <p className={styles.modeText}>Calorías e hidratación diarias según su actividad, y una dieta sugerida.</p>
              </div>
            </li>
          </ul>
          <Link href={REGISTER_URL} className={`${shared.btn} ${shared.btnGold}`}>
            Probar Michi-IA
          </Link>
        </div>

        <div ref={chatRef} className={styles.chat} aria-label="Ejemplo de conversación con Michi-IA">
          <div className={styles.chatHead}>
            <span className={styles.chatAvatar}>
              <Sparkles size={18} strokeWidth={1.75} />
            </span>
            <div>
              <p className={styles.chatName}>Michi-IA</p>
              <p className={styles.chatMeta}>Sintomatología de Luna</p>
            </div>
          </div>

          <div className={styles.bubbleUser}>
            <Cat size={18} strokeWidth={1.6} className={styles.bubbleIcon} />
            <p>
              {QUESTION.slice(0, typed)}
              {phase === "typing" && <span className={styles.caret} />}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {phase === "thinking" && (
              <motion.div
                key="thinking"
                className={styles.thinking}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span />
                <span />
                <span />
                Analizando síntomas
              </motion.div>
            )}
            {phase === "done" && (
              <motion.div
                key="result"
                className={styles.result}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className={styles.level}>
                  <ShieldAlert size={20} strokeWidth={1.75} /> {RESULT.level}
                </p>
                <p className={styles.summary}>{RESULT.summary}</p>
                <div className={styles.plan}>
                  <p className={styles.planLabel}>Plan de acción recomendado</p>
                  <p>{RESULT.plan}</p>
                </div>
                <p className={styles.disclaimer}>
                  <Info size={14} strokeWidth={1.75} /> {RESULT.disclaimer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
