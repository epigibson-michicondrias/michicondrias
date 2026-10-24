"use client";

/**
 * Piezas de la ficha de proveedor (paseadores, cuidadores).
 * Espejo de `mobile/src/features/proveedor/ProviderProfile.tsx`.
 */
import { useState, type ReactNode } from "react";
import { MapPin, Star } from "lucide-react";
import Button from "@/components/Button";
import s from "./servicios-pro.module.css";

// ── Hero (avatar + nombre + especialidad + rating) ──
export function ProviderHero({
  photoUrl, name, subtitle, rating, reviewCount, accent,
}: {
  photoUrl?: string | null;
  name: string;
  subtitle?: string | null;
  rating?: number;
  reviewCount?: number;
  accent: string;
}) {
  return (
    <div className={s.hero} style={{ ["--c" as string]: accent }}>
      <div className={s.heroAvatar}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- la foto del proveedor viene del storage
          <img src={photoUrl} alt="" className={s.avatarImg} />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <p className={s.heroName}>{name}</p>
      {subtitle ? <p className={s.heroSubtitle}>{subtitle}</p> : null}
      {typeof rating === "number" ? (
        <div className={s.rating}>
          <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" aria-hidden />
          {rating.toFixed(1)}
          {reviewCount ? <span className={s.priceUnit}>({reviewCount})</span> : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Stats (fila de métricas) ──
export function ProviderStats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className={s.statsRow}>
      {items.map((item, i) => (
        <div key={item.label} style={{ display: "contents" }}>
          {i > 0 ? <div className={s.statDivider} aria-hidden /> : null}
          <div className={s.statBlock}>
            <span className={s.statNumber}>{item.value}</span>
            <span className={s.statLabel}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sección con título ──
export function ProviderSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <p className={s.sectionTitle}>{title}</p>
      {children}
    </section>
  );
}

// ── Bio ──
export function ProviderBio({ text }: { text: string }) {
  return <p className={s.reviewComment}>{text}</p>;
}

// ── Servicios (lista de chips) ──
export function ProviderServices({ services }: { services: { name: string; active?: boolean; icon?: ReactNode }[] }) {
  return (
    <div className={s.servicesGrid}>
      {services.map((sv) => (
        <div key={sv.name} className={`${s.serviceCard} ${sv.active ? s.serviceActive : s.serviceInactive}`}>
          {sv.icon}
          {sv.name}
        </div>
      ))}
    </div>
  );
}

// ── Ubicación ──
export function ProviderLocation({ text, extra }: { text: string; extra?: string }) {
  return (
    <div className={s.locationRow}>
      <MapPin size={18} color="var(--color-primary)" aria-hidden />
      <div>
        {text}
        {extra ? <span className={s.locationExtra}>{extra}</span> : null}
      </div>
    </div>
  );
}

// ── Precio ──
export function ProviderPrice({ label, amount }: { label: string; amount: string }) {
  return (
    <div className={s.priceRow}>
      <span className={s.priceLabel}>{label}</span>
      <span className={s.priceAmount}>{amount}</span>
    </div>
  );
}

// ── Resumen de rating ──
export function ProviderRatingSummary({ rating, count }: { rating: number; count: number }) {
  return (
    <div className={s.ratingSummary}>
      <span className={s.ratingBig}>{rating.toFixed(1)}</span>
      <Stars value={rating} />
      <span className={s.priceUnit}>
        {count} reseña{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <div className={s.starsRow} aria-label={`${Math.round(value)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color="var(--color-warning)"
          fill={i <= Math.round(value) ? "var(--color-warning)" : "transparent"}
          aria-hidden
        />
      ))}
    </div>
  );
}

// ── Lista de reseñas ──
export function ProviderReviews({
  reviews,
}: {
  reviews: { id: string; user_name?: string | null; rating: number; comment?: string | null; created_at?: string | null }[];
}) {
  if (reviews.length === 0) {
    return <p className={s.reviewComment}>Aún no hay opiniones. Sé la primera persona en dejar una.</p>;
  }
  return (
    <div className={s.reviewList}>
      {reviews.map((r) => (
        <div key={r.id} className={s.reviewCard}>
          <div className={s.reviewHeader}>
            <div className={s.reviewAvatar}>{(r.user_name || "?").charAt(0).toUpperCase()}</div>
            <div>
              <p className={s.reviewName}>{r.user_name || "Usuario"}</p>
              <Stars value={r.rating} size={12} />
            </div>
          </div>
          {r.comment ? <p className={s.reviewComment}>{r.comment}</p> : null}
        </div>
      ))}
    </div>
  );
}

// ── Formulario de reseña ──
export function ProviderReviewForm({ onSubmit, isSubmitting }: {
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting?: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <div className={s.reviewForm}>
      <p className={s.sectionTitle}>Escribir reseña</p>
      <div className={s.starsRow} role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
            className={s.starBtn}
            onClick={() => setRating(i)}
          >
            <Star
              size={28}
              color="var(--color-warning)"
              fill={i <= rating ? "var(--color-warning)" : "transparent"}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <label className={s.dateField}>
        <span className={s.dateLabel}>Cuéntanos tu experiencia…</span>
        <textarea
          className={s.dateInput}
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Cómo fue el servicio?"
        />
      </label>
      <Button
        label="Publicar reseña"
        onPress={() => onSubmit(rating, comment)}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );
}

// ── CTA fijo abajo ──
export function ProviderFooter({ label, onPress, disabled, icon }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className={s.detailFooter}>
      <Button label={label} onPress={onPress} disabled={disabled} icon={icon} size="lg" />
    </div>
  );
}
