"use client";

/**
 * Mis Mascotas — espejo de `mobile/app/mascotas/index.tsx`, con las mejoras visuales de la web:
 * filtro por especie, foto con anillo de acento, badge del tracker, meta al hover y vacío ilustrado.
 */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cat,
  Dog,
  GalleryVertical,
  LayoutGrid,
  List,
  PawPrint,
  Plus,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import SearchBar from "@/components/SearchBar";
import { usePets } from "@/hooks/mascotas/usePets";
import type { Pet } from "@/types/mascotas";
import s from "./mascotas.module.css";

type ViewMode = "grid" | "list" | "cards";
type SpeciesFilter = "all" | "dog" | "cat";

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "grid", label: "Cuadrícula", icon: LayoutGrid },
  { mode: "list", label: "Lista", icon: List },
  { mode: "cards", label: "Tarjetas", icon: GalleryVertical },
];

/** El backend guarda la especie en español ("perro"/"gato") o inglés ("dog"/"cat"). */
function speciesKind(species: string | null | undefined): SpeciesFilter | "other" {
  const v = (species || "").toLowerCase();
  if (v.startsWith("perr") || v === "dog" || v === "canine") return "dog";
  if (v.startsWith("gat") || v === "cat" || v === "feline") return "cat";
  return "other";
}

function formatAge(months: number | null): string {
  if (months == null || months < 0) return "—";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

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
            subtitle="Agrega a tu perro o gato para llevar su control, carnet y tracker."
            actionLabel="Agregar mascota"
            onAction={() => router.push("/mascotas/nuevo")}
          />
        </div>
      ) : (
        <>
          <div className={s.searchWrap}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre, raza…" />
          </div>

          <div className={s.toolbar}>
            <p className={s.count}>
              {filtered.length} {filtered.length === 1 ? "mascota" : "mascotas"}
            </p>
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

          {/* Filtro por especie */}
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
              className={`${s.speciesChip} ${species === "dog" ? s.speciesChipActive : ""}`}
              onClick={() => setSpecies("dog")}
              aria-pressed={species === "dog"}
            >
              <Dog size={14} aria-hidden /> Perros · {dogCount}
            </button>
            <button
              type="button"
              className={`${s.speciesChip} ${species === "cat" ? s.speciesChipActive : ""}`}
              onClick={() => setSpecies("cat")}
              aria-pressed={species === "cat"}
            >
              <Cat size={14} aria-hidden /> Gatos · {catCount}
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="Sin resultados"
              subtitle={`No tienes ${species === "dog" ? "perros" : "gatos"} registrados.`}
              actionLabel="Ver todos"
              onAction={() => setSpecies("all")}
            />
          ) : (
            <div className={view === "list" ? s.list : view === "cards" ? s.cards : s.grid}>
              {filtered.map((pet) =>
                view === "list" ? (
                  <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.listRow}>
                    <PetAvatar pet={pet} size={52} />
                    <div className={s.listBody}>
                      <p className={s.petName}>{pet.name}</p>
                      <p className={s.petMeta}>
                        {[pet.breed, formatAge(pet.age_months)].filter(Boolean).join(" · ")}
                      </p>
                      <p className={s.petMetaSm}>
                        {[pet.gender, pet.weight_kg ? `${pet.weight_kg} kg` : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </Link>
                ) : view === "cards" ? (
                  <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.detailCard}>
                    <PetAvatar pet={pet} size={170} ring />
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
                  // Grid: meta compacta al hover
                  <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.gridCard}>
                    <PetAvatar pet={pet} size={96} />
                    <p className={s.petName}>{pet.name}</p>
                    <p className={s.petMeta}>
                      {[pet.breed, formatAge(pet.age_months)].filter(Boolean).join(" · ")}
                    </p>
                    <div className={s.hoverMeta} aria-hidden>
                      {[pet.species, pet.weight_kg ? `${pet.weight_kg} kg` : null, formatAge(pet.age_months)]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </Link>
                ),
              )}
              {/* Tile de alta: siempre visible en la rejilla */}
              {(view === "grid" || view === "cards") && (
                <button
                  type="button"
                  className={s.addTile}
                  onClick={() => router.push("/mascotas/nuevo")}
                  aria-label="Agregar mascota"
                >
                  <Plus size={28} />
                  <span>Agregar mascota</span>
                </button>
              )}
            </div>
          )}

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
