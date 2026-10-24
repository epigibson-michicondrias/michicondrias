"use client";

/**
 * Paseador — ficha del proveedor (`/paseadores/[id]`): perfil, reseñas y solicitud de paseo.
 * Espejo de `mobile/app/paseadores/[id].tsx`.
 */
import { useRouter } from "next/navigation";
import { Calendar, Cat, Dog, PawPrint, UserX } from "lucide-react";
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
import { useWalkerDetail } from "@/hooks/paseadores/useWalkerDetail";
import { MODULE_ACCENTS } from "@/constants/modules";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/servicios-pro/servicios-pro.module.css";

const ACCENT = MODULE_ACCENTS.paseadores;

export default function WalkerDetailPage() {
  const router = useRouter();
  const w = useWalkerDetail();
  const { walker } = w;

  if (w.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Paseador" />
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <Skeleton width={96} height={96} borderRadius={48} style={{ justifySelf: "center" }} />
          <Skeleton width="50%" height={24} style={{ justifySelf: "center" }} />
          <Skeleton height={72} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </div>
      </ScreenContainer>
    );
  }

  if (w.error || !walker) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Paseador" />
        <EmptyState
          icon={<UserX size={28} />}
          title="No pudimos cargar este perfil"
          subtitle="Puede que ya no esté disponible o que no tengas conexión."
          actionLabel="Ver paseadores"
          onAction={() => router.replace("/paseadores")}
        />
      </ScreenContainer>
    );
  }

  // El promedio guardado en el perfil no siempre está al día: se calcula con las reseñas
  const average = w.reviews.length
    ? w.reviews.reduce((sum, r) => sum + r.rating, 0) / w.reviews.length
    : 0;

  return (
    <ScreenContainer>
      <ScreenHeader
        title={walker.display_name}
        subtitle={walker.is_verified ? "Paseador verificado" : "Paseador"}
        module="paseadores"
      />

      <ProviderHero
        photoUrl={walker.photo_url}
        name={walker.display_name}
        rating={w.reviews.length ? average : undefined}
        reviewCount={w.reviews.length}
        accent={ACCENT}
      />
      <ProviderStats
        items={[
          { value: String(walker.total_walks), label: "Paseos" },
          { value: String(walker.experience_years ?? 0), label: walker.experience_years === 1 ? "Año" : "Años" },
          { value: String(walker.max_pets_per_walk), label: "Por paseo" },
        ]}
      />

      {walker.bio ? (
        <ProviderSection title="Sobre mí">
          <ProviderBio text={walker.bio} />
        </ProviderSection>
      ) : null}

      <ProviderSection title="Pasea a">
        <ProviderServices
          services={[
            {
              name: "Perros",
              active: walker.accepts_dogs,
              icon: <Dog size={16} color={walker.accepts_dogs ? "var(--color-primary)" : "var(--color-text-muted)"} />,
            },
            {
              name: "Gatos",
              active: walker.accepts_cats,
              icon: <Cat size={16} color={walker.accepts_cats ? "var(--color-primary)" : "var(--color-text-muted)"} />,
            },
          ]}
        />
      </ProviderSection>

      {walker.location ? (
        <ProviderSection title="Zona">
          <ProviderLocation
            text={walker.location}
            extra={walker.service_radius_km ? `Hasta ${walker.service_radius_km} km a la redonda` : undefined}
          />
        </ProviderSection>
      ) : null}

      <ProviderSection title="Tarifas">
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <ProviderPrice
            label="Por hora"
            amount={walker.price_per_hour ? formatCurrency(walker.price_per_hour) : "Por acordar"}
          />
          {walker.price_per_walk ? (
            <ProviderPrice label="Paseo individual" amount={formatCurrency(walker.price_per_walk)} />
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
        <ProviderFooter label="Solicitar paseo" onPress={w.handleBook} icon={<Calendar size={16} />} />
      ) : null}

      <RequestModal
        visible={w.walkModalVisible}
        onClose={() => w.setWalkModalVisible(false)}
        title="Solicitar paseo"
        subtitle={`Con ${walker.display_name}`}
        onSubmit={w.handleSubmitWalkRequest}
        submitting={w.isRequestingWalk}
      >
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          <div>
            <p className={s.dateLabel}>¿A quién pasea?</p>
            {w.myPets.length === 0 ? (
              <div className={s.inline}>
                <p className={s.reviewComment} style={{ flex: 1 }}>
                  Primero agrega a tu mascota.
                </p>
                <button
                  type="button"
                  className={s.seeProfile}
                  onClick={() => {
                    w.setWalkModalVisible(false);
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

          <DateField
            label="Día del paseo"
            value={w.walkDate}
            onChange={w.setWalkDate}
            min={toLocalIsoDate(new Date())}
          />

          <div>
            <p className={s.dateLabel}>Duración</p>
            <div className={s.chipsRow}>
              {w.durations.map((d) => (
                <FilterChip
                  key={d}
                  label={`${d} min`}
                  active={w.walkDuration === d}
                  onPress={() => w.setWalkDuration(d)}
                />
              ))}
            </div>
          </div>

          <FormField
            label="Notas para el paseador"
            value={w.walkNotes}
            onChangeText={w.setWalkNotes}
            placeholder="Hora preferida, dirección, si jala la correa…"
            multiline
          />
        </div>
      </RequestModal>
    </ScreenContainer>
  );
}
