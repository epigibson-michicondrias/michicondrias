"use client";

/**
 * Cuidador — ficha del proveedor (`/cuidadores/[id]`): perfil, reseñas y solicitud de cuidado.
 * Espejo de `mobile/app/cuidadores/[id].tsx`.
 */
import { useRouter } from "next/navigation";
import { Calendar, Cat, Dog, Home, PawPrint, UserX } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import FormField from "@/components/FormField";
import { Skeleton } from "@/components/Skeleton";
import {
  ProviderHero,
  ProviderStats,
  ProviderSection,
  ProviderBio,
  ProviderServices,
  ProviderLocation,
  ProviderPrice,
  ProviderRatingSummary,
  ProviderReviews,
  ProviderReviewForm,
  ProviderFooter,
} from "@/features/servicios-pro/ProviderProfile";
import RequestModal from "@/features/servicios-pro/RequestModal";
import DateField from "@/features/servicios-pro/DateField";
import { toLocalIsoDate } from "@/features/servicios-pro/requestStatus";
import { useSitterDetail } from "@/hooks/cuidadores/useSitterDetail";
import { MODULE_ACCENTS } from "@/constants/modules";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/servicios-pro/servicios-pro.module.css";

const ACCENT = MODULE_ACCENTS.cuidadores;

export default function SitterDetailPage() {
  const router = useRouter();
  const w = useSitterDetail();
  const { sitter } = w;

  if (w.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Cuidador" />
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <Skeleton width={96} height={96} borderRadius={48} style={{ justifySelf: "center" }} />
          <Skeleton width="50%" height={24} style={{ justifySelf: "center" }} />
          <Skeleton height={72} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </div>
      </ScreenContainer>
    );
  }

  if (w.error || !sitter) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Cuidador" />
        <EmptyState
          icon={<UserX size={28} />}
          title="No pudimos cargar este perfil"
          subtitle="Puede que ya no esté disponible o que no tengas conexión."
          actionLabel="Ver cuidadores"
          onAction={() => router.replace("/cuidadores")}
        />
      </ScreenContainer>
    );
  }

  const average = w.reviews.length
    ? w.reviews.reduce((sum, r) => sum + r.rating, 0) / w.reviews.length
    : 0;

  return (
    <ScreenContainer>
      <ScreenHeader
        title={sitter.display_name}
        subtitle={sitter.is_verified ? "Cuidador verificado" : "Cuidador"}
        module="cuidadores"
      />

      <ProviderHero
        photoUrl={sitter.photo_url}
        name={sitter.display_name}
        rating={w.reviews.length ? average : undefined}
        reviewCount={w.reviews.length}
        accent={ACCENT}
      />
      <ProviderStats
        items={[
          { value: String(sitter.total_sits), label: "Cuidados" },
          { value: String(sitter.experience_years ?? 0), label: sitter.experience_years === 1 ? "Año" : "Años" },
          { value: String(sitter.max_pets), label: "Por cuidado" },
        ]}
      />

      {sitter.bio ? (
        <ProviderSection title="Sobre mí">
          <ProviderBio text={sitter.bio} />
        </ProviderSection>
      ) : null}

      <ProviderSection title="Servicio">
        <ProviderServices
          services={[
            {
              name: "Hospedaje en mi casa",
              active: sitter.service_type === "hosting" || sitter.service_type === "both",
              icon: (
                <Home
                  size={16}
                  color={
                    sitter.service_type === "hosting" || sitter.service_type === "both"
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)"
                  }
                />
              ),
            },
            {
              name: "Visitas a domicilio",
              active: sitter.service_type === "visiting" || sitter.service_type === "both",
              icon: (
                <PawPrint
                  size={16}
                  color={
                    sitter.service_type === "visiting" || sitter.service_type === "both"
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)"
                  }
                />
              ),
            },
            {
              name: "Perros",
              active: sitter.accepts_dogs,
              icon: <Dog size={16} color={sitter.accepts_dogs ? "var(--color-primary)" : "var(--color-text-muted)"} />,
            },
            {
              name: "Gatos",
              active: sitter.accepts_cats,
              icon: <Cat size={16} color={sitter.accepts_cats ? "var(--color-primary)" : "var(--color-text-muted)"} />,
            },
          ]}
        />
      </ProviderSection>

      {sitter.location ? (
        <ProviderSection title="Zona">
          <ProviderLocation
            text={sitter.location}
            extra={[sitter.home_type, sitter.has_yard ? "Con patio o jardín" : null].filter(Boolean).join(" · ") || undefined}
          />
        </ProviderSection>
      ) : null}

      <ProviderSection title="Tarifas">
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <ProviderPrice
            label="Por día"
            amount={sitter.price_per_day ? formatCurrency(sitter.price_per_day) : "Por acordar"}
          />
          {sitter.price_per_visit ? (
            <ProviderPrice label="Visita a domicilio" amount={formatCurrency(sitter.price_per_visit)} />
          ) : null}
        </div>
      </ProviderSection>

      <ProviderSection title="Opiniones">
        <ProviderRatingSummary rating={average} count={w.reviews.length} />
        {w.unreviewedCompletedRequests.length > 0 ? (
          <ProviderReviewForm
            onSubmit={(rating, comment) => {
              const req = w.unreviewedCompletedRequests[0];
              if (req) w.handleCreateReview(req.id, { rating, comment });
            }}
            isSubmitting={w.isCreatingReview}
          />
        ) : null}
        <ProviderReviews
          reviews={w.reviews.map((r) => ({
            id: r.id,
            user_name: (r as { user_name?: string }).user_name,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
          }))}
        />
      </ProviderSection>

      {!w.isOwnProfile ? (
        <ProviderFooter label="Solicitar cuidado" onPress={w.handleBook} icon={<Calendar size={16} />} />
      ) : null}

      <RequestModal
        visible={w.sitModalVisible}
        onClose={() => w.setSitModalVisible(false)}
        title="Solicitar cuidado"
        subtitle={`Con ${sitter.display_name}`}
        onSubmit={w.handleSubmitSitRequest}
        submitting={w.isRequestingSit}
      >
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <div>
            <p className={s.dateLabel}>¿A quién va a cuidar?</p>
            {w.myPets.length === 0 ? (
              <div className={s.inline}>
                <p className={s.reviewComment} style={{ flex: 1 }}>
                  Primero agrega a tu mascota.
                </p>
                <button
                  type="button"
                  className={s.seeProfile}
                  onClick={() => {
                    w.setSitModalVisible(false);
                    router.push("/mascotas/nuevo");
                  }}
                >
                  Agregar
                </button>
              </div>
            ) : (
              <div className={s.chipsRow}>
                {w.myPets.map((pet) => (
                  <FilterChip
                    key={pet.id}
                    label={pet.name}
                    active={w.selectedPetId === pet.id}
                    onPress={() => w.setSelectedPetId(pet.id)}
                    icon={<PawPrint size={12} />}
                  />
                ))}
              </div>
            )}
          </div>

          {sitter.service_type === "both" ? (
            <div>
              <p className={s.dateLabel}>Tipo de servicio</p>
              <div className={s.chipsRow}>
                <FilterChip
                  label="Hospedaje"
                  active={w.sitServiceType === "hosting"}
                  onPress={() => w.setSitServiceType("hosting")}
                />
                <FilterChip
                  label="Visitas a domicilio"
                  active={w.sitServiceType === "visiting"}
                  onPress={() => w.setSitServiceType("visiting")}
                />
              </div>
            </div>
          ) : null}

          <DateField label="Desde" value={w.startDate} onChange={w.setStartDate} min={toLocalIsoDate(new Date())} />
          <DateField label="Hasta" value={w.endDate} onChange={w.setEndDate} min={w.startDate} />

          <FormField
            label="Notas para el cuidador"
            value={w.sitNotes}
            onChangeText={w.setSitNotes}
            placeholder="Rutina, alimentación, medicinas, a qué hora recoger…"
            multiline
          />
        </div>
      </RequestModal>
    </ScreenContainer>
  );
}
