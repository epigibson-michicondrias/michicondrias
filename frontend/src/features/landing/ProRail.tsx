"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowUpRight,
  Car,
  Coffee,
  FlaskConical,
  Flower2,
  Footprints,
  HeartHandshake,
  Megaphone,
  Scissors,
  ShieldCheck,
  Stethoscope,
  Store,
  type LucideIcon,
} from "lucide-react";
import shared from "./landing.module.css";
import { Rise } from "./effects";
import { REGISTER_URL } from "./links";
import styles from "./ProRail.module.css";

/** Oficios con sus herramientas reales (mobile/src/constants/roleTools.ts). */
const ROLES: { icon: LucideIcon; title: string; tools: string[]; photo?: string }[] = [
  { icon: Stethoscope, title: "Veterinarios y clínicas", tools: ["Agenda y citas", "Expediente de pacientes", "Recetas y cirugías", "Videoconsultas"], photo: "/landing/pro-veterinarios.webp" },
  { icon: Scissors, title: "Estilistas y entrenadores", tools: ["Catálogo de servicios", "Agenda de citas", "Cursos y alumnos"], photo: "/landing/pro-estilistas.webp" },
  { icon: HeartHandshake, title: "Refugios y hogares temporales", tools: ["Publicar en adopción", "Revisar postulaciones", "Recibir donaciones"], photo: "/landing/pro-refugios.webp" },
  { icon: Footprints, title: "Paseadores y cuidadores", tools: ["Solicitudes entrantes", "Calendario", "Tarifas y zonas"], photo: "/landing/pro-paseadores.webp" },
  { icon: Store, title: "Tiendas", tools: ["Catálogo de productos", "Pedidos con pago en línea", "Analíticas de ventas"], photo: "/landing/pro-tiendas.webp" },
  { icon: Coffee, title: "Lugares pet-friendly", tools: ["Ficha de tu local", "Cupones", "Reseñas de clientes"], photo: "/landing/pro-petfriendly.webp" },
  { icon: FlaskConical, title: "Laboratorios", tools: ["Órdenes de estudio", "Registro de resultados"], photo: "/landing/pro-laboratorios.webp" },
  { icon: Car, title: "Transporte de mascotas", tools: ["Solicitudes de viaje", "Perfil de conductor", "Historial de viajes"] },
  { icon: ShieldCheck, title: "Aseguradoras", tools: ["Planes y pólizas", "Cotizaciones", "Atención de reclamos"], photo: "/landing/pro-aseguradoras.webp" },
  { icon: Flower2, title: "Funerarias", tools: ["Paquetes de servicio", "Reservas", "Memoriales y certificados"], photo: "/landing/pro-funerarias.webp" },
  { icon: Megaphone, title: "Patrocinadores", tools: ["Campañas", "Impulso de alertas de perdidas", "Estadísticas de impacto"], photo: "/landing/pro-patrocinadores.webp" },
];

/**
 * En escritorio el scroll vertical desplaza el carril hacia la izquierda mientras la sección queda fija.
 * En móvil o con movimiento reducido es un carril normal con scroll horizontal.
 */
export default function ProRail() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const distance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distance.get());

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const desktop = window.matchMedia("(min-width: 961px)");
    const measure = () => distance.set(desktop.matches ? Math.max(0, rail.scrollWidth - rail.clientWidth) : 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [distance]);

  return (
    <section id="profesionales" className={styles.section} aria-labelledby="pro-title" data-static={!!reduce}>
      <div ref={trackRef} className={styles.track}>
        <div className={styles.sticky}>
          <div className={`${shared.container} ${styles.head}`}>
            <Rise id="pro-title" text="¿Trabajas con mascotas?" className={shared.sectionTitle} />
            <p className={shared.sectionLead}>
              Verifica tu identidad una vez y recibe las herramientas de tu oficio. Tus clientes ya te buscan en la app.
            </p>
          </div>

          <div className={styles.viewport}>
            <motion.ul ref={railRef} className={styles.rail} style={reduce ? undefined : { x }}>
              {ROLES.map((role) => (
                <li key={role.title} className={styles.card} data-photo={!!role.photo}>
                  {role.photo ? (
                    <div className={styles.cardPhoto}>
                      <Image src={role.photo} alt="" fill sizes="22rem" className={styles.cardImg} />
                    </div>
                  ) : (
                    <role.icon size={30} strokeWidth={1.25} className={styles.cardIcon} aria-hidden />
                  )}
                  <h3 className={styles.cardTitle}>{role.title}</h3>
                  <ul className={styles.tools}>
                    {role.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className={`${styles.card} ${styles.cardCta}`}>
                <div className={styles.cardPhoto}>
                  <Image src="/landing/pro-unete.webp" alt="" fill sizes="22rem" className={styles.cardImg} />
                </div>
                <h3 className={styles.cardTitle}>Únete como profesional</h3>
                <p className={styles.ctaText}>Crea tu cuenta y envía tu verificación desde tu perfil.</p>
                <Link href={REGISTER_URL} className={styles.ctaLink}>
                  Crear cuenta
                  <span className={styles.ctaIcon} aria-hidden>
                    <ArrowUpRight size={18} strokeWidth={2} />
                  </span>
                </Link>
              </li>
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
}
