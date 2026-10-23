"use client";

/**
 * Explorar — espejo de `mobile/app/(tabs)/explorar.tsx`. W4 porta el catálogo completo de servicios
 * (Salud / Servicios / Comunidad) y la entrada a búsqueda.
 */
import { Compass, Heart, Search, Stethoscope } from "lucide-react";
import Link from "next/link";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SectionHeader from "@/components/SectionHeader";
import s from "../pages.module.css";

const SECTIONS = [
  {
    title: "Salud",
    icon: Stethoscope,
    items: [
      { label: "Directorio veterinario", desc: "Clínicas y consultorios cerca de ti", href: "/directorio" },
      { label: "Carnet clínico", desc: "Vacunas, consultas y recordatorios", href: "/carnet" },
    ],
  },
  {
    title: "Servicios",
    icon: Heart,
    items: [
      { label: "Paseadores", desc: "Paseos y cuidado a domicilio", href: "/paseadores" },
      { label: "Cuidadores", desc: "Estancias y cuidado temporal", href: "/cuidadores" },
      { label: "Pet-friendly", desc: "Lugares que admiten mascotas", href: "/petfriendly" },
    ],
  },
  {
    title: "Comunidad",
    icon: Compass,
    items: [
      { label: "Adopciones", desc: "Encuentra o publica una mascota", href: "/adopciones" },
      { label: "Perdidas", desc: "Reportes y red de búsqueda", href: "/perdidas" },
      { label: "Donaciones", desc: "Apoya refugios y causas", href: "/donaciones" },
    ],
  },
];

export default function ExplorarPage() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Explorar" subtitle="Todo lo que ofrece Michicondrias" showBack={false} />
      <Link href="/busqueda" className={s.searchBar}>
        <Search size={18} aria-hidden />
        <span>Buscar mascotas, servicios o productos</span>
      </Link>

      {SECTIONS.map((section) => (
        <section key={section.title} className={s.section}>
          <SectionHeader title={section.title} icon={<section.icon size={18} />} />
          <div className={s.grid}>
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className={s.cardLink}>
                <div className={s.toolLink}>
                  <div>
                    <p className={s.cardTitle}>{item.label}</p>
                    <p className={s.cardDesc}>{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </ScreenContainer>
  );
}
