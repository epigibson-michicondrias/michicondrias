"use client";

/**
 * Detalle de lugar pet-friendly (`/petfriendly/[id]`).
 * Espejo de `mobile/app/petfriendly/[id].tsx`.
 */
import { useState } from "react";
import Image from "next/image";
import {
  Bone, Check, Globe, Info, MapPin, Phone, Share2, Star,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { usePlaceDetail } from "@/hooks/petfriendly/usePlaceDetail";
import { formatDate } from "@/utils/formatters";
import local from "../petfriendly.module.css";

function isYes(v?: string | null) {
  return ["si", "sí", "yes", "true"].includes((v || "").trim().toLowerCase());
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className={local.starsRow} aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color="var(--color-warning)"
          fill={star <= Math.round(rating) ? "var(--color-warning)" : "transparent"}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ServiceItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`${local.serviceItem} ${active ? local.serviceItemActive : ""}`}>
      <Check size={16} color={active ? "var(--color-primary)" : "var(--color-text-muted)"} aria-hidden />
      {label}
    </div>
  );
}

export default function PetfriendlyDetallePage() {
  const {
    place,
    isLoading,
    openMap,
    callPlace,
    openWebsite,
    sharePlace,
    goBack,
    reviews,
    reviewsLoading,
    isCreatingReview,
    handleCreateReview,
    isOwner,
    handleDelete,
    isDeleting,
  } = usePlaceDetail();

  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Lugar" />
        <Skeleton height={200} borderRadius={16} />
        <div style={{ marginTop: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={56} borderRadius={12} />
          <Skeleton height={120} borderRadius={12} />
        </div>
      </ScreenContainer>
    );
  }

  if (!place) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Lugar" onBack={goBack} />
        <EmptyState
          icon={<MapPin size={28} />}
          title="No pudimos cargar el lugar"
          subtitle="Puede que ya no exista o que no tengas conexión."
          actionLabel="Ver lugares"
          onAction={goBack}
        />
      </ScreenContainer>
    );
  }

  const submitReview = async () => {
    if (formComment.trim().length < 5) {
      showAlert({
        type: "error",
        title: "Comentario corto",
        message: "Por favor escribe un comentario de al menos 5 caracteres.",
      });
      return;
    }
    if (await handleCreateReview(formRating, formComment)) {
      setFormComment("");
      setFormRating(5);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title={place.name}
        subtitle={place.category}
        onBack={goBack}
        rightElement={
          <IconButton icon={Share2} accessibilityLabel="Compartir lugar" onPress={sharePlace} variant="subtle" />
        }
      />

      <div className={local.detailHero}>
        {place.image_url ? (
          <Image
            src={place.image_url}
            alt={`Foto de ${place.name}`}
            fill
            className={local.detailPhoto}
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        ) : (
          <div className={local.detailFallback}>
            <Bone size={64} strokeWidth={1.2} aria-hidden />
          </div>
        )}
      </div>

      <div className={local.actionGrid}>
        <button type="button" className={local.actionBtn} onClick={callPlace} disabled={!place.phone}>
          <Phone size={20} color="var(--color-primary)" aria-hidden />
          Llamar
        </button>
        <button type="button" className={local.actionBtn} onClick={openMap}>
          <MapPin size={20} color="var(--color-primary)" aria-hidden />
          Mapa
        </button>
        <button type="button" className={local.actionBtn} onClick={openWebsite} disabled={!place.website}>
          <Globe size={20} color="var(--color-primary)" aria-hidden />
          Web
        </button>
      </div>

      <section className={local.section}>
        <div className={local.sectionHeader}>
          <Info size={18} color="var(--color-primary)" aria-hidden />
          <h2 className={local.sectionTitle}>Información</h2>
        </div>
        <p className={local.description}>
          {place.description?.trim() || "Este lugar aún no tiene descripción."}
        </p>
      </section>

      <section className={local.section}>
        <div className={local.sectionHeader}>
          <Bone size={18} color="var(--color-primary)" aria-hidden />
          <h2 className={local.sectionTitle}>Servicios para Michis</h2>
        </div>
        <div className={local.servicesGrid}>
          <ServiceItem label="Agua disponible" active={isYes(place.has_water_bowls)} />
          <ServiceItem label="Menú para mascotas" active={isYes(place.has_pet_menu)} />
          <ServiceItem label={`Tamaño: ${place.pet_sizes_allowed || "Todos"}`} active />
        </div>
      </section>

      <section className={local.section}>
        <div className={local.addressCard}>
          <MapPin size={20} color="var(--color-primary)" aria-hidden />
          <div>
            <p className={local.addressTitle}>Ubicación</p>
            <p className={local.addressText}>
              {[place.address, place.city].filter(Boolean).join(", ") || "Sin dirección"}
            </p>
          </div>
        </div>
      </section>

      {isOwner && (
        <button type="button" className={local.dangerLink} onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Eliminando..." : "Eliminar este lugar"}
        </button>
      )}

      <section className={local.section}>
        <div className={local.sectionHeader}>
          <Star size={18} color="var(--color-primary)" aria-hidden />
          <h2 className={local.sectionTitle}>Puntos Michi (Reseñas)</h2>
        </div>

        <div className={local.ratingSummaryCard}>
          <div className={local.summaryLeft}>
            <span className={local.bigRating}>{place.rating ? place.rating.toFixed(1) : "—"}</span>
            <StarRow rating={place.rating || 0} />
            <span className={local.totalReviewsText}>
              {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </span>
          </div>
          <div className={local.summarySeparator} aria-hidden />
          <p className={local.summaryDescription}>
            Opiniones y valoraciones de la comunidad sobre la hospitalidad pet-friendly en este establecimiento.
          </p>
        </div>

        {/* Quien registró el lugar no se reseña a sí mismo (el backend responde 403) */}
        {!isOwner && (
          <div className={local.writeReviewCard}>
            <p className={local.writeReviewTitle}>Escribe tu opinión</p>
            <p className={local.writeReviewSubtitle}>
              ¿Qué te pareció el lugar y su trato con las mascotas?
            </p>
            <div className={local.interactiveStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={local.starBtn}
                  aria-label={`Calificar con ${star} ${star === 1 ? "estrella" : "estrellas"}`}
                  onClick={() => setFormRating(star)}
                >
                  <Star
                    size={28}
                    color="var(--color-warning)"
                    fill={star <= formRating ? "var(--color-warning)" : "transparent"}
                  />
                </button>
              ))}
            </div>
            <textarea
              className={local.commentInput}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Escribe tu reseña aquí (mínimo 5 caracteres)..."
              aria-label="Tu reseña"
            />
            <Button label="Publicar reseña" onPress={submitReview} loading={isCreatingReview} />
          </div>
        )}

        <div className={local.reviewsList}>
          {reviewsLoading ? (
            <>
              <Skeleton height={72} borderRadius={16} />
              <Skeleton height={72} borderRadius={16} />
            </>
          ) : reviews.length === 0 ? (
            <p className={local.emptyReviewsText}>
              Aún no hay opiniones. ¡Sé el primero en dejar una reseña!
            </p>
          ) : (
            reviews.map((rev) => (
              <article key={rev.id} className={local.reviewItemCard}>
                <div className={local.reviewItemHeader}>
                  <div className={local.reviewAvatar} aria-hidden>
                    V
                  </div>
                  <div className={local.reviewMeta}>
                    <p className={local.reviewUserName}>Visitante</p>
                    <StarRow rating={rev.rating} size={12} />
                  </div>
                  <p className={local.reviewDate}>{formatDate(rev.created_at)}</p>
                </div>
                {rev.comment ? <p className={local.reviewCommentText}>{rev.comment}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </ScreenContainer>
  );
}
