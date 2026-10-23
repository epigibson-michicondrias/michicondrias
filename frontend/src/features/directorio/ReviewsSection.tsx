"use client";

/**
 * Reseñas: estrellas, formulario y listado (espejo de `mobile/src/components/reviews/ReviewsSection.tsx`).
 */
import { useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/Button";
import s from "./reviews.module.css";

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
  author_name?: string | null;
  is_mine?: boolean;
}

export function Stars({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className={s.starsRow} aria-label={`${Math.round(value)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = (
          <Star
            size={size}
            color={filled ? "var(--color-accent)" : "var(--color-text-muted)"}
            fill={filled ? "var(--color-accent)" : "transparent"}
            aria-hidden
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            className={s.starBtn}
            onClick={() => onChange(n)}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </div>
  );
}

function ReviewForm({
  prompt,
  submitting,
  onSubmit,
}: {
  prompt: string;
  submitting?: boolean;
  onSubmit: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div className={s.form}>
      <p className={s.formPrompt}>{prompt}</p>
      <Stars value={rating} size={28} onChange={setRating} />
      <textarea
        className={s.input}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos más (opcional)"
        rows={3}
        maxLength={1000}
        aria-label="Comentario de la reseña"
      />
      <Button
        label="Enviar reseña"
        onPress={() => onSubmit(rating, comment.trim())}
        disabled={rating === 0}
        loading={submitting}
      />
    </div>
  );
}

interface Props {
  title?: string;
  average: number;
  count: number;
  reviews: ReviewItem[];
  canReview?: boolean;
  submitting?: boolean;
  onSubmit?: (rating: number, comment: string) => void;
  formPrompt?: string;
}

export default function ReviewsSection({
  title = "Reseñas",
  average,
  count,
  reviews,
  canReview,
  submitting,
  onSubmit,
  formPrompt = "¿Cómo fue tu experiencia?",
}: Props) {
  return (
    <section className={s.card} aria-label={title}>
      <div className={s.header}>
        <h2 className={s.title}>{title}</h2>
        {count > 0 ? (
          <div className={s.avgBox}>
            <Stars value={average} />
            <p className={s.avgText}>
              {average.toFixed(1)} ({count})
            </p>
          </div>
        ) : null}
      </div>

      {canReview && onSubmit ? (
        <div className={s.formWrap}>
          <ReviewForm prompt={formPrompt} submitting={submitting} onSubmit={onSubmit} />
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <p className={s.empty}>Aún no hay reseñas.</p>
      ) : (
        reviews.map((r) => (
          <article key={r.id} className={s.review}>
            <div className={s.reviewHead}>
              <p className={s.author}>{r.is_mine ? "Tú" : r.author_name || "Usuario"}</p>
              <Stars value={r.rating} size={13} />
            </div>
            {r.comment ? <p className={s.comment}>{r.comment}</p> : null}
            {r.created_at ? (
              <p className={s.date}>
                {new Date(r.created_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}
