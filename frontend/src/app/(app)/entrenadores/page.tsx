"use client";

/**
 * Entrenadores — listado público de programas de entrenamiento (`/entrenadores`).
 * Espejo de `mobile/app/entrenadores/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Dumbbell, Clock, DollarSign, Plus, BookOpen } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { usePrograms } from "@/hooks/training/usePrograms";
import l from "./entrenadores.module.css";

export default function EntrenadoresPage() {
  const router = useRouter();
  const { user } = useAuth();

  const roleName = user?.role_name || "";
  const isTrainer = roleName === "entrenador" || roleName === "admin";

  const { programs, isLoading } = usePrograms();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Entrenadores"
        subtitle="Programas de entrenamiento para tu mascota"
        showBack={false}
      />

      <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
        {isTrainer ? (
          <Button
            label="Nuevo programa"
            icon={<Plus size={18} />}
            onPress={() => router.push("/entrenadores/nuevo-programa")}
            style={{ flex: 1 }}
          />
        ) : (
          <Button
            label="Mis inscripciones"
            variant="secondary"
            icon={<BookOpen size={18} />}
            onPress={() => router.push("/entrenadores/mis-inscripciones")}
            style={{ flex: 1 }}
          />
        )}
      </div>

      {isLoading ? (
        <SkeletonList count={3} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon={<Dumbbell size={28} />}
          title="Sin programas"
          subtitle="No hay programas de entrenamiento disponibles"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {programs.map((item) => (
            <Card
              key={item.id}
              onPress={() => router.push(`/entrenadores/${item.id}`)}
              accessibilityLabel={`Ver programa ${item.title}`}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-md)" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Dumbbell size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 700, color: "var(--color-text)" }}>
                      {item.title}
                    </p>
                    {item.description ? (
                      <p
                        style={{
                          margin: "var(--space-xs) 0 0",
                          fontSize: "var(--font-md)",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    padding: "var(--space-md) 0",
                    borderTop: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <DollarSign size={16} color="var(--color-primary)" />
                    <span style={{ fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
                      ${item.price.toLocaleString()}
                    </span>
                    <span className={l.statLabel}>Precio</span>
                  </div>
                  <div className={l.statDivider} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <Clock size={16} color="var(--color-accent)" />
                    <span style={{ fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
                      {item.duration_weeks} semanas
                    </span>
                    <span className={l.statLabel}>Duración</span>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    textAlign: "right",
                    fontSize: "var(--font-xs)",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  Entrenador: {item.trainer_name || "Sin nombre"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
