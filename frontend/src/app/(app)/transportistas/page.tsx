"use client";

/**
 * Transportistas — directorio público de conductores (`/transportistas`).
 * Espejo de `mobile/app/transportistas/index.tsx`.
 */
import { useRouter } from "next/navigation";
import {
  Car,
  Users,
  Snowflake,
  Box,
  CheckCircle2,
  Plus,
  Clock,
  User,
  Inbox,
  Route,
  Star,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import Button from "@/components/Button";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTransporters } from "@/hooks/rides/useTransporters";
import type { DriverProfile } from "@/services/rides";
import l from "./transportistas.module.css";

export default function TransportistasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery, drivers, isLoading } = useTransporters();

  const rawRole = user?.role_name || "";
  const isDriver = rawRole === "transportista" || rawRole === "driver" || rawRole === "admin";
  // Un conductor ve el directorio pero no se pide viaje a sí mismo
  const canRequest = rawRole !== "transportista" && rawRole !== "driver";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Transportistas"
        subtitle="Transporte seguro para tu mascota"
        showBack={false}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
        {isDriver ? (
          <>
            <Button
              label="Solicitudes"
              icon={<Inbox size={18} />}
              onPress={() => router.push("/transportistas/solicitudes")}
              style={{ flex: "1 1 140px" }}
            />
            <Button
              label="Mi vehículo"
              variant="secondary"
              icon={<User size={18} />}
              onPress={() => router.push("/transportistas/perfil-conductor")}
              style={{ flex: "1 1 140px" }}
            />
            <Button
              label="Historial"
              variant="secondary"
              icon={<Clock size={18} />}
              onPress={() => router.push("/transportistas/historial")}
              style={{ flex: "1 1 140px" }}
            />
          </>
        ) : null}
        {canRequest ? (
          <>
            <Button
              label="Solicitar"
              icon={<Plus size={18} />}
              onPress={() => router.push("/transportistas/solicitar")}
              style={{ flex: "1 1 140px" }}
            />
            <Button
              label="Mis viajes"
              variant="secondary"
              icon={<Route size={18} />}
              onPress={() => router.push("/transportistas/mis-viajes")}
              style={{ flex: "1 1 140px" }}
            />
          </>
        ) : null}
      </div>

      <div style={{ marginBottom: "var(--space-lg)" }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por modelo o placa..."
        />
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={<Car size={28} />}
          title="No hay conductores disponibles"
          subtitle="Intenta más tarde o escribe otra búsqueda."
          actionLabel={searchQuery ? "Quitar búsqueda" : undefined}
          onAction={searchQuery ? () => setSearchQuery("") : undefined}
        />
      ) : (
        <div className={l.list}>
          {drivers.map((item: DriverProfile) => (
            <Card
              key={item.id}
              onPress={
                canRequest
                  ? () => router.push(`/transportistas/solicitar?driver_id=${item.driver_id}`)
                  : undefined
              }
              accessibilityLabel={`${item.vehicle_model}, placa ${item.vehicle_plate}${
                item.is_available ? ", disponible" : ""
              }`}
            >
              <div className={l.card}>
                <div className={l.cardTop}>
                  <div className={l.iconBox}>
                    <Car size={22} />
                  </div>
                  <div className={l.cardInfo}>
                    <p className={l.cardTitle}>{item.vehicle_model}</p>
                    <p className={l.cardSub}>{item.vehicle_plate}</p>
                    {item.rating_avg != null ? (
                      <p className={l.cardSub} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} color="var(--color-accent)" fill="var(--color-accent)" />
                        {item.rating_avg.toFixed(1)} ({item.rating_count ?? 0})
                      </p>
                    ) : null}
                  </div>
                  {item.is_available ? (
                    <span
                      className={l.tag}
                      style={{
                        color: "var(--color-success)",
                        background: "color-mix(in srgb, var(--color-success) 14%, transparent)",
                      }}
                    >
                      <CheckCircle2 size={13} /> Disponible
                    </span>
                  ) : null}
                </div>
                <div className={l.tagsRow}>
                  <span className={l.tag}>
                    <Users size={12} /> {item.max_capacity} mascotas
                  </span>
                  {item.has_air_conditioning ? (
                    <span className={l.tag}>
                      <Snowflake size={12} /> A/C
                    </span>
                  ) : null}
                  {item.has_carriers ? (
                    <span className={l.tag}>
                      <Box size={12} /> Transportín
                    </span>
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
