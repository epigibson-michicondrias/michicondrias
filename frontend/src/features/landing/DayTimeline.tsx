"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import shared from "./landing.module.css";
import styles from "./DayTimeline.module.css";
import { Peek, Rise } from "./effects";

/** Un día cualquiera, hora por hora, con la función de la app que lo acompaña. */
const HOURS = [
  { time: "07:00", title: "Desayuno", text: "Su plan de dieta te dice cuánto servir hoy.", photo: "/landing/expediente.webp", tone: "navy" },
  { time: "09:30", title: "Recordatorio", text: "Toca la vacuna de la rabia. La cita ya está en tu agenda.", photo: "/landing/veterinario.webp", tone: "gold" },
  { time: "12:00", title: "Hora de jugar", text: "Llegó el juguete de plumas que pediste en la tienda.", photo: "/landing/consientelo.webp", tone: "blue" },
  { time: "14:00", title: "Videoconsulta", text: "¿Estornuda mucho? Lo revisa su veterinaria por video.", photo: "/landing/pro-veterinarios.webp", tone: "surface" },
  { time: "17:30", title: "Estética", text: "Baño y cepillado con su estilista de siempre.", photo: "/landing/pro-estilistas.webp", tone: "gold" },
  { time: "21:00", title: "Paseo nocturno", text: "Michi-Tracker Pro te muestra en qué azotea anda.", photo: "/landing/perdido.webp", tone: "navy" },
] as const;

/** Color del cielo a lo largo del día: madrugada, mañana, mediodía, tarde, atardecer y noche. */
const SKY = ["#1c2f6b", "#e9b872", "#8fb3e0", "#e9c883", "#c9784a", "#101525"];

export default function DayTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const travel = useMotionValue(0);
  const skyW = useMotionValue(0);
  const skyH = useMotionValue(0);
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const x = useTransform(() => -p.get() * travel.get());
  const sky = useTransform(p, SKY.map((_, i) => i / (SKY.length - 1)), SKY);
  // El sol entra por la izquierda, sube en arco y se pone antes de la noche.
  const sunX = useTransform(() => skyW.get() * 0.06 + p.get() * skyW.get() * 0.82);
  const sunY = useTransform(() => {
    const t = Math.min(1, p.get() / 0.82);
    return skyH.get() + 8 - Math.sin(Math.PI * t) * skyH.get() * 0.85;
  });

  useEffect(() => {
    const rail = railRef.current;
    const skyEl = skyRef.current;
    if (!rail || !skyEl) return;
    const measure = () => {
      travel.set(Math.max(0, rail.scrollWidth - rail.clientWidth));
      skyW.set(skyEl.clientWidth);
      skyH.set(skyEl.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    ro.observe(skyEl);
    return () => ro.disconnect();
  }, [travel, skyW, skyH]);

  return (
    <section ref={sectionRef} className={styles.section} data-static={!!reduce} aria-labelledby="dia-title">
      <div className={styles.sticky}>
        <div className={`${shared.container} ${styles.head}`}>
          <Rise id="dia-title" text="Un día con tu mascota" className={shared.sectionTitle} />
          <p className={shared.sectionLead}>Lo que pasa de la mañana a la noche, y la parte de la app que te ayuda.</p>
        </div>

        <div className={styles.frame}>
          <motion.div ref={skyRef} className={styles.sky} style={reduce ? undefined : { backgroundColor: sky }} aria-hidden>
            <motion.span className={styles.sun} style={reduce ? undefined : { x: sunX, y: sunY }} />
          </motion.div>

          <div ref={railRef} className={styles.viewport}>
            <motion.ol className={styles.rail} style={reduce ? undefined : { x }}>
              {HOURS.map((h) => (
                <li key={h.time} className={styles.card} data-tone={h.tone}>
                  <div className={styles.cardHead}>
                    <p className={styles.time}>{h.time}</p>
                    <h3 className={styles.title}>{h.title}</h3>
                    <p className={styles.text}>{h.text}</p>
                  </div>
                  <Peek className={styles.photo}>
                    <Image src={h.photo} alt="" fill sizes="22rem" className={styles.img} />
                  </Peek>
                </li>
              ))}
            </motion.ol>
          </div>
        </div>
      </div>
    </section>
  );
}
