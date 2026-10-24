"use client";

/**
 * Perfil de especialista: datos, contacto rápido, clínica donde atiende, servicios y reseñas.
 * Espejo de `mobile/app/directorio/especialista/[id].tsx`.
 */
import {
  Building2,
  Calendar,
  ChevronRight,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Stethoscope,
  UserX,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ListRow from "@/components/ListRow";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import ContactActions from "@/features/directorio/ContactActions";
import ReviewsSection from "@/features/directorio/ReviewsSection";
import { useVetDetail } from "@/hooks/directorio/useVetDetail";
import { useVetReviews } from "@/hooks/directorio/useVetReviews";
import { formatCurrency } from "@/utils/formatters";
import { getS3Url } from "@/utils/helpers";
import s from "./especialista.module.css";

export default function EspecialistaDetailPage() {
  const v = useVetDetail();
  const { specialist, clinic, services } = v;
  const { rating, reviews, handleCreateReview, isCreatingReview } = useVetReviews(v.vetId);

  if (v.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Especialista" />
        <div className={s.content}>
          <Skeleton width={88} height={88} borderRadius={44} style={{ margin: "0 auto" }} />
          <Skeleton width="55%" height={24} style={{ margin: "0 auto" }} />
          <Skeleton height={56} />
          <Skeleton height={140} />
        </div>
      </ScreenContainer>
    );
  }

  if (!specialist) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Especialista" />
        <EmptyState
          icon={<UserX size={28} />}
          title={v.isError ? "No pudimos cargar este perfil" : "No encontramos a este especialista"}
          subtitle={v.isError ? "Revisa tu conexión e inténtalo de nuevo." : "Puede que ya no esté en el directorio."}
          actionLabel={v.isError ? "Reintentar" : "Ver directorio"}
          onAction={v.isError ? () => v.refetch() : v.goBack}
        />
      </ScreenContainer>
    );
  }

  const total = rating?.total_reviews ?? 0;

  return (
    <ScreenContainer>
      <ScreenHeader
        title={v.fullName}
        subtitle={v.specialtyLabel}
        actions={[{ icon: Share2, label: "Compartir perfil", onPress: v.share }]}
      />

      <div className={s.content}>
        <div className={s.hero}>
          <div className={s.avatar}>
            {specialist.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto del storage
              <img src={getS3Url(specialist.photo_url)} alt={`Foto de ${v.fullName}`} className={s.avatarImg} />
            ) : (
              <span className={s.avatarLetter}>{v.avatarLetter}</span>
            )}
          </div>
          <h2 className={s.name}>{v.fullName}</h2>
          <p className={s.specialty}>{v.specialtyLabel}</p>
          <div className={s.meta}>
            <Star
              size={16}
              color="var(--color-accent)"
              fill={total > 0 ? "var(--color-accent)" : "transparent"}
              aria-hidden
            />
            <span className={s.metaStrong}>{total > 0 ? Number(rating!.average_rating || 0).toFixed(1) : "Nuevo"}</span>
            <span className={s.metaMuted}>
              · {total} {total === 1 ? "reseña" : "reseñas"}
            </span>
          </div>
          {specialist.license_number ? (
            <Badge
              label={`Cédula ${specialist.license_number}`}
              color="var(--color-success)"
              size="sm"
              icon={<ShieldCheck size={12} />}
            />
          ) : null}
        </div>

        {v.call || clinic ? (
          <ContactActions
            actions={[
              v.call ? { icon: Phone, label: "Llamar", color: "var(--color-primary)", onPress: v.call } : null,
              v.whatsapp
                ? { icon: MessageCircle, label: "WhatsApp", color: "var(--color-success)", onPress: v.whatsapp }
                : null,
              clinic
                ? {
                    icon: Building2,
                    label: "Su clínica",
                    color: "var(--color-info)",
                    onPress: v.openClinic,
                  }
                : null,
            ]}
          />
        ) : null}

        {specialist.bio ? (
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Sobre mí</h3>
            <p className={s.body}>{specialist.bio}</p>
          </section>
        ) : null}

        {clinic ? (
          <ListRow
            icon={Building2}
            label={clinic.name}
            desc={[clinic.address, clinic.city].filter(Boolean).join(", ") || "Ver clínica"}
            onPress={v.openClinic}
          />
        ) : null}

        {v.canBook ? (
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Servicios</h3>
            {services.length === 0 ? (
              <p className={s.body}>Aún no hay servicios para agendar en línea.</p>
            ) : (
              <div className={s.services}>
                {services.map((service) => {
                  const name = service.name?.trim() || "Servicio";
                  return (
                    <button
                      key={service.id}
                      type="button"
                      className={s.service}
                      onClick={() => v.book(service.id)}
                      aria-label={`Agendar ${name}`}
                    >
                      <span className={s.serviceInfo}>
                        <span className={s.serviceName}>{name}</span>
                        <span className={s.serviceMeta}>
                          {service.duration_minutes ? `${service.duration_minutes} min` : "Duración por acordar"}
                        </span>
                      </span>
                      <span className={s.servicePrice}>
                        {service.price != null ? formatCurrency(Number(service.price)) : "Consultar"}
                      </span>
                      <ChevronRight size={16} color="var(--color-text-muted)" aria-hidden />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div className={s.note}>
            <Stethoscope size={15} color="var(--color-info)" />
            <p className={s.body}>
              {clinic
                ? "Su clínica aún no tiene servicios para agendar en línea: contáctalo directo."
                : "Atiende por su cuenta: contáctalo directo para acordar la consulta."}
            </p>
          </div>
        )}

        <ReviewsSection
          title="Opiniones"
          average={Number(rating?.average_rating ?? 0)}
          count={total}
          reviews={reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            author_name: "Cliente",
          }))}
          canReview={v.canReview}
          submitting={isCreatingReview}
          onSubmit={(value, comment) => handleCreateReview(value, comment || undefined)}
          formPrompt="¿Cómo te atendió?"
        />
      </div>

      <div className={s.footer}>
        {v.canBook ? (
          <Button label="Agendar cita" icon={<Calendar size={18} />} onPress={() => v.book()} size="lg" />
        ) : v.whatsapp || v.call ? (
          <Button
            label={v.whatsapp ? "Escribir por WhatsApp" : "Llamar"}
            icon={v.whatsapp ? <MessageCircle size={18} /> : <Phone size={18} />}
            onPress={(v.whatsapp ?? v.call)!}
            size="lg"
          />
        ) : null}
      </div>
    </ScreenContainer>
  );
}
