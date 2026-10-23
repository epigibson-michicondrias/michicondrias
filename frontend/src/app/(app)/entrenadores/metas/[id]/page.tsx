"use client";

/**
 * Metas de una inscripción (`/entrenadores/metas/[id]`): progreso, alta de metas y revisión de videos.
 * Espejo de `mobile/app/entrenadores/metas/[id].tsx`.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Target,
  Plus,
  Video,
  CheckCircle,
  XCircle,
  Trophy,
  ClipboardList,
  X,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import FormField from "@/components/FormField";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { getEnrollmentGoals, type PetTrainingGoal } from "@/services/training";
import { useTrainerDashboard } from "@/hooks/training/useTrainerDashboard";
import { useEnrollment } from "@/hooks/training/useEnrollment";
import l from "../../entrenadores.module.css";

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof Target }> = {
  pending: { label: "Pendiente", color: "var(--color-warning)", icon: ClipboardList },
  not_started: { label: "Pendiente", color: "var(--color-warning)", icon: ClipboardList },
  in_progress: { label: "En progreso", color: "var(--color-info)", icon: Target },
  video_submitted: { label: "Video enviado", color: "var(--color-primary)", icon: Video },
  completed: { label: "Completado", color: "var(--color-success)", icon: Trophy },
  rejected: { label: "Rechazado", color: "var(--color-error)", icon: XCircle },
};

export default function MetasPage() {
  const params = useParams<{ id: string }>();
  const enrollmentId = params.id;
  const {
    enrollments,
    goalForm,
    setGoalForm,
    reviewNotes,
    setReviewNotes,
    handleCreateGoal,
    handleReviewVideo,
    handleUpdateGoal,
    setEnrollmentStatus,
    isUpdatingEnrollment,
    isUpdatingGoal,
    isCreatingGoal,
    isReviewingVideo,
  } = useTrainerDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PetTrainingGoal | null>(null);

  const { data: goals = [], isLoading: isGoalsLoading } = useQuery<PetTrainingGoal[]>({
    queryKey: ["trainingGoals", enrollmentId],
    queryFn: () => getEnrollmentGoals(enrollmentId),
    enabled: !!enrollmentId,
  });

  // La lista del entrenador solo trae sus inscripciones: si esta está ahí, quien mira es el entrenador
  const enrollment = enrollments.find((e) => e.id === enrollmentId);
  const isTrainer = !!enrollment;
  const { enrollments: myEnrollments } = useEnrollment();
  const current = enrollment || myEnrollments.find((e) => e.id === enrollmentId);
  const isActive = current?.status === "active";

  const confirmStatus = (status: "completed" | "cancelled") =>
    showAlert({
      type: "warning",
      title: status === "completed" ? "Finalizar programa" : "Cancelar inscripción",
      message:
        status === "completed"
          ? "¿Marcar este programa como completado para esta mascota?"
          : "¿Seguro que quieres cancelar esta inscripción?",
      showCancel: true,
      cancelText: "Volver",
      buttonText: "Confirmar",
      onButtonPress: () => setEnrollmentStatus(enrollmentId, status),
    });

  const completedCount = goals.filter((g) => g.status === "completed").length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const openReview = (goal: PetTrainingGoal) => {
    setSelectedGoal(goal);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Metas" />

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
          <Trophy size={22} color="var(--color-primary)" />
          <p style={{ margin: 0, fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
            Progreso general
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-lg)", marginTop: "var(--space-md)" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid var(--color-primary)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "var(--font-lg)", fontWeight: 800, color: "var(--color-primary)" }}>
              {progressPercent}%
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "var(--font-md)", color: "var(--color-text)" }}>
              {completedCount} de {goals.length} metas completadas
            </p>
            <div className={l.progressBg} style={{ marginTop: "var(--space-sm)" }}>
              <div className={l.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {isActive ? (
        <div style={{ display: "flex", gap: "var(--space-md)", margin: "var(--space-lg) 0" }}>
          {isTrainer ? (
            <Button
              label="Finalizar programa"
              onPress={() => confirmStatus("completed")}
              disabled={isUpdatingEnrollment}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button
            label="Cancelar inscripción"
            variant="danger"
            onPress={() => confirmStatus("cancelled")}
            disabled={isUpdatingEnrollment}
            style={{ flex: 1 }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "var(--space-xl) 0 var(--space-md)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
          Lista de metas
        </h2>
        {isTrainer ? (
          <IconButton
            icon={Plus}
            accessibilityLabel="Nueva meta"
            onPress={() => setShowCreateModal(true)}
            variant="primary"
          />
        ) : null}
      </div>

      {isGoalsLoading ? (
        <SkeletonList count={2} />
      ) : goals.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", margin: "var(--space-xl) 0" }}>
          {isTrainer ? "Aún no hay metas. Agrega la primera con el botón +." : "El entrenador aún no ha definido metas."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {goals.map((goal) => {
            const statusInfo = STATUS_INFO[goal.status ?? "pending"] || STATUS_INFO.pending;
            const StatusIcon = statusInfo.icon;
            const hasVideo = isTrainer && goal.status === "video_submitted";
            return (
              <Card key={goal.id}>
                <div className={l.goalCard}>
                  <div className={l.goalTop}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        background: `color-mix(in srgb, ${statusInfo.color} 14%, transparent)`,
                        color: statusInfo.color,
                      }}
                    >
                      <StatusIcon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={l.goalTitle}>{goal.goal_name}</p>
                      <Badge label={statusInfo.label} color={statusInfo.color} size="sm" />
                    </div>
                  </div>

                  {goal.progress_notes ? <p className={l.goalNotes}>{goal.progress_notes}</p> : null}

                  {goal.video_proof_url ? (
                    <a
                      className={l.videoLink}
                      href={goal.video_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video size={14} /> Ver video de evidencia
                    </a>
                  ) : null}

                  {isTrainer && isActive && goal.status !== "completed" && goal.status !== "video_submitted" ? (
                    <div className={l.goalActions}>
                      {goal.status !== "in_progress" ? (
                        <Button
                          label="En progreso"
                          variant="secondary"
                          size="sm"
                          fullWidth={false}
                          disabled={isUpdatingGoal}
                          onPress={() => handleUpdateGoal(goal.id, { status: "in_progress" })}
                        />
                      ) : null}
                      <Button
                        label="Lograda"
                        size="sm"
                        fullWidth={false}
                        disabled={isUpdatingGoal}
                        onPress={() => handleUpdateGoal(goal.id, { status: "completed" })}
                        icon={<CheckCircle size={15} />}
                      />
                    </div>
                  ) : null}

                  {hasVideo ? (
                    <div className={l.goalActions}>
                      <Button
                        label="Revisar video"
                        size="sm"
                        fullWidth={false}
                        onPress={() => openReview(goal)}
                        icon={<CheckCircle size={15} />}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal ? (
        <div
          role="presentation"
          onClick={() => setShowCreateModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--color-overlay, rgba(0,0,0,0.45))",
              zIndex: 40,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "var(--space-lg)",
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Nueva meta"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(520px, 100%)",
                background: "var(--color-background)",
                borderRadius: 24,
                padding: "var(--space-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)" }}>
                  Nueva meta
                </h2>
                <IconButton
                  icon={X}
                  accessibilityLabel="Cerrar"
                  onPress={() => setShowCreateModal(false)}
                  variant="subtle"
                />
              </div>
              <FormField
                label="Nombre de la meta *"
                value={goalForm.goal_name}
                onChangeText={(v) => setGoalForm((prev) => ({ ...prev, goal_name: v }))}
                placeholder="Ej. Sentarse al comando"
              />
              <FormField
                label="Notas de progreso"
                value={goalForm.progress_notes}
                onChangeText={(v) => setGoalForm((prev) => ({ ...prev, progress_notes: v }))}
                placeholder="Notas adicionales..."
                multiline
              />
              <Button
                label="Crear meta"
                loading={isCreatingGoal}
                onPress={() => {
                  if (!current) return;
                  handleCreateGoal(current.pet_id, current.program_id);
                  setShowCreateModal(false);
                }}
              />
            </div>
        </div>
      ) : null}

      {showReviewModal && selectedGoal ? (
        <div
          role="presentation"
          onClick={() => setShowReviewModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--color-overlay, rgba(0,0,0,0.45))",
            zIndex: 40,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "var(--space-lg)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Revisar video"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background: "var(--color-background)",
              borderRadius: 24,
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "var(--font-xl)", fontWeight: 800, color: "var(--color-text)" }}>
                Revisar video
              </h2>
              <IconButton
                icon={X}
                accessibilityLabel="Cerrar"
                onPress={() => setShowReviewModal(false)}
                variant="subtle"
              />
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}>
              {selectedGoal.goal_name}
            </p>
            {selectedGoal.video_proof_url ? (
              <a
                className={l.videoLink}
                href={selectedGoal.video_proof_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Video size={14} /> Abrir video de evidencia
              </a>
            ) : null}
            <FormField
              label="Notas de la revisión"
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder="Comentarios para el alumno..."
              multiline
            />
            <div style={{ display: "flex", gap: "var(--space-md)" }}>
              <Button
                label="Rechazar"
                variant="danger"
                style={{ flex: 1 }}
                loading={isReviewingVideo}
                onPress={() => {
                  handleReviewVideo(selectedGoal.id, false);
                  setShowReviewModal(false);
                }}
              />
              <Button
                label="Aprobar"
                style={{ flex: 1 }}
                loading={isReviewingVideo}
                onPress={() => {
                  handleReviewVideo(selectedGoal.id, true);
                  setShowReviewModal(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </ScreenContainer>
  );
}
