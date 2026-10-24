"use client";

/**
 * Paseadores — listado con búsqueda (`/paseadores`).
 * Espejo de `mobile/app/paseadores/index.tsx`. Reemplaza la página legacy.
 */
import { useRouter } from "next/navigation";
import { Clock, ClipboardList, Plus, Users, Footprints } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { Skeleton } from "@/components/Skeleton";
import ProviderCard from "@/features/servicios-pro/ProviderCard";
import { useWalkers } from "@/hooks/paseadores/useWalkers";
import { MODULE_ACCENTS } from "@/constants/modules";
import s from "@/features/servicios-pro/servicios-pro.module.css";

const ACCENT = MODULE_ACCENTS.paseadores;

export default function PaseadoresPage() {
  const router = useRouter();
  const { walkers, isLoading, search, setSearch, hasActiveFilters } = useWalkers();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Paseadores"
        subtitle="Encuentra al paseador perfecto para tu mascota"
        showBack={false}
        actions={[
          {
            icon: ClipboardList,
            label: "Mis solicitudes de paseo",
            onPress: () => router.push("/paseadores/solicitudes"),
          },
          {
            icon: Plus,
            label: "Quiero ser paseador",
            onPress: () => router.push("/paseadores/registro"),
          },
        ]}
      />

      <div className={s.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o ubicación..." />
      </div>

      {isLoading ? (
        <div className={s.cards}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={240} borderRadius={16} />
          ))}
        </div>
      ) : walkers.length === 0 ? (
        <EmptyState
          icon={<Footprints size={28} />}
          title={hasActiveFilters ? "Sin resultados" : "No hay paseadores"}
          subtitle={
            hasActiveFilters
              ? "No encontramos paseadores con esos criterios."
              : "Cuando un paseador se registre aparecerá aquí."
          }
          actionLabel={hasActiveFilters ? "Quitar filtros" : "Quiero ser paseador"}
          onAction={
            hasActiveFilters
              ? () => setSearch("")
              : () => router.push("/paseadores/registro")
          }
        />
      ) : (
        <div className={s.cards}>
          {walkers.map((walker) => (
            <ProviderCard
              key={walker.id}
              href={`/paseadores/${walker.id}`}
              name={walker.display_name}
              photoUrl={walker.photo_url}
              location={walker.location}
              rating={walker.rating}
              verified={walker.is_verified}
              accent={ACCENT}
              stats={[
                { icon: Users, text: `${walker.total_walks || 0} paseos` },
                { icon: Clock, text: `${walker.experience_years ?? 0} años exp.` },
              ]}
              tags={[
                {
                  label:
                    [walker.accepts_dogs && "Perros", walker.accepts_cats && "Gatos"].filter(Boolean).join(" y ") ||
                    "Mascotas",
                  color: "var(--color-primary)",
                },
                {
                  label: `Hasta ${walker.max_pets_per_walk} mascotas`,
                  color: "var(--color-secondary)",
                },
              ]}
              price={
                walker.price_per_hour
                  ? `$${walker.price_per_hour}`
                  : walker.price_per_walk
                    ? `$${walker.price_per_walk}`
                    : "Tarifa por acordar"
              }
              priceUnit={
                walker.price_per_hour ? "/hora" : walker.price_per_walk ? "/paseo" : undefined
              }
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
