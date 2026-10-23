"use client";

// Rueda de funciones, adaptada de «works-wheel» (21st.dev) a CSS Modules y al scroll de la página.
//
// En reposo las funciones forman un anillo alrededor del nombre. Al bajar, el anillo se abre en un
// tambor vertical: la tarjeta del frente queda plana y a tamaño completo, y las vecinas giran en
// perspectiva hacia arriba y abajo. Seguir bajando lleva la siguiente función al frente.
//
// Todo depende de un número, `turn`: 0 es el anillo, 1 es el tambor con la primera función al frente
// y cada entero siguiente es una función más. A diferencia del original no atrapa la rueda del mouse:
// `turn` sale del avance del scroll dentro de una sección fija, así la página nunca se traba.
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { scrollToY } from "./smoothScroll";
import styles from "./FeatureWheel.module.css";

export interface WheelItem {
  title: string;
  text: string;
  image: string;
  alt: string;
}

/* Geometría (relativa al alto de la tarjeta, que a su vez se mide contra el escenario). */
const CARD_H = 0.4; // alto de la tarjeta del frente, respecto al escenario
const CARD_RATIO = 1.45; // ancho / alto
const STEP = 40; // grados entre tarjetas en el tambor
const DRUM = 2.22; // radio del tambor
const LENS = 2.7; // distancia de la perspectiva
const RING_R = 1.14; // radio del anillo
const BOW = 1.82; // radio del arco que lleva a las vecinas hacia la izquierda
const CULL = 1.6; // vecinas que se siguen dibujando a cada lado
const EASE = 0.12; // fracción de la distancia que se recorre por cuadro

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Cuánto se ha ido a la izquierda algo que giró `drumDeg` desde el frente. Cero al frente. */
const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)));

/** Anillo y tambor en una sola cadena: los términos del anillo desaparecen cuando `m` llega a 1. */
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

/** Escalera suave: la rueda se detiene en cada función y gira entre una y otra. */
function notch(x: number) {
  const n = Math.floor(x);
  const k = clamp((x - n - 0.2) / 0.6, 0, 1);
  return n + k * k * (3 - 2 * k);
}

/** Avance del scroll (0–1) → vueltas. Hay margen al inicio (anillo) y al final (última función). */
const LEAD = 0.35;
const TAIL = 0.45;
const toTurn = (p: number, count: number) => clamp(notch(p * (count + LEAD + TAIL) - LEAD), 0, count);
const toProgress = (turn: number, count: number) => (turn + LEAD) / (count + LEAD + TAIL);

export default function FeatureWheel({ items, label }: { items: WheelItem[]; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  // Solo `active` es estado: girar la rueda escribe transformaciones al DOM sin volver a renderizar.
  const turn = useRef(0);
  const target = useRef(0);
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const reduce = useReducedMotion();

  const count = items.length;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    target.current = toTurn(p, count);
  });

  useEffect(() => {
    target.current = toTurn(scrollYProgress.get(), count);
  }, [scrollYProgress, count]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = useMemo(() => {
    const { w, h } = stage;
    const maxW = w < 760 ? 0.8 : 0.34;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * maxW);
    const cardH = cardW / CARD_RATIO;
    // El anillo cabe en el escenario: no pasa del 36 % del alto (menú) ni del 36 % del ancho (móvil).
    const ringR = Math.min(cardH * RING_R, h * 0.36, w * 0.36);
    // Encoge las tarjetas del anillo para que se lea como un círculo cerrado.
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1;
    return { cardW, cardH, ringR, ringScale, drumR: cardH * DRUM, bow: cardH * BOW, depth: cardH * LENS };
  }, [stage, count]);

  // Un solo paso por cuadro: acercarse al objetivo y escribir todas las transformaciones.
  useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduce ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const card = cardRefs.current[i];
        if (!card) continue;
        card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m);
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        const face = card.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (infoRef.current) infoRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, count - 1);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, reduce]);

  /** Lleva el scroll al punto donde la función `i` queda al frente. */
  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + travel * toProgress(i + 1, count));
  };

  const current = items[active];

  return (
    <section className={styles.section} aria-labelledby="rueda-title">
      <div ref={trackRef} className={styles.track} style={{ "--count": count } as React.CSSProperties}>
        <div className={styles.sticky}>
          <div ref={stageRef} className={styles.stage} style={{ perspective: `${metrics.depth}px` }} aria-hidden>
            <div ref={wheelRef} className={styles.wheel}>
              {items.map((item, i) => (
                <div
                  key={item.title}
                  ref={(node) => {
                    cardRefs.current[i] = node;
                  }}
                  className={styles.card}
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className={styles.face}>
                    <Image src={item.image} alt="" fill sizes="(max-width: 760px) 80vw, 34vw" className={styles.img} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p ref={labelRef} id="rueda-title" className={styles.ringLabel}>
            {label}
          </p>

          <div ref={infoRef} className={styles.info} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className={styles.title}>{current.title}</h3>
                <p className={styles.text}>{current.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <ol className={styles.index} aria-label="Funciones">
            {items.map((item, i) => (
              <li key={item.title}>
                <button type="button" onClick={() => goTo(i)} data-active={i === active} aria-current={i === active}>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
