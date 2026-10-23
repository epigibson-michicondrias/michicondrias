"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import styles from "./effects.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Título que sube palabra por palabra desde una máscara la primera vez que entra en pantalla.
 * Cada palabra va en su propio recorte, así el texto sigue leyéndose entero para lectores de pantalla.
 */
export function Rise({
  text,
  as: Tag = "h2",
  id,
  className,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Con `amount` y no con margen: así también se activa lo que está al final de la página.
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(" ");

  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={styles.mask}>
            <motion.span
              className={styles.word}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{ duration: 0.9, delay: i * 0.06, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

/** Marco cuya foto se asoma desde abajo mientras el marco entra en pantalla (ligado al scroll). */
export function Peek({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 40%"] });
  const y = useTransform(scrollYProgress, [0, 1], ["42%", "0%"]);

  return (
    <div ref={ref} className={`${styles.peek} ${className ?? ""}`}>
      <motion.div className={styles.peekInner} style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Cola de gato dorada que se dibuja trazo a trazo con el scroll. Decorativa. */
export function Curl({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "end 45%"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <span ref={ref} className={`${styles.curl} ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 220 260">
        <motion.path
          d="M18 250 C 10 170, 40 92, 104 66 C 160 44, 206 78, 206 128 C 206 172, 170 196, 136 192 C 104 188, 88 160, 96 136 C 104 112, 132 104, 150 116 C 166 128, 164 150, 148 156"
          style={{ pathLength }}
        />
      </svg>
    </span>
  );
}
