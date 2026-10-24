"use client";

/**
 * Mascotas (`/admin/mascotas`): todas las mascotas registradas con búsqueda; fila → expediente de la mascota.
 * Espejo de `mobile/app/admin/mascotas/index.tsx`.
 */
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cat, Dog, PawPrint } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useAdminPets, type Pet } from "@/hooks/admin/useAdminPets";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/admin/admin.module.css";

function speciesInfo(species: string) {
  const key = species.trim().toLowerCase();
  if (key === "gato") return { label: "Gato", icon: Cat, color: "var(--color-accent)" };
  if (key === "perro") return { label: "Perro", icon: Dog, color: "var(--color-info)" };
  return { label: species ? species.charAt(0).toUpperCase() + species.slice(1) : "Otra", icon: PawPrint, color: "var(--color-primary)" };
}

function PetThumb({ pet }: { pet: Pet }) {
  const sp = speciesInfo(pet.species);
  if (pet.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element -- foto del storage
    return <img src={getS3Url(pet.photo_url)} alt="" className={s.thumb} />;
  }
  const IconC = sp.icon;
  return (
    <span className={s.thumb} style={{ "--c": sp.color } as CSSProperties} aria-hidden>
      <IconC size={20} />
    </span>
  );
}

export default function AdminMascotasPage() {
  const router = useRouter();
  const m = useAdminPets();
  const searching = !!m.searchText.trim();

  return (
    <ScreenContainer>
      <ScreenHeader title="Mascotas" subtitle={`${m.total} registradas · ${m.vaccinatedCount} vacunadas`} />

      <div className={s.toolbar}>
        <SearchBar value={m.searchText} onChangeText={m.setSearchText} placeholder="Buscar por nombre, especie, raza o dueño (p. ej. Michi, gato)..." />
      </div>

      {m.isLoading ? (
        <SkeletonList count={6} />
      ) : m.mascotas.length === 0 ? (
        <EmptyState
          icon={<Cat size={28} />}
          title={searching ? "Sin resultados" : "Aún no hay mascotas"}
          subtitle={searching ? "Ninguna mascota coincide con la búsqueda." : "Los gatos, perros y demás mascotas que registren los usuarios aparecerán aquí."}
          actionLabel={searching ? "Quitar búsqueda" : undefined}
          onAction={searching ? () => m.setSearchText("") : undefined}
        />
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Especie</th>
                <th>Dueño</th>
                <th>Vacunas</th>
              </tr>
            </thead>
            <tbody>
              {m.mascotas.map((pet) => {
                const sp = speciesInfo(pet.species);
                const href = `/mascotas/${pet.id}`;
                return (
                  <tr key={pet.id} className={s.rowLink} onClick={() => router.push(href)}>
                    <td>
                      <div className={s.who}>
                        <PetThumb pet={pet} />
                        <div className={s.cellMain}>
                          <Link href={href} className={`${s.cellTitle} ${s.cellLink}`} onClick={(e) => e.stopPropagation()}>
                            {pet.name}
                          </Link>
                          {pet.gender ? <span className={s.cellSub}>{pet.gender.toLowerCase() === "hembra" ? "Hembra" : pet.gender.toLowerCase() === "macho" ? "Macho" : pet.gender}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td data-label="Especie">
                      <div className={s.cellMain}>
                        <span>{sp.label}</span>
                        <span className={s.cellSub}>{pet.breed || "Sin raza definida"}</span>
                      </div>
                    </td>
                    <td data-label="Dueño" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/usuarios/${pet.owner_id}`} className={s.cellLink}>
                        {m.ownerName(pet.owner_id)}
                      </Link>
                    </td>
                    <td data-label="Vacunas">
                      <Badge
                        label={pet.is_vaccinated ? "Vacunada" : "Sin vacunas"}
                        color={pet.is_vaccinated ? "var(--color-success)" : "var(--color-text-muted)"}
                        size="sm"
                        variant={pet.is_vaccinated ? "filled" : "outlined"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ScreenContainer>
  );
}
