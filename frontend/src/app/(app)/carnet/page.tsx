"use client";

/**
 * Mis carnets — entrada al carnet clínico por mascota (la ficha real vive en `mascotas/[id]?tab=salud`).
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PawPrint, Syringe } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { usePets } from "@/hooks/mascotas/usePets";
import s from "../pages.module.css";

export default function CarnetPage() {
  const { pets, isLoading, isEmpty } = usePets();
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  return (
    <ScreenContainer>
      <ScreenHeader title="Carnet clínico" subtitle="Vacunas, consultas y recetas de tus mascotas" showBack={false} />

      {isLoading ? (
        <div className={s.toolGrid}>
          {[0, 1].map((i) => <Skeleton key={i} height={72} borderRadius={12} />)}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={<PawPrint size={28} />}
          title="Sin mascotas todavía"
          subtitle="Registra una mascota para abrir su carnet de salud."
          actionLabel="Agregar mascota"
          onAction={() => window.location.assign("/mascotas/nuevo")}
        />
      ) : (
        <div className={s.toolGrid}>
          {pets.map((pet) => (
            <Link key={pet.id} href={`/mascotas/${pet.id}?tab=salud`} className={s.toolLink}>
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
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{pet.name}</p>
                <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-sm)" }}>
                  {pet.breed || pet.species}
                </p>
              </div>
              <Syringe size={18} style={{ marginLeft: "auto", color: "var(--color-text-muted)" }} aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
