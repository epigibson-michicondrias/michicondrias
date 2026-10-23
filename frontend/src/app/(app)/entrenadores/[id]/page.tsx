"use client";

/**
 * Detalle de programa de entrenamiento (`/entrenadores/[id]`).
 * Espejo de `mobile/app/entrenadores/[id].tsx`.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Clock, DollarSign, Info, Calendar } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import ReviewsSection from "@/features/directorio/ReviewsSection";
import { getProgramReviews, createProgramReview } from "@/services/training";
import { useProgramDetail } from "@/hooks/training/useProgramDetail";
import l from "../entrenadores.module.css";

export default function ProgramDetailPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { program, isLoading, error, handleEnroll } = useProgramDetail();
  const programId = program?.id;

  const { data: reviews } = useQuery({
    queryKey: ["program-reviews", programId],
    queryFn: () => getProgramReviews(programId!),
    enabled: !!programId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      createProgramReview(programId!, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-reviews", programId] });
      queryClient.invalidateQueries({ queryKey: ["trainingPrograms"] });
      showAlert({
        type: "success",
        title: "¡Gracias por tu reseña!",
        message: "Tu opinión ayuda a otros dueños a elegir.",
      });
    },
    onError: (e: Error) =>
      showAlert({ type: "error", title: "No se pudo enviar", message: e?.message || "Inténtalo de nuevo." }),
  });

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Programa" />
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (error || !program) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Programa" />
        <EmptyState
          icon={<Dumbbell size={28} />}
          title="No pudimos cargar la información del programa"
          subtitle="Verifica tu conexión e intenta de nuevo."
          actionLabel="Volver"
          onAction={() => window.history.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Detalle del Programa" />

      <div className={l.hero}>
        <div className={l.heroIcon}>
          <Dumbbell size={32} />
        </div>
        <h2 className={l.heroTitle}>{program.title}</h2>
        {program.description ? <p className={l.heroSub}>{program.description}</p> : null}
      </div>

      <div className={l.statsRow}>
        <div className={l.statItem}>
          <DollarSign size={18} color="var(--color-primary)" />
          <p className={l.statValue}>${program.price.toLocaleString()}</p>
          <p className={l.statLabel}>Precio</p>
        </div>
        <div className={l.statDivider} />
        <div className={l.statItem}>
          <Clock size={18} color="var(--color-accent)" />
          <p className={l.statValue}>{program.duration_weeks}</p>
          <p className={l.statLabel}>Semanas</p>
        </div>
      </div>

      <Card>
        <p style={{ margin: "0 0 var(--space-md)", fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
          Información del programa
        </p>
        <div className={l.detailRow}>
          <Info size={15} color="var(--color-text-muted)" />
          <span className={l.detailLabel}>Entrenador</span>
          <span className={l.detailValue}>{program.trainer_name || "Sin nombre"}</span>
        </div>
        <div className={l.detailRow} style={{ borderBottom: 0 }}>
          <Calendar size={15} color="var(--color-text-muted)" />
          <span className={l.detailLabel}>Duración</span>
          <span className={l.detailValue}>
            {program.duration_weeks} {program.duration_weeks === 1 ? "semana" : "semanas"}
          </span>
        </div>
      </Card>

      <div style={{ margin: "var(--space-xl) 0" }}>
        {program.trainer_id === user?.id ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", fontSize: "var(--font-sm)" }}>
            Este es tu programa. Gestiona a tus alumnos desde el panel del entrenador.
          </p>
        ) : (
          <Button label="Inscribir mascota" icon={<Dumbbell size={18} />} onPress={handleEnroll} />
        )}
      </div>

      <ReviewsSection
        title="Reseñas del programa"
        average={reviews?.average ?? 0}
        count={reviews?.count ?? 0}
        reviews={reviews?.reviews ?? []}
        canReview={!!reviews?.can_review}
        submitting={reviewMutation.isPending}
        onSubmit={(rating, comment) => reviewMutation.mutate({ rating, comment })}
        formPrompt="Completaste este programa. ¿Cómo te fue?"
      />
    </ScreenContainer>
  );
}
