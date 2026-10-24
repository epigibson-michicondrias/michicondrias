"use client";

/**
 * Servicios Pro — paseadores y cuidadores en un solo listado (`/servicios-pro`).
 * Espejo de `mobile/app/servicios-pro/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Clock, Footprints, Home, User, Users } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import SegmentedControl from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import ProviderCard from "@/features/servicios-pro/ProviderCard";
import { useProRole } from "@/features/servicios-pro/useProRole";
import { useServiciosPro, type ProTab } from "@/hooks/servicios-pro/useServiciosPro";
import { MODULE_ACCENTS } from "@/constants/modules";
import type { Walker } from "@/services/paseadores";
import type { Sitter } from "@/services/cuidadores";
import s from "@/features/servicios-pro/servicios-pro.module.css";

const TABS: { value: ProTab; label: string; icon: typeof Footprints }[] = [
  { value: "walkers", label: "Paseadores", icon: Footprints },
  { value: "sitters", label: "Cuidadores", icon: Home },
];

const species = (p: { accepts_cats: boolean; accepts_dogs: boolean }) =>
  [p.accepts_cats && "Gatos", p.accepts_dogs && "Perros"].filter(Boolean).join(" y ") || "Mascotas";

export default function ServiciosProPage() {
  const router = useRouter();
  const { isProvider } = useProRole();
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredData, isLoading } = useServiciosPro();
  const isWalkers = activeTab === "walkers";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Servicios Pro"
        subtitle="Expertos al cuidado de tu mascota"
        actions={
          isProvider
            ? [{ icon: User, label: "Mi perfil profesional", onPress: () => router.push("/servicios-pro/perfil") }]
            : undefined
        }
      />

      <div className={s.filters}>
        <SegmentedControl value={activeTab} onChange={setActiveTab} options={TABS} accessibilityLabel="Tipo de servicio" />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Buscar ${isWalkers ? "paseadores" : "cuidadores"} por nombre o ubicación...`}
        />
      </div>

      {isLoading ? (
        <div className={s.cards}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={240} borderRadius={16} />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon={isWalkers ? <Footprints size={28} /> : <Home size={28} />}
          title={searchQuery ? "Sin resultados" : "Aún no hay profesionales"}
          subtitle={
            searchQuery
              ? "No encontramos profesionales con esa búsqueda."
              : "Cuando un profesional se registre aparecerá aquí."
          }
          actionLabel={searchQuery ? "Quitar búsqueda" : undefined}
          onAction={searchQuery ? () => setSearchQuery("") : undefined}
        />
      ) : (
        <div className={s.cards}>
          {filteredData.map((item) => {
            if (isWalkers) {
              const w = item as Walker;
              return (
                <ProviderCard
                  key={w.id}
                  href={`/paseadores/${w.id}`}
                  name={w.display_name}
                  photoUrl={w.photo_url}
                  location={w.location}
                  rating={w.rating}
                  verified={w.is_verified}
                  accent={MODULE_ACCENTS.paseadores}
                  stats={[
                    { icon: Users, text: `${w.total_walks || 0} paseos` },
                    { icon: Clock, text: `${w.experience_years ?? 0} años exp.` },
                  ]}
                  tags={[{ label: species(w), color: "var(--color-primary)" }]}
                  price={w.price_per_walk ? `$${w.price_per_walk}` : "Tarifa por acordar"}
                  priceUnit={w.price_per_walk ? "/paseo" : undefined}
                />
              );
            }
            const c = item as Sitter;
            return (
              <ProviderCard
                key={c.id}
                href={`/cuidadores/${c.id}`}
                name={c.display_name}
                photoUrl={c.photo_url}
                location={c.location}
                rating={c.rating}
                verified={c.is_verified}
                accent={MODULE_ACCENTS.cuidadores}
                stats={[
                  { icon: Users, text: `${c.total_sits || 0} cuidados` },
                  { icon: Clock, text: `${c.experience_years ?? 0} años exp.` },
                ]}
                tags={[{ label: species(c), color: "var(--color-primary)" }]}
                price={c.price_per_day ? `$${c.price_per_day}` : "Tarifa por acordar"}
                priceUnit={c.price_per_day ? "/día" : undefined}
              />
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
