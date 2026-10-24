"use client";

/**
 * Cuidadores — listado con búsqueda y filtro de servicio (`/cuidadores`).
 * Espejo de `mobile/app/cuidadores/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Clock, ClipboardList, Home, Plus, Users, HeartHandshake } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import { Skeleton } from "@/components/Skeleton";
import ProviderCard from "@/features/servicios-pro/ProviderCard";
import { useSitters } from "@/hooks/cuidadores/useSitters";
import { MODULE_ACCENTS } from "@/constants/modules";
import s from "@/features/servicios-pro/servicios-pro.module.css";

const ACCENT = MODULE_ACCENTS.cuidadores;

function serviceLabel(type: string) {
  return type === "hosting" ? "Hospedaje" : type === "visiting" ? "Visitas a domicilio" : "Hospedaje y visitas";
}

export default function CuidadoresPage() {
  const router = useRouter();
  const { sitters, isLoading, search, setSearch, serviceFilter, setServiceFilter, hasActiveFilters } = useSitters();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Cuidadores"
        subtitle="Deja a tu mascota en las mejores manos mientras no estás"
        showBack={false}
        actions={[
          {
            icon: ClipboardList,
            label: "Mis solicitudes de cuidado",
            onPress: () => router.push("/cuidadores/solicitudes"),
          },
          {
            icon: Plus,
            label: "Quiero ser cuidador",
            onPress: () => router.push("/cuidadores/registro"),
          },
        ]}
      />

      <div className={s.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o ubicación..." />
        <div className={s.chipsRow}>
          <FilterChip label="Todos" active={serviceFilter === ""} onPress={() => setServiceFilter("")} />
          <FilterChip
            label="Hospedaje"
            active={serviceFilter === "hosting"}
            onPress={() => setServiceFilter(serviceFilter === "hosting" ? "" : "hosting")}
          />
          <FilterChip
            label="Visitas a domicilio"
            active={serviceFilter === "visiting"}
            onPress={() => setServiceFilter(serviceFilter === "visiting" ? "" : "visiting")}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={s.cards}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={260} borderRadius={16} />
          ))}
        </div>
      ) : sitters.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake size={28} />}
          title={hasActiveFilters ? "Sin resultados" : "No hay cuidadores"}
          subtitle={
            hasActiveFilters
              ? "No encontramos cuidadores con esos criterios."
              : "Cuando un cuidador se registre aparecerá aquí."
          }
          actionLabel={hasActiveFilters ? "Quitar filtros" : "Quiero ser cuidador"}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearch("");
                  setServiceFilter("");
                }
              : () => router.push("/cuidadores/registro")
          }
        />
      ) : (
        <div className={s.cards}>
          {sitters.map((sitter) => (
            <ProviderCard
              key={sitter.id}
              href={`/cuidadores/${sitter.id}`}
              name={sitter.display_name}
              photoUrl={sitter.photo_url}
              location={sitter.location}
              rating={sitter.rating}
              verified={sitter.is_verified}
              accent={ACCENT}
              stats={[
                { icon: Home, text: `${sitter.total_sits || 0} cuidados` },
                { icon: Clock, text: `${sitter.experience_years ?? 0} años exp.` },
              ]}
              tags={[
                { label: serviceLabel(sitter.service_type), color: "var(--color-secondary)" },
                { label: `Hasta ${sitter.max_pets || 1} mascotas`, color: "var(--color-primary)" },
                ...(sitter.has_yard ? [{ label: "Patio propio", color: "var(--color-warning)" }] : []),
              ]}
              price={
                sitter.price_per_day
                  ? `$${sitter.price_per_day}`
                  : sitter.price_per_visit
                    ? `$${sitter.price_per_visit}`
                    : "Por acordar"
              }
              priceUnit={sitter.price_per_day ? "/día" : sitter.price_per_visit ? "/visita" : undefined}
              bio={sitter.bio}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
