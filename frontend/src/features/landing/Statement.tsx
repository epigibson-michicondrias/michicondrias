"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import shared from "./landing.module.css";
import { Curl } from "./effects";
import styles from "./Statement.module.css";

const TEXT =
  "Veterinarios, refugios, paseadores, estilistas y tiendas. Quince oficios y una sola cuenta para cuidar a tu mascota.";

/** Frase que se enfoca palabra por palabra mientras se recorre. */
export default function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = TEXT.split(" ");

  return (
    <section className={styles.section}>
      <div className={`${shared.container} ${styles.inner}`}>
        <Curl className={styles.curl} />
        <p ref={ref} className={styles.text}>
          {reduce
            ? TEXT
            : words.map((word, i) => (
                <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {word}
                </Word>
              ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const blur = useTransform(progress, range, [8, 0]);
  const filter = useTransform(() => `blur(${blur.get()}px)`);

  return (
    <>
      <motion.span style={{ opacity, filter }}>{children}</motion.span>{" "}
    </>
  );
}
