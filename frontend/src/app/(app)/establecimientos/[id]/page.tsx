"use client";

/**
 * Detalle de establecimiento (`/establecimientos/[id]`).
 * Espejo de `mobile/app/establecimientos/[id].tsx`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Edit3, Gift, MapPin, MessageSquare, Send, Star, Tag, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useVenueDetail } from "@/hooks/venues/useVenueDetail";
import { useVenueReviews } from "@/hooks/venues/useVenueReviews";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/utils/formatters";
import local from "../establecimientos.module.css";

function StarRow({
  rating,
  interactive = false,
  size = 16,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  size?: number;
  onRate?: (star: number) => void;
}) {
  return (
    <div className={local.starsRow} aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) =>
        interactive ? (
          <button
            key={star}
            type="button"
            className={local.starBtn}
            aria-label={`Calificar con ${star} ${star === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onRate?.(star)}
          >
            <Star
              size={28}
              color="var(--color-warning)"
              fill={star <= rating ? "var(--color-warning)" : "transparent"}
            />
          </button>
        ) : (
          <span key={star} className={local.starStatic}>
            <Star
              size={size}
              color="var(--color-warning)"
              fill={star <= rating ? "var(--color-warning)" : "transparent"}
              aria-hidden
            />
          </span>
        ),
      )}
    </div>
  );
}

export default function EstablecimientoDetallePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { venue, isLoading, error, handleContact } = useVenueDetail();
  const [redeemCode, setRedeemCode] = useState("");

  const venueId = venue?.id;
  const {
    reviews,
    isLoadingReviews,
    score,
    reviewRating,
    setReviewRating,
    reviewText,
    setReviewText,
    showReviewForm,
    setShowReviewForm,
    handleSubmitReview,
    isSubmittingReview,
    handleClaimCoupon,
    isClaimingCoupon,
    handleRedeemCoupon,
    isRedeemingCoupon,
  } = useVenueReviews(venueId);

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Establecimiento" />
        <Skeleton height={80} borderRadius={24} />
        <div style={{ marginTop: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={80} borderRadius={16} />
        </div>
      </ScreenContainer>
    );
  }

  if (error || !venue) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Establecimiento" />
        <EmptyState
          icon={<Building2 size={28} />}
          title="No pudimos cargar la información del establecimiento"
          subtitle="Puede que ya no exista o que no tengas conexión."
          actionLabel="Volver"
          onAction={() => (window.history.length > 1 ? router.back() : router.replace("/establecimientos"))}
        />
      </ScreenContainer>
    );
  }

  const isOwner = !!user && user.id === venue.owner_id;
  const amenityEntries = venue.amenities ? Object.entries(venue.amenities) : [];
  const hasDiscount = venue.has_coupon || venue.discount_coupon;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Establecimiento"
        onBack={() => (window.history.length > 1 ? router.back() : router.replace("/establecimientos"))}
        actions={
          isOwner
            ? [
                {
                  icon: Edit3,
                  label: "Editar establecimiento",
                  onPress: () => router.push(`/establecimientos/editar/${venue.id}`),
                },
              ]
            : undefined
        }
      />

      <div className={local.venueDetailHeader}>
        <div className={local.iconContainerLg} aria-hidden>
          <Building2 size={40} />
        </div>
        <h1 className={local.venueDetailName}>{venue.name}</h1>
        {score && score.reviews_count > 0 && (
          <div className={local.scoreBadge}>
            <Star size={18} fill="var(--color-warning)" color="var(--color-warning)" aria-hidden />
            <span className={local.scoreValue}>{score.average_rating.toFixed(1)}</span>
            <span className={local.scoreCount}>({score.reviews_count} reseñas)</span>
          </div>
        )}
      </div>

      <section className={local.section}>
        <h2 className={local.sectionTitle}>Ubicación</h2>
        <p className={local.locationRowDetail}>
          <MapPin size={20} color="var(--color-primary)" aria-hidden />
          {venue.address}
        </p>
      </section>

      {amenityEntries.length > 0 && (
        <section className={local.section}>
          <h2 className={local.sectionTitle}>Servicios</h2>
          <div className={local.amenitiesGridDetail}>
            {amenityEntries.map(([key, value]) => (
              <div key={key} className={local.amenityCard}>
                <span className={local.amenityKey}>{key}</span>
                <span className={local.amenityValue}>{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasDiscount && (
        <section className={local.section}>
          <h2 className={local.sectionTitle}>Descuento disponible</h2>
          <div className={local.discountCard}>
            <Tag size={24} aria-hidden />
            <div>
              <p className={local.discountCode}>
                {isOwner && venue.discount_coupon ? venue.discount_coupon : "Cupón de descuento"}
              </p>
              {venue.discount_description && (
                <p className={local.discountDescText}>{venue.discount_description}</p>
              )}
            </div>
          </div>
          {!isOwner && (
            <Button
              label="Obtener mi código"
              icon={<Gift size={18} />}
              variant="gold"
              loading={isClaimingCoupon}
              onPress={handleClaimCoupon}
            />
          )}
          {isOwner && (
            <div className={local.redeemBox}>
              <p className={local.redeemLabel}>
                Canjear el cupón de un cliente (pídele su código):
              </p>
              <input
                className={local.reviewInput}
                placeholder="Código del cupón"
                aria-label="Código del cupón"
                autoCapitalize="characters"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
              />
              <Button
                label="Canjear cupón"
                variant="gold"
                loading={isRedeemingCoupon}
                disabled={!redeemCode.trim()}
                onPress={() => {
                  handleRedeemCoupon(redeemCode.trim());
                  setRedeemCode("");
                }}
              />
            </div>
          )}
        </section>
      )}

      <section className={local.section}>
        <div className={local.sectionTitleRow}>
          <h2 className={local.sectionTitle}>Reseñas</h2>
          {!isOwner && (
            <button
              type="button"
              className={local.addReviewBtn}
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? <X size={16} aria-hidden /> : <MessageSquare size={16} aria-hidden />}
              {showReviewForm ? "Cancelar" : "Escribir"}
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className={local.reviewForm}>
            <p className={local.reviewFormLabel}>Tu calificación</p>
            <StarRow rating={reviewRating} interactive onRate={setReviewRating} />
            <textarea
              className={local.reviewInput}
              placeholder="Escribe tu reseña (opcional)"
              aria-label="Tu reseña"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <Button
              label="Enviar Reseña"
              icon={<Send size={16} />}
              loading={isSubmittingReview}
              onPress={handleSubmitReview}
            />
          </div>
        )}

        {isLoadingReviews ? (
          <div style={{ display: "grid", gap: "var(--space-md)", marginTop: "var(--space-lg)" }}>
            <Skeleton height={64} borderRadius={12} />
            <Skeleton height={64} borderRadius={12} />
          </div>
        ) : reviews.length === 0 ? (
          <p className={local.noReviews}>Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <div className={local.reviewsList}>
            {reviews.map((review) => (
              <article key={review.id} className={local.reviewCard}>
                <div className={local.reviewHeader}>
                  <StarRow rating={review.rating} />
                  <p className={local.reviewDate}>{formatDate(review.created_at)}</p>
                </div>
                {review.review_text ? <p className={local.reviewText}>{review.review_text}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className={local.actionButtons} style={{ paddingBottom: "var(--space-xl)" }}>
        <Button label="Cómo llegar" icon={<MapPin size={18} />} onPress={handleContact} />
      </div>
    </ScreenContainer>
  );
}
