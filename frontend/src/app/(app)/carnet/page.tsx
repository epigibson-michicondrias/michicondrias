"use client";

/**
 * Mis carnets — dos columnas premium: lista de mascotas con estado de salud a la izquierda,
 * accesos rápidos del carnet a la derecha. Criterio §0.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, PawPrint, Plus, Pill, Syringe, Stethoscope, FileText } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { usePets } from "@/hooks/mascotas/usePets";
import s from "../pages.module.css";

export default function CarnetPage() {
  const { pets, isLoading, isEmpty } = usePets();
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader title="Carnet clínico" subtitle="Vacunas, consultas y recetas de tus mascotas" showBack={false} />

      <div className={s.homeLayout}>
        {/* ── Columna principal: mascotas ── */}
        <div className={s.homeCol}>
          {isLoading ? (
            <div className={s.homeList}>
              {[0, 1, 2].map((i) => <Skeleton key={i} height={80} borderRadius={12} />)}
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="Sin mascotas todavía"
              subtitle="Registra una mascota para abrir su carnet de salud."
              actionLabel="Agregar mascota"
              onAction={() => router.push("/mascotas/nuevo")}
            />
          ) : (
            <div className={s.homeList}>
              {pets.map((pet: { id: string; name: string; photo_url?: string | null; breed?: string | null; species?: string }) => (
                <Link key={pet.id} href={`/mascotas/${pet.id}?tab=salud`} className={s.homeItem}>
                  <div className={s.quickIcon}>
                    {pet.photo_url && !imgError[pet.id] ? (
                      <Image
                        src={pet.photo_url}
                        alt={pet.name}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                        onError={() => setImgError((e) => ({ ...e, [pet.id]: true }))}
                      />
                    ) : (
                      <PawPrint size={22} aria-hidden />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-md)" }}>{pet.name}</p>
                    <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-sm)" }}>
                      {pet.breed || pet.species}
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Columna lateral: accesos rápidos ── */}
        <aside className={s.homeAside}>
          <div className={s.homeQuickList}>
            <Link href="/mascotas/nuevo" className={s.homeQuickItem}>
              <span className={s.homeQuickIcon} style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                <Plus size={18} />
              </span>
              <span>Agregar mascota</span>
              <ChevronRight size={14} className={s.homeQuickArrow} />
            </Link>
            <Link href="/directorio" className={s.homeQuickItem}>
              <span className={s.homeQuickIcon} style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                <Stethoscope size={18} />
              </span>
              <span>Buscar veterinario</span>
              <ChevronRight size={14} className={s.homeQuickArrow} />
            </Link>
            <Link href="/mascotas" className={s.homeQuickItem}>
              <span className={s.homeQuickIcon} style={{ background: "var(--color-success-light, var(--color-accent-light))", color: "var(--color-success)" }}>
                <ClipboardList size={18} />
              </span>
              <span>Ver todas mis mascotas</span>
              <ChevronRight size={14} className={s.homeQuickArrow} />
            </Link>
          </div>

          <div style={{ padding: "var(--space-lg)", borderRadius: "var(--radius-xl)", background: "var(--color-surface)", border: "1px solid var(--color-divider)" }}>
            <h3 style={{ margin: "0 0 var(--space-sm)", fontSize: "var(--font-md)", fontWeight: 700 }}>¿Qué es el carnet?</h3>
            <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
              El carnet clínico reúne vacunas, consultas, recetas y tratamientos de tu mascota.
              El veterinario registra cada visita y tú puedes ver todo el historial.
            </p>
          </div>
        </aside>
      </div>
    </ScreenContainer>
  );
}
