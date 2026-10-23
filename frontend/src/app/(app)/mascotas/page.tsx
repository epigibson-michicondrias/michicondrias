"use client";

/**
 * Mis Mascotas — espejo de `mobile/app/mascotas/index.tsx`. Lista con 3 modos de vista,
 * vacío con una sola acción y carga con esqueleto.
 */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GalleryVertical, LayoutGrid, List, PawPrint, Plus, Settings2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import { usePets } from "@/hooks/mascotas/usePets";
import type { Pet } from "@/types/mascotas";
import s from "./mascotas.module.css";

type ViewMode = "grid" | "list" | "cards";

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "grid", label: "Cuadrícula", icon: LayoutGrid },
  { mode: "list", label: "Lista", icon: List },
  { mode: "cards", label: "Tarjetas", icon: GalleryVertical },
];

function formatAge(months: number | null): string {
  if (months == null || months < 0) return "—";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

function PetPhoto({ pet, size }: { pet: Pet; size: number }) {
  if (pet.photo_url) {
    return (
      <Image
        src={pet.photo_url}
        alt={pet.name}
        width={size}
        height={size}
        className={s.petPhoto}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className={s.petPhotoFallback} style={{ width: size, height: size }}>
      <PawPrint size={Math.round(size * 0.4)} aria-hidden />
    </div>
  );
}

export default function MascotasPage() {
  const { pets, isLoading, isEmpty, refetch } = usePets();
  const [view, setView] = useState<ViewMode>("grid");
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis Mascotas"
        showBack={false}
        actionIcon={Plus}
        actionLabel="Agregar mascota"
        onAction={() => router.push("/mascotas/nuevo")}
      />

      {isLoading ? (
        <div className={s.grid}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={180} borderRadius={16} />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={<PawPrint size={28} />}
          title="Aún no tienes mascotas"
          subtitle="Agrega a tu perro o gato para llevar su control, carnet y tracker."
          actionLabel="Agregar mascota"
          onAction={() => router.push("/mascotas/nuevo")}
        />
      ) : (
        <>
          <div className={s.toolbar}>
            <p className={s.count}>
              {pets.length} {pets.length === 1 ? "mascota" : "mascotas"}
            </p>
            <div className={s.viewToggle} role="group" aria-label="Modo de vista">
              {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  className={`${s.viewBtn} ${view === mode ? s.viewBtnActive : ""}`}
                  onClick={() => setView(mode)}
                  aria-label={`Ver en ${label.toLowerCase()}`}
                  aria-pressed={view === mode}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className={view === "list" ? s.list : view === "cards" ? s.cards : s.grid}>
            {pets.map((pet) =>
              view === "list" ? (
                <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.listRow}>
                  <PetPhoto pet={pet} size={52} />
                  <div className={s.listBody}>
                    <p className={s.petName}>{pet.name}</p>
                    <p className={s.petMeta}>
                      {[pet.breed, formatAge(pet.age_months)].filter(Boolean).join(" · ")}
                    </p>
                    <p className={s.petMetaSm}>
                      {[pet.gender, pet.weight_kg ? `${pet.weight_kg} kg` : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {pet.has_active_subscription && <span className={s.trackerDot} title="Michi-Tracker activo" />}
                </Link>
              ) : view === "cards" ? (
                <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.detailCard}>
                  <PetPhoto pet={pet} size={170} />
                  <div className={s.detailBody}>
                    <p className={s.petName}>{pet.name}</p>
                    <p className={s.petMeta}>{pet.breed || pet.species}</p>
                    <dl className={s.stats}>
                      <div><dt>Especie</dt><dd>{pet.species}</dd></div>
                      <div><dt>Género</dt><dd>{pet.gender || "—"}</dd></div>
                      <div><dt>Edad</dt><dd>{formatAge(pet.age_months)}</dd></div>
                      <div><dt>Peso</dt><dd>{pet.weight_kg ? `${pet.weight_kg} kg` : "—"}</dd></div>
                    </dl>
                    <p className={s.cardFooter}>
                      {pet.has_active_subscription ? "Michi-Tracker Pro activo" : "Ver ficha, carnet y salud"}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.gridCard}>
                  <PetPhoto pet={pet} size={96} />
                  <p className={s.petName}>{pet.name}</p>
                  <p className={s.petMeta}>
                    {[pet.breed, formatAge(pet.age_months)].filter(Boolean).join(" · ")}
                  </p>
                  {pet.has_active_subscription && <span className={s.trackerDot} title="Michi-Tracker activo" />}
                </Link>
              ),
            )}
          </div>

          {view === "cards" && (
            <Button
              label="Agregar mascota"
              variant="secondary"
              icon={<Plus size={18} />}
              onPress={() => router.push("/mascotas/nuevo")}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}
