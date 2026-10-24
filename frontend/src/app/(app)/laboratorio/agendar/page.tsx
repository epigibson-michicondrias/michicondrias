"use client";

/**
 * Agendar estudio de laboratorio. Espejo de `mobile/app/laboratorio/agendar.tsx`.
 * Acepta `?test_id=`.
 */
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, FlaskConical, PawPrint, Info } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/services/mascotas";
import { useLabOrders } from "@/hooks/laboratorio/useLabOrders";
import { showAlert } from "@/components/AppAlert";
import { formatCurrency } from "@/utils/formatters";
import local from "../laboratorio.module.css";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function AgendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const testId = searchParams.get("test_id") || "";

  const { tests, isLoadingTests, createAppointment, isCreatingAppointment } = useLabOrders();
  const test = tests.find((t: Record<string, unknown>) => String(t.id) === testId) ?? null;

  const { data: pets = [], isLoading: isLoadingPets } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const [petId, setPetId] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const dateError = touched.date && date < toISODate(new Date()) ? "La fecha no puede estar en el pasado." : null;

  const handleSubmit = async () => {
    if (!petId) {
      showAlert({ type: "error", title: "Falta la mascota", message: "Selecciona a tu mascota." });
      return;
    }
    if (!date) {
      showAlert({ type: "error", title: "Falta la fecha", message: "Elige la fecha de la cita." });
      return;
    }
    if (date < toISODate(new Date())) {
      showAlert({ type: "error", title: "Fecha inválida", message: "La fecha no puede estar en el pasado." });
      return;
    }
    try {
      await createAppointment({
        test_id: testId,
        pet_id: petId,
        scheduled_date: date,
        scheduled_time: time || undefined,
        notes: notes.trim() || undefined,
      });
      showAlert({
        type: "success",
        title: "Cita solicitada",
        message: "El laboratorio confirmará tu cita y te avisaremos por notificación.",
        onButtonPress: () => router.replace("/laboratorio"),
      });
    } catch {
      // El error ya lo muestra el hook.
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Agendar estudio" subtitle={test ? String(test.name) : "Laboratorio"} />

      {isLoadingTests || isLoadingPets ? (
        <SkeletonList count={2} />
      ) : !test ? (
        <EmptyState
          icon={<FlaskConical size={28} />}
          title="No encontramos ese estudio"
          subtitle="Puede que ya no esté disponible. Elige otro en el catálogo."
          actionLabel="Ver estudios"
          onAction={() => router.push("/laboratorio")}
        />
      ) : (
        <>
          <Card>
            <div className={local.cardBody}>
              <div className={local.rowTop}>
                <span className={local.iconBox} aria-hidden>
                  <FlaskConical size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={local.title}>{String(test.name)}</p>
                  {test.description ? <p className={local.subtitle}>{String(test.description)}</p> : null}
                </div>
              </div>
              <p className={local.priceTag}>{formatCurrency(Number(test.price || 0))}</p>
            </div>
          </Card>

          <FormSection title="Datos de la cita">
            <FormSelect
              label="Mascota *"
              options={pets.map((p) => ({ label: p.name, value: p.id }))}
              value={petId}
              onChange={setPetId}
            />
            <FormField
              label="Fecha *"
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-DD"
              error={dateError}
              onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            />
            <FormField
              label="Hora"
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM (opcional)"
            />
            <FormField
              label="Indicaciones"
              value={notes}
              onChangeText={setNotes}
              placeholder="Ayuno, medicamentos actuales, indicaciones del veterinario..."
              multiline
              numberOfLines={3}
            />
          </FormSection>

          <div className={local.noteBox}>
            <Info size={14} aria-hidden /> La cita queda sujeta a confirmación del laboratorio.
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Button
              label={isCreatingAppointment ? "Enviando…" : "Solicitar cita"}
              onPress={handleSubmit}
              loading={isCreatingAppointment}
              icon={<Check size={18} />}
            />
          </div>

          <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            <PawPrint size={14} aria-hidden /> Recibirás una notificación cuando el laboratorio confirme.
          </p>
        </>
      )}
    </ScreenContainer>
  );
}

export default function AgendarPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Agendar estudio" />
        </ScreenContainer>
      }
    >
      <AgendarContent />
    </Suspense>
  );
}
