"use client";

/**
 * Mis Mascotas (web). Misma lógica que `mobile/app/mascotas/index.tsx` (`usePets`), con composición de escritorio:
 * acción principal con texto en el hero, tarjetas con foto de portada o tabla comparable (`DataTable`).
 * Con muchas mascotas aparecen búsqueda, orden y filtro por especie; con pocas sobran y se ocultan.
 */
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat, Dog, LayoutGrid, PawPrint, Plus, Satellite, Table2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import SearchBar from "@/components/SearchBar";
import DataTable, { type Column } from "@/components/DataTable";
import { usePets } from "@/hooks/mascotas/usePets";
import type { Pet } from "@/types/mascotas";
import { capitalize, formatAge, formatWeight } from "@/utils/formatters";
import p from "@/features/mascotas/PetList.module.css";

type ViewMode = "cards" | "table";
type SpeciesFilter = "all" | "cat" | "dog";

/** A partir de cuántas mascotas valen la pena búsqueda, orden y filtro. */
const TOOLS_MIN = 5;

/** El backend guarda la especie en español ("perro"/"gato") o inglés ("dog"/"cat"). */
function speciesKind(species: string | null | undefined): SpeciesFilter | "other" {
  const v = (species || "").toLowerCase();
  if (v.startsWith("perr") || v === "dog" || v === "canine") return "dog";
  if (v.startsWith("gat") || v === "cat" || v === "feline") return "cat";
  return "other";
}

const SpeciesIcon = ({ pet, size }: { pet: Pet; size: number }) =>
  speciesKind(pet.species) === "dog" ? <Dog size={size} strokeWidth={1.5} aria-hidden /> : <Cat size={size} strokeWidth={1.5} aria-hidden />;

const summary = (pet: Pet) => [pet.breed || capitalize(pet.species), pet.age_months ? formatAge(pet.age_months) : null].filter(Boolean).join(" · ");

function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link href={`/mascotas/${pet.id}`} className={p.card}>
      <div className={p.cover}>
        {pet.photo_url ? (
          <Image src={pet.photo_url} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className={p.coverImg} />
        ) : (
          <SpeciesIcon pet={pet} size={56} />
        )}
        {pet.has_active_subscription && (
          <span className={p.tracker}><Satellite size={12} aria-hidden /> Tracker activo</span>
        )}
      </div>
      <div className={p.body}>
        <p className={p.name}>{pet.name}</p>
        <p className={p.meta}>{summary(pet)}</p>
      </div>
      <div className={p.foot}>
        <span>{capitalize(pet.species)}{pet.weight_kg ? ` · ${formatWeight(pet.weight_kg)}` : ""}</span>
        <span className={p.open} aria-hidden>Ver ficha →</span>
      </div>
    </Link>
  );
}

const COLUMNS: Column<Pet>[] = [
  {
    key: "name",
    header: "Mascota",
    primary: true,
    render: (pet) => (
      <span className={p.who}>
        <span className={p.avatar}>
          {pet.photo_url ? <Image src={pet.photo_url} alt="" width={40} height={40} className={p.avatarImg} /> : <SpeciesIcon pet={pet} size={20} />}
        </span>
        <strong>{pet.name}</strong>
      </span>
    ),
  },
  { key: "species", header: "Especie", render: (pet) => capitalize(pet.species) },
  { key: "breed", header: "Raza", render: (pet) => pet.breed || "—" },
  { key: "age", header: "Edad", render: (pet) => (pet.age_months ? formatAge(pet.age_months) : "—") },
  { key: "weight", header: "Peso", align: "right", render: (pet) => (pet.weight_kg ? formatWeight(pet.weight_kg) : "—") },
  {
    key: "tracker",
    header: "Michi-Tracker",
    render: (pet) => (pet.has_active_subscription ? <span className={p.pillOk}>Activo</span> : <span className={p.dim}>No</span>),
  },
];

