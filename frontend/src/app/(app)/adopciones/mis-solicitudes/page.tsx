"use client";

/**
 * Mis solicitudes de adopción (`/adopciones/mis-solicitudes`).
 * Espejo de `mobile/app/adopciones/mis-solicitudes.tsx`.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useMyApplications } from "@/hooks/adopciones/useMyApplications";
import { requestStatusInfo, requestStatusColor } from "@/features/adopciones/requestStatus";
import local from "@/features/adopciones/adopciones.module.css";

export default function MisSolicitudesPage() {
  const router = useRouter();
  const { requests, isLoading, getProgressIndex, STEPS } = useMyApplications();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis solicitudes"
        subtitle="Sigue el progreso de tus trámites de adopción"
      />

      {isLoading ? (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={160} borderRadius={16} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Aún no has solicitado adoptar"
          subtitle="Explora las mascotas en adopción y encuentra a tu nuevo mejor amigo."
          actionLabel="Ver mascotas en adopción"
          onAction={() => router.push("/adopciones")}
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {requests.map((req) => {
            const currentIdx = getProgressIndex(req.status);
            const isRejected = req.status === "REJECTED";
            const isAdopted = req.status === "ADOPTED";
            const status = requestStatusInfo(req.status);
            const color = requestStatusColor(req.status);

            return (
              <Card key={req.id}>
                <div className={local.myCard}>
                  <div className={local.myHeader}>
                    <div className={local.myAvatar}>
                      {req.pet_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL externa del bucket
                        <img src={req.pet_photo_url} alt="" width={56} height={56} style={{ objectFit: "cover", width: 56, height: 56 }} />
                      ) : (
                        <Heart size={24} aria-hidden />
                      )}
                    </div>
                    <div>
                      <p className={local.myTitle}>Adopción de {req.pet_name || "Mascota"}</p>
                      <p className={local.mySubtitle}>
                        <span style={{ color, fontWeight: 600 }}>{status.label}</span>
                      </p>
                    </div>
                  </div>

                  {isRejected ? (
                    <div className={`${local.banner} ${local.bannerError}`}>
                      Esta solicitud fue rechazada. No cumplió con todos los criterios o la mascota fue asignada a otra familia.
                    </div>
                  ) : (
                    <>
                      {isAdopted ? (
                        <div className={`${local.banner} ${local.bannerSuccess}`}>
                          <div>
                            <strong>¡Felicidades! La adopción se finalizó.</strong>
                            <p style={{ margin: "var(--space-xs) 0 0" }}>
                              {req.pet_name || "Tu nueva mascota"} ya está en tu perfil.{" "}
                              <Link href="/mascotas">Ver mis mascotas</Link>
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <div className={local.stepper}>
                        {STEPS.map((step, idx) => {
                          const isCompleted = idx < currentIdx;
                          const isActive = idx === currentIdx;
                          return (
                            <div
                              key={step.key}
                              className={`${local.step} ${isActive ? local.active : ""} ${isCompleted ? local.completed : ""}`}
                            >
                              <div className={local.stepIcon}>
                                {isCompleted ? <Check size={14} /> : idx + 1}
                              </div>
                              <span className={local.stepLabel}>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
