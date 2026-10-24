"use client";

/**
 * Inscribir mascota a un programa (`/entrenadores/inscribir/[programId]`).
 * Espejo de `mobile/app/entrenadores/inscribir/[programId].tsx`.
 */
import { useRouter } from "next/navigation";
import { Dumbbell, DollarSign, Clock, PawPrint, CheckCircle, ArrowRight } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useEnrollment } from "@/hooks/training/useEnrollment";
import type { Pet } from "@/types/mascotas";
import l from "../../entrenadores.module.css";

export default function InscribirMascotaPage() {
  const router = useRouter();
  const { program, pets, selectedPetId, setSelectedPetId, handleEnroll, isEnrolling, isLoading } = useEnrollment();

  return (
    <ScreenContainer>
      <ScreenHeader title="Inscribir Mascota" />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          {program ? (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", textAlign: "center", alignItems: "center" }}>
                <div className={l.heroIcon}>
                  <Dumbbell size={26} />
                </div>
                <p style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)" }}>
                  {program.title}
                </p>
                {program.description ? (
                  <p style={{ margin: 0, fontSize: "var(--font-md)", color: "var(--color-text-muted)" }}>
                    {program.description}
                  </p>
                ) : null}
                <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", justifyContent: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                      color: "var(--color-primary)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                    }}
                  >
                    <DollarSign size={13} /> ${program.price.toLocaleString()}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                      color: "var(--color-accent)",
                      fontSize: "var(--font-sm)",
                      fontWeight: 700,
                    }}
                  >
                    <Clock size={13} /> {program.duration_weeks} semanas
                  </span>
                </div>
              </div>
            </Card>
          ) : null}

          <div style={{ margin: "var(--space-xl) 0 var(--space-md)" }}>
            <h2 style={{ margin: 0, fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
              Selecciona tu mascota
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
              Elige la mascota que participará en el entrenamiento
            </p>
          </div>

          {pets.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={28} />}
              title="No tienes mascotas registradas"
              subtitle="Registra una mascota para poder inscribirla."
              actionLabel="Registrar mascota"
              onAction={() => router.push("/mascotas/nuevo")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              {pets.map((pet: Pet) => {
                const selected = selectedPetId === pet.id;
                return (
                  <button
                    key={pet.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedPetId(pet.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-md)",
                      padding: "var(--space-md) var(--space-lg)",
                      borderRadius: 16,
                      border: selected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <PawPrint size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}>
                        {pet.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
                        {pet.breed || pet.species}
                      </p>
                    </div>
                    {selected ? (
                      <CheckCircle size={20} color="var(--color-primary)" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          <Button
            label="Inscribir mascota"
            icon={<ArrowRight size={18} />}
            onPress={handleEnroll}
            loading={isEnrolling}
            disabled={!selectedPetId}
            style={{ marginTop: "var(--space-xl)" }}
          />
        </>
      )}
    </ScreenContainer>
  );
}
