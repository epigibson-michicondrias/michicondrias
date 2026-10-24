"use client";

/**
 * Funeraria — servicios funerarios y memorial para tus mascotas.
 * Espejo de `mobile/app/funeraria/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Heart, DollarSign, Plus, Inbox, BookHeart } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFuneraryServices } from "@/hooks/funerary/useFuneraryServices";
import { cremationLabel, type FuneraryService } from "@/services/funerary";
import { formatCurrency } from "@/utils/formatters";
import local from "./funeraria.module.css";

export default function FunerariaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, services, isLoading, hasSearch } = useFuneraryServices();

  const roleName = user?.role_name || "";
  const isFuneralHome = roleName === "funeraria" || roleName === "admin";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Funeraria"
        subtitle="Servicios funerarios y memorial para tus mascotas"
        showBack={false}
        actions={
          isFuneralHome
            ? [
                { icon: Plus, label: "Crear Servicio", onPress: () => router.push("/funeraria/nuevo-servicio") },
                { icon: Heart, label: "Solicitudes", onPress: () => router.push("/funeraria/gestion") },
              ]
            : [
                { icon: Heart, label: "Mis Reservas", onPress: () => router.push("/funeraria/mis-reservas") },
                {
                  icon: BookHeart,
                  label: "Memorial",
                  onPress: () => router.push("/funeraria/memorial/nuevo"),
                },
              ]
        }
      />

      <div className={local.actions}>
        {!isFuneralHome ? (
          <Button
            label="Reporte de defunción"
            variant="secondary"
            onPress={() => router.push("/funeraria/reporte-defuncion")}
            icon={<Inbox size={18} />}
          />
        ) : null}
      </div>

      <div className={local.filters}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar servicios funerarios..."
        />
      </div>

      {isLoading ? (
        <div className={local.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={150} borderRadius={16} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title={hasSearch ? "No se encontraron servicios." : "No hay servicios disponibles."}
          subtitle={hasSearch ? "Prueba con otra palabra." : "Pronto habrá funerarias disponibles en tu zona."}
          actionLabel={hasSearch ? "Quitar búsqueda" : undefined}
          onAction={hasSearch ? () => setSearchQuery("") : undefined}
        />
      ) : (
        <div className={local.list}>
          {services.map((item: FuneraryService) => (
            <Card key={item.id} onPress={() => router.push(`/funeraria/reservar?service_id=${item.id}`)}>
              <div className={local.cardBody}>
                <div className={local.rowTop}>
                  <span className={local.iconBox} aria-hidden>
                    <Heart size={22} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={local.title}>{item.name}</p>
                    {item.description ? <p className={local.subtitle}>{item.description}</p> : null}
                  </div>
                </div>
                <div className={local.tagsRow}>
                  <Badge
                    label={formatCurrency(item.price)}
                    color="var(--color-primary)"
                    icon={<DollarSign size={12} aria-hidden />}
                  />
                  {item.cremation_type ? (
                    <Badge label={cremationLabel(item.cremation_type)} color="var(--color-secondary)" />
                  ) : null}
                  {item.urn_included ? (
                    <Badge label="Urna incluida" color="var(--color-warning)" />
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
