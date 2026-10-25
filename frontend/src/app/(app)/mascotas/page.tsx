"use client";

/**
 * Mis Mascotas — espejo de `mobile/app/mascotas/index.tsx` (cuadrícula o lista). Con muchas mascotas aparecen
 * búsqueda, orden y filtro por especie; con pocas sobran y se ocultan.
 */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat, Dog, LayoutGrid, List, PawPrint, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import SearchBar from "@/components/SearchBar";
import { usePets } from "@/hooks/mascotas/usePets";
import type { Pet } from "@/types/mascotas";
import { formatAge, formatWeight, getGenderLabel } from "@/utils/formatters";
import s from "./mascotas.module.css";

type ViewMode = "grid" | "list";
type SpeciesFilter = "all" | "dog" | "cat";

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "grid", label: "Cuadrícula", icon: LayoutGrid },
  { mode: "list", label: "Lista", icon: List },
];

/** El backend guarda la especie en español ("perro"/"gato") o inglés ("dog"/"cat"). */
function speciesKind(species: string | null | undefined): SpeciesFilter | "other" {
  const v = (species || "").toLowerCase();
  if (v.startsWith("perr") || v === "dog" || v === "canine") return "dog";
  if (v.startsWith("gat") || v === "cat" || v === "feline") return "cat";
  return "other";
}

/** A partir de cuántas mascotas valen la pena búsqueda, orden y filtro. */
const TOOLS_MIN = 5;

function PetPhoto({ pet, size, ring }: { pet: Pet; size: number; ring?: boolean }) {
  const cls = ring ? `${s.petPhoto} ${s.photoRing}` : s.petPhoto;
  if (pet.photo_url) {
    return (
      <Image
        src={pet.photo_url}
        alt={pet.name}
        width={size}
        height={size}
        className={cls}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className={`${s.petPhotoFallback} ${ring ? s.photoRing : ""}`} style={{ width: size, height: size }}>
      <PawPrint size={Math.round(size * 0.4)} aria-hidden />
    </div>
  );
}

/** Foto + badge del tracker encima. */
function PetAvatar({ pet, size, ring }: { pet: Pet; size: number; ring?: boolean }) {
  return (
    <div className={s.photoWrap}>
      <PetPhoto pet={pet} size={size} ring={ring} />
      {pet.has_active_subscription && (
        <span className={s.trackerBadge} title="Michi-Tracker activo">
          <PawPrint size={10} aria-hidden /> Tracker
        </span>
      )}
    </div>
  );
}

export default function MascotasPage() {
  const { pets, isLoading, isEmpty, refetch } = usePets();
  const [view, setView] = useState<ViewMode>("grid");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "age" | "weight">("name");
  const router = useRouter();

  // Base con la búsqueda aplicada (sin el filtro de especie): de aquí salen los conteos de los chips.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pets.filter(
      (p) => !q || `${p.name} ${p.breed || ""} ${p.species}`.toLowerCase().includes(q),
    );
  }, [pets, query]);

  const filtered = useMemo(() => {
    const base = searched.filter((p) => species === "all" || speciesKind(p.species) === species);
    const sorted = [...base];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else if (sort === "age") sorted.sort((a, b) => (a.age_months ?? 0) - (b.age_months ?? 0));
    else sorted.sort((a, b) => (a.weight_kg ?? 0) - (b.weight_kg ?? 0));
    return sorted;
  }, [searched, species, sort]);

  // Conteos facetados: reflejan la búsqueda, para que cada chip diga cuántas verías al pulsarlo.
  const dogCount = searched.filter((p) => speciesKind(p.species) === "dog").length;
  const catCount = searched.filter((p) => speciesKind(p.species) === "cat").length;
  const showTools = pets.length >= TOOLS_MIN;

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
        // Vacío con ilustración: más cariño que un ícono suelto.
        <div className={s.emptyWrap}>
          <div className={s.emptyArt} aria-hidden>
            <PawPrint size={56} strokeWidth={1.5} />
          </div>
          <EmptyState
            icon={<PawPrint size={28} />}
            title="Aún no tienes mascotas"
            subtitle="Agrega a tu gato o perro para llevar su carnet, sus citas y su tracker."
            actionLabel="Agregar mascota"
            onAction={() => router.push("/mascotas/nuevo")}
          />
        </div>
      ) : (
        <>
          {showTools && (
            <div className={s.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre, raza…" />
            </div>
          )}

          <div className={s.toolbar}>
            <p className={s.count}>
              {filtered.length} {filtered.length === 1 ? "mascota" : "mascotas"}
            </p>
            {showTools && (
            <div className={s.sortWrap}>
              <label className={s.sortLabel} htmlFor="pet-sort">Ordenar</label>
              <select
                id="pet-sort"
                className={s.sortSelect}
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                <option value="name">Nombre</option>
                <option value="age">Edad</option>
                <option value="weight">Peso</option>
              </select>
            </div>
            )}
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

          {/* Filtro por especie (gatos primero) */}
          {showTools && (
            <div className={s.speciesFilter} role="group" aria-label="Filtrar por especie">
              <button
                type="button"
                className={`${s.speciesChip} ${species === "all" ? s.speciesChipActive : ""}`}
                onClick={() => setSpecies("all")}
                aria-pressed={species === "all"}
              >
                <PawPrint size={14} aria-hidden /> Todos · {searched.length}
              </button>
              <button
                type="button"
                className={`${s.speciesChip} ${species === "cat" ? s.speciesChipActive : ""}`}
                onClick={() => setSpecies("cat")}
                aria-pressed={species === "cat"}
              >
                <Cat size={14} aria-hidden /> Gatos · {catCount}
              </button>
              <button
                type="button"
                className={`${s.speciesChip} ${species === "dog" ? s.speciesChipActive : ""}`}
                onClick={() => setSpecies("dog")}
                aria-pressed={species === "dog"}
              >
                <Dog size={14} aria-hidden /> Perros · {dogCount}
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="Sin resultados"
              subtitle={
                query.trim()
                  ? `Ninguna mascota coincide con «${query.trim()}».`
                  : `No tienes ${species === "dog" ? "perros" : "gatos"} registrados.`
              }
              actionLabel="Ver todas"
              onAction={() => {
                setQuery("");
                setSpecies("all");
              }}
            />
          ) : (
            <div className={view === "list" ? s.list : s.grid}>
              {filtered.map((pet) =>
                view === "list" ? (
                  <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.listRow}>
                    <PetAvatar pet={pet} size={52} />
                    <div className={s.listBody}>
                      <p className={s.petName}>{pet.name}</p>
                      <p className={s.petMeta}>
                        {[pet.breed, pet.age_months ? formatAge(pet.age_months) : null].filter(Boolean).join(" · ")}
                      </p>
                      <p className={s.petMetaSm}>
                        {[getGenderLabel(pet.gender), pet.weight_kg ? formatWeight(pet.weight_kg) : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.gridCard}>
                    <PetAvatar pet={pet} size={96} />
                    <p className={s.petName}>{pet.name}</p>
                    <p className={s.petMeta}>
                      {[pet.breed, pet.age_months ? formatAge(pet.age_months) : null].filter(Boolean).join(" · ")}
                    </p>
                  </Link>
                ),
              )}
            </div>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
