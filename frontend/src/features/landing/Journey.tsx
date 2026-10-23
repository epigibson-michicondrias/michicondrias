"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import shared from "./landing.module.css";
import { scrollToY } from "./smoothScroll";
import { Rise } from "./effects";
import styles from "./Journey.module.css";
import { STEPS, type JourneyStep } from "./journeySteps";

/** Foto de la etapa con la maqueta de la app flotando encima. */
function Scene({ step }: { step: JourneyStep }) {
  return (
    <div className={styles.scene}>
      <div className={styles.frame}>
        <Image src={step.photo} alt={step.alt} fill sizes="(max-width: 960px) 92vw, 34rem" className={styles.photo} />
      </div>
      <div className={styles.float}>
        <step.Visual />
      </div>
    </div>
  );
}

/**
 * Las etapas de la vida de una mascota. En escritorio la sección se queda fija y el scroll avanza de etapa;
 * en móvil es una lista normal con cada ejemplo debajo de su texto.
 */
export default function Journey() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
  });

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + (travel * (i + 0.5)) / STEPS.length);
  };

  return (
    <section id="etapas" className={styles.section} aria-labelledby="etapas-title">
      <div ref={trackRef} className={styles.track} style={{ "--steps": STEPS.length } as React.CSSProperties}>
        <div className={styles.sticky}>
          <div className={`${shared.container} ${styles.grid}`}>
            <div>
              <Rise id="etapas-title" text="Contigo en cada etapa" className={shared.sectionTitle} />

              <div className={styles.timeline}>
                <div className={styles.rail} aria-hidden>
                  <motion.div className={styles.railFill} style={{ scaleY: progress }} />
                </div>

                <ol className={styles.steps}>
                  {STEPS.map((step, i) => (
                    <li key={step.title} className={styles.step} data-active={i === active}>
                      <button type="button" className={styles.stepButton} onClick={() => goTo(i)}>
                        <span className={styles.dot} aria-hidden />
                        <span className={styles.stepTitle}>{step.title}</span>
                      </button>
                      <p className={styles.stepText}>{step.text}</p>
                      <div className={styles.inlineVisual}>
                        <Scene step={step} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={styles.stage} aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  className={styles.stageInner}
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Scene step={STEPS[active]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