export default function MascotasPage() {
  const { pets, isLoading, isEmpty } = usePets();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("cards");
  const [species, setSpecies] = useState<SpeciesFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"name" | "age" | "weight">("name");

  const showTools = pets.length >= TOOLS_MIN;

  // Base con la búsqueda aplicada: de aquí salen los conteos de los chips.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pets.filter((pet) => !q || `${pet.name} ${pet.breed || ""} ${pet.species}`.toLowerCase().includes(q));
  }, [pets, query]);

  const filtered = useMemo(() => {
    const base = searched.filter((pet) => species === "all" || speciesKind(pet.species) === species);
    const sorted = [...base];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else if (sort === "age") sorted.sort((a, b) => (a.age_months ?? 0) - (b.age_months ?? 0));
    else sorted.sort((a, b) => (a.weight_kg ?? 0) - (b.weight_kg ?? 0));
    return sorted;
  }, [searched, species, sort]);

  const counts = {
    all: searched.length,
    cat: searched.filter((pet) => speciesKind(pet.species) === "cat").length,
    dog: searched.filter((pet) => speciesKind(pet.species) === "dog").length,
  };
  const goToNew = () => router.push("/mascotas/nuevo");

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis mascotas"
        subtitle={isLoading || isEmpty ? undefined : `${pets.length} ${pets.length === 1 ? "mascota registrada" : "mascotas registradas"}`}
        showBack={false}
        rightElement={!isEmpty ? <Button label="Agregar mascota" variant="gold" fullWidth={false} icon={<Plus size={18} />} onPress={goToNew} /> : undefined}
      />

      {isLoading ? (
        <div className={p.grid}>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={280} borderRadius={20} />)}
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={<PawPrint size={28} />}
          title="Aún no tienes mascotas"
          subtitle="Agrega a tu gato o perro para llevar su carnet, sus citas y su tracker."
          actionLabel="Agregar mascota"
          onAction={goToNew}
        />
      ) : (
        <>
          <div className={p.toolbar}>
            {showTools && (
              <div className={p.search}>
                <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre o raza" />
              </div>
            )}
            {showTools && (
              <div className={p.chips} role="group" aria-label="Filtrar por especie">
                {([["all", "Todas", PawPrint], ["cat", "Gatos", Cat], ["dog", "Perros", Dog]] as const).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${p.chip} ${species === key ? p.chipOn : ""}`}
                    aria-pressed={species === key}
                    onClick={() => setSpecies(key)}
                  >
                    <Icon size={14} aria-hidden /> {label} <span className={p.chipCount}>{counts[key]}</span>
                  </button>
                ))}
              </div>
            )}
            <div className={p.toolbarEnd}>
              {showTools && (
                <label className={p.sort}>
                  Ordenar
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                    <option value="name">Nombre</option>
                    <option value="age">Edad</option>
                    <option value="weight">Peso</option>
                  </select>
                </label>
              )}
              <div className={p.views} role="group" aria-label="Forma de ver">
                <button type="button" className={`${p.viewBtn} ${view === "cards" ? p.viewOn : ""}`} aria-pressed={view === "cards"} onClick={() => setView("cards")}>
                  <LayoutGrid size={16} aria-hidden /> Tarjetas
                </button>
                <button type="button" className={`${p.viewBtn} ${view === "table" ? p.viewOn : ""}`} aria-pressed={view === "table"} onClick={() => setView("table")}>
                  <Table2 size={16} aria-hidden /> Tabla
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="Sin resultados"
              subtitle={query.trim() ? `Ninguna mascota coincide con «${query.trim()}».` : `No tienes ${species === "dog" ? "perros" : "gatos"} registrados.`}
              actionLabel="Ver todas"
              onAction={() => {
                setQuery("");
                setSpecies("all");
              }}
            />
          ) : view === "cards" ? (
            <div className={p.grid}>
              {filtered.map((pet) => <PetCard key={pet.id} pet={pet} />)}
            </div>
          ) : (
            <DataTable caption="Mis mascotas" columns={COLUMNS} rows={filtered} rowKey={(pet) => pet.id} rowHref={(pet) => `/mascotas/${pet.id}`} />
          )}
        </>
      )}
    </ScreenContainer>
  );
}
