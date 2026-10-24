"use client";

/**
 * ReviewsSection — promedio, listado y formulario de reseña (1–5 estrellas + comentario).
 * Espejo de `mobile/src/components/reviews/ReviewsSection.tsx`. El formulario solo aparece si `canReview`.
 */
import { useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import s from "./reviews.module.css";

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
  author_name?: string | null;
  is_mine?: boolean;
}

export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className={s.starsRow} role={onChange ? "group" : "img"} aria-label={`${Math.round(value)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = <Star size={size} fill={filled ? "currentColor" : "none"} />;
        return onChange ? (
          <button
            key={n}
            type="button"
            className={`${s.starBtn} ${filled ? s.starBtnFilled : ""}`}
            onClick={() => onChange(n)}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            aria-pressed={filled}
          >
            {icon}
          </button>
        ) : (
          <span key={n} className={`${s.starStatic} ${filled ? s.starStaticFilled : ""}`}>
            {icon}
          </span>
        );
      })}
    </div>
  );
}

/** Formulario suelto (estrellas + comentario + enviar), reutilizable dentro de un modal. */
export function ReviewForm({ prompt, submitting, onSubmit }: { prompt: string; submitting?: boolean; onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className={s.form}>
      <p className={s.formPrompt}>{prompt}</p>
      <Stars value={rating} size={30} onChange={setRating} />
      <FormField
        label="Comentario"
        value={comment}
        onChangeText={setComment}
        placeholder="Cuéntanos más (opcional)"
        multiline
        numberOfLines={3}
        maxLength={1000}
      />
      <Button
        label="Enviar reseña"
        onPress={() => onSubmit(rating, comment.trim())}
        loading={submitting}
        disabled={rating === 0 || submitting}
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
  /** Texto del formulario, p. ej. "¿Cómo fue tu experiencia?" */
  formPrompt?: string;
}

export default function ReviewsSection({ title = "Opiniones", average, count, reviews, canReview, submitting, onSubmit, formPrompt = "¿Cómo fue tu experiencia?" }: Props) {
  return (
    <section className={s.card} aria-label={title}>
      <div className={s.header}>
        <h2 className={s.title}>{title}</h2>
        {count > 0 ? (
          <div className={s.avgBox}>
            <Stars value={average} />
            <p className={s.avgText}>{average.toFixed(1)} ({count})</p>
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
        <div className={s.list}>
          {reviews.map((r) => (
            <article key={r.id} className={s.review}>
              <div className={s.reviewHead}>
                <p className={s.reviewAuthor}>{r.is_mine ? "Tú" : r.author_name || "Compra verificada"}</p>
                <Stars value={r.rating} size={13} />
              </div>
              {r.comment ? <p className={s.reviewComment}>{r.comment}</p> : null}
              {r.created_at ? (
                <p className={s.reviewDate}>
                  {new Date(r.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
