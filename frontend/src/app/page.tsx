"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import styles from "./page.module.css";

const modules = [
  {
    icon: "🐾",
    name: "Adopciones",
    desc: "Encuentra a tu compañero ideal. Publica mascotas en adopción y conecta con familias amorosas.",
  },
  {
    icon: "🩺",
    name: "Directorio Médico",
    desc: "Busca veterinarios, clínicas y especialistas certificados cerca de ti.",
  },
  {
    icon: "📋",
    name: "Carnet Clínico",
    desc: "Historial médico completo de tu mascota: vacunas, diagnósticos, peso y tratamientos.",
  },
  {
    icon: "🛒",
    name: "Tienda",
    desc: "Alimento, juguetes y accesorios para consentir a tu mejor amigo.",
  },
  {
    icon: "💛",
    name: "Donaciones",
    desc: "Apoya refugios y causas animalistas con donaciones seguras y transparentes.",
  },
  {
    icon: "🔍",
    name: "Mascotas Perdidas",
    desc: "Reporta y encuentra mascotas perdidas en tu zona. Juntos los traemos de vuelta.",
  },
  {
    icon: "📍",
    name: "Sitios Petfriendly",
    desc: "Descubre restaurantes, parques y hoteles que reciben a tus mascotas.",
  },
  {
    icon: "🐕",
    name: "Paseadores",
    desc: "Conecta con paseadores de confianza para el ejercicio diario de tu mascota.",
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navbar__brand}>
          <span style={{ fontSize: "1.5rem" }}>🐱</span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: "1.1rem" }}>
            Michicondrias
          </span>
        </Link>
        <div className={styles.navbar__actions}>
          <Link href="/login" className="btn btn-secondary">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="btn btn-primary">
            Crear Cuenta
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <span className={styles.hero__emoji}>🐱</span>
        <h1 className={styles.hero__title}>
          <span className="gradient-text">Michicondrias</span>
        </h1>
        <p className={styles.hero__subtitle}>
          La súper-plataforma integral para el cuidado, adopción y bienestar de
          tus mascotas. Todo lo que necesitas, en un solo lugar.
        </p>
        <div className={styles.hero__actions}>
          <Link href="/register" className="btn btn-primary">
            Comenzar ahora
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* MODULES */}
      <section className={`${styles.modules} container`}>
        <div className={styles.modules__header}>
          <h2 className={styles.modules__title}>
            Nuestros <span className="gradient-text">Módulos</span>
          </h2>
          <p className={styles.modules__desc}>
            Cada aspecto del cuidado de tu mascota, cubierto profesionalmente.
          </p>
        </div>
        <div className={styles.modules__grid}>
          {modules.map((mod) => (
            <article key={mod.name} className={styles["module-card"]}>
              <span className={styles["module-card__icon"]}>{mod.icon}</span>
              <h3 className={styles["module-card__name"]}>{mod.name}</h3>
              <p className={styles["module-card__desc"]}>{mod.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Michicondrias — Hecho con 💜 para las mascotas de México.
      </footer>
    </>
  );
}
