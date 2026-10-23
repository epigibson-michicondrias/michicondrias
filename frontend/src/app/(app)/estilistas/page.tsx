"use client";

/**
 * Estilistas — catálogo público de servicios de grooming (`/estilistas`).
 * Espejo de `mobile/app/estilistas/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Scissors, Clock, DollarSign, Plus, CalendarCheck, Star } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useGroomingServices } from "@/hooks/grooming/useGroomingServices";
import l from "./estilistas.module.css";

export default function EstilistasPage() {
  const router = useRouter();
  const { user } = useAuth();

  const roleName = user?.role_name || "";
  const isStylist = roleName === "estilista" || roleName === "groomer" || roleName === "admin";

  const { services, isLoading, searchQuery, setSearchQuery, hasActiveFilters } = useGroomingServices();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Estilistas"
        subtitle="Servicios de grooming y estética para tu mascota"
        showBack={false}
      />

      <div className={l.actionsRow}>
        {isStylist ? (
          <Button
            label="Ofrecer servicios"
            icon={<Plus size={18} />}
            onPress={() => router.push("/estilistas/nuevo")}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            label="Mis citas"
            variant="secondary"
            icon={<CalendarCheck size={18} />}
            onPress={() => router.push("/grooming/mis-citas")}
            style={{ flex: 1 }}
          />
        )}
      </div>

      <div className={l.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar servicios de grooming..."
        />
      </div>

      {isLoading ? (
        <div className={l.list}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} borderRadius={16} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Scissors size={28} />}
          title={hasActiveFilters ? "No se encontraron servicios." : "No hay servicios disponibles."}
          subtitle={
            hasActiveFilters
              ? "Prueba con otra búsqueda."
              : "Cuando un estilista publique un servicio aparecerá aquí."
          }
          actionLabel={hasActiveFilters ? "Quitar búsqueda" : undefined}
          onAction={hasActiveFilters ? () => setSearchQuery("") : undefined}
        />
      ) : (
        <div className={l.list}>
          {services.map((item) => (
            <Card
              key={item.id}
              onPress={() => router.push(`/grooming/agendar?service_id=${item.id}`)}
              accessibilityLabel={`Agendar ${item.name}`}
            >
              <div className={l.card}>
                <div className={l.cardTop}>
                  <div className={l.iconBox}>
                    <Scissors size={22} />
                  </div>
                  <div className={l.cardInfo}>
                    <p className={l.cardTitle}>{item.name}</p>
                    {item.groomer_name ? <p className={l.cardSub}>Con {item.groomer_name}</p> : null}
                    {item.description ? <p className={l.cardDesc}>{item.description}</p> : null}
                    {item.groomer_rating_count ? (
                      <div className={l.ratingRow}>
                        <Star size={13} color="var(--color-accent)" fill="var(--color-accent)" />
                        <span>
                          {(item.groomer_rating_avg ?? 0).toFixed(1)} ({item.groomer_rating_count})
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className={l.metaRow}>
                  <span className={`${l.metaItem} ${l.metaPrice}`}>
                    <DollarSign size={14} />
                    {item.price}
                  </span>
                  <span className={l.metaItem}>
                    <Clock size={14} />
                    {item.duration_minutes} min
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
