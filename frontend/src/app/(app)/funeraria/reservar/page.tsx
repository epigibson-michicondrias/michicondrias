"use client";

/**
 * Reservar Servicio funerario. Espejo de `mobile/app/funeraria/reservar.tsx`.
 * Acepta `?service_id=`.
 */
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Info, DollarSign } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/services/mascotas";
import { cremationLabel } from "@/services/funerary";
import { useFuneraryBooking } from "@/hooks/funerary/useFuneraryBooking";
import { formatCurrency } from "@/utils/formatters";
import local from "../funeraria.module.css";

function ReservarContent() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    form,
    updateForm,
    selectedServiceId,
    setSelectedServiceId,
    availableServices,
    isLoadingServices,
    handleBooking,
    isBooking,
  } = useFuneraryBooking();

  const { data: pets = [], isLoading: isLoadingPets } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const service = availableServices.find((s) => s.id === selectedServiceId) ?? null;

  const dateError =
    touched.scheduled_date && form.scheduled_date < new Date().toISOString().slice(0, 10)
      ? "La fecha no puede estar en el pasado."
      : null;

  return (
    <ScreenContainer>
      <ScreenHeader title="Reservar Servicio" subtitle="Selecciona un servicio funerario" />

      {isLoadingServices || isLoadingPets ? (
        <SkeletonList count={2} />
      ) : availableServices.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="No hay servicios disponibles"
          subtitle="Pronto habrá funerarias disponibles en tu zona."
          actionLabel="Volver"
          onAction={() => router.push("/funeraria")}
        />
      ) : (
        <>
          <FormSection title="Servicio">
            <FormSelect
              label="Servicio funerario *"
              options={availableServices.map((s) => ({
                label: `${s.name} · ${formatCurrency(s.price)}`,
                value: s.id,
              }))}
              value={selectedServiceId || ""}
              onChange={setSelectedServiceId}
            />
          </FormSection>

          {service ? (
            <Card>
              <div className={local.cardBody}>
                <div className={local.rowTop}>
                  <span className={local.iconBox} aria-hidden>
                    <Heart size={22} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={local.title}>{service.name}</p>
                    {service.description ? (
                      <p className={local.subtitle}>{service.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className={local.tagsRow}>
                  <Badge
                    label={formatCurrency(service.price)}
                    color="var(--color-primary)"
                    icon={<DollarSign size={12} aria-hidden />}
                  />
                  {service.cremation_type ? (
                    <Badge label={cremationLabel(service.cremation_type)} color="var(--color-secondary)" />
                  ) : null}
                  {service.urn_included ? (
                    <Badge label="Urna incluida" color="var(--color-warning)" />
                  ) : null}
                </div>
              </div>
            </Card>
          ) : null}

          <FormSection title="Datos de la reserva">
            <FormSelect
              label="Mascota *"
              options={pets.map((p) => ({ label: p.name, value: p.id }))}
              value={form.pet_id}
              onChange={(v) => updateForm("pet_id", v)}
            />
            <FormField
              label="Fecha Programada *"
              value={form.scheduled_date}
              onChangeText={(v) => updateForm("scheduled_date", v)}
              placeholder="AAAA-MM-DD"
              error={dateError}
              onBlur={() => setTouched((t) => ({ ...t, scheduled_date: true }))}
            />
            <FormField
              label="Notas"
              value={form.notes || ""}
              onChangeText={(v) => updateForm("notes", v)}
              placeholder="Instrucciones especiales..."
              multiline
              numberOfLines={3}
            />
          </FormSection>

          <div className={local.noteBox}>
            <Info size={16} aria-hidden />
            <span>
              La funeraria recibirá tu solicitud y te avisaremos cuando la confirme. Puedes seguirla en Mis
              Reservas.
            </span>
          </div>

          <div style={{ marginTop: "var(--space-lg)" }}>
            <Button
              label={isBooking ? "Reservando..." : "Confirmar Reserva"}
              onPress={handleBooking}
              loading={isBooking}
              disabled={!selectedServiceId || !form.pet_id || !form.scheduled_date}
              icon={<Check size={18} />}
            />
          </div>
        </>
      )}
    </ScreenContainer>
  );
}

export default function ReservarPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Reservar Servicio" subtitle="Selecciona un servicio funerario" />
        </ScreenContainer>
      }
    >
      <ReservarContent />
    </Suspense>
  );
}
