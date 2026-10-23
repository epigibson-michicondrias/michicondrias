"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { BellRing, Cat, Download, FileHeart, ShoppingBag, Sparkles, Stethoscope } from "lucide-react";
import shared from "./landing.module.css";
import { REGISTER_URL } from "./links";
import styles from "./AppSection.module.css";
import { Rise } from "./effects";

/** Enlace de descarga real (APK o tienda). Sin él no se muestra el botón: nada de promesas de tiendas que no existen. */
const DOWNLOAD_URL = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL;

const TILES = [
  { icon: FileHeart, label: "Carnet" },
  { icon: Stethoscope, label: "Citas" },
  { icon: ShoppingBag, label: "Tienda" },
  { icon: Sparkles, label: "Michi-IA" },
];

export default function AppSection() {
  const ref = useRef<HTMLDivElement>(null);
  // El teléfono llega inclinado y se endereza mientras la sección entra en pantalla.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <section id="app" className={styles.section} aria-labelledby="app-title">
      <div ref={ref} className={`${shared.container} ${styles.grid}`}>
        <div className={styles.copy}>
          <Rise id="app-title" text="Tu mascota, en tu bolsillo" className={shared.sectionTitle} />
          <p className={shared.sectionLead}>
            La misma cuenta en la web y en la app. Recibe sus recordatorios, agenda citas y pide ayuda desde donde estés.
          </p>
          <div className={styles.ctas}>
            {DOWNLOAD_URL && (
              <a href={DOWNLOAD_URL} className={`${shared.btn} ${shared.btnGold}`}>
                <Download size={18} strokeWidth={2} /> Descargar la app
              </a>
            )}
            <Link href={REGISTER_URL} className={`${shared.btn} ${DOWNLOAD_URL ? shared.btnGhost : shared.btnGold}`}>
              Crear cuenta gratis
            </Link>
          </div>
        </div>

        <motion.div className={styles.phone} style={{ rotate, y }} aria-hidden>
          <div className={styles.notch} />
          <div className={styles.screen}>
            <p className={styles.hello}>Hola, Ana</p>
            <p className={styles.helloSub}>¿Cómo está Luna hoy?</p>

            <div className={styles.pet}>
              <span className={styles.petAvatar}>
                <Cat size={22} strokeWidth={1.5} />
              </span>
              <div>
                <p className={styles.petName}>Luna</p>
                <p className={styles.petMeta}>4.2 kg, vacunas al día</p>
              </div>
            </div>

            <div className={styles.tiles}>
              {TILES.map(({ icon: Icon, label }) => (
                <div key={label} className={styles.tile}>
                  <Icon size={20} strokeWidth={1.6} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className={styles.notice}>
              <BellRing size={16} strokeWidth={1.75} />
              <span>Mañana toca desparasitar a Luna</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
