"use client";

/**
 * Detalle de clínica: datos, contacto rápido, servicios (cada uno agenda directo) y reseñas.
 * Espejo de `mobile/app/directorio/clinica/[id].tsx`.
 */
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Globe,
  Hospital,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import ContactActions from "@/features/directorio/ContactActions";
import ReviewsSection from "@/features/directorio/ReviewsSection";
import { useClinicDetail } from "@/hooks/directorio/useClinicDetail";
import { formatCurrency } from "@/utils/formatters";
import { getS3Url } from "@/utils/helpers";
import s from "./clinica.module.css";

export default function ClinicDetailPage() {
  const c = useClinicDetail();
  const { clinic, rating, services, reviews } = c;

  if (!c.isLoading && !clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Clínica" />
        <EmptyState
          icon={<Hospital size={28} />}
          title="No encontramos esta clínica"
          subtitle="Puede que ya no esté en el directorio o que no tengas conexión."
          actionLabel="Ver directorio"
          onAction={c.goBack}
        />
      </ScreenContainer>
    );
  }

  if (c.isLoading || !clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Clínica" />
        <div className={s.content}>
          <Skeleton width={72} height={72} borderRadius={16} style={{ margin: "0 auto" }} />
          <Skeleton width="60%" height={24} style={{ margin: "0 auto" }} />
          <Skeleton height={56} />
          <Skeleton height={160} />
        </div>
      </ScreenContainer>
    );
  }

  const place = [clinic.address, clinic.city].filter(Boolean).join(", ");
  const total = rating?.total_reviews ?? 0;

  return (
    <ScreenContainer>
      <ScreenHeader
        title={clinic.name}
        subtitle={place || undefined}
        actions={[{ icon: Share2, label: "Compartir clínica", onPress: c.share }]}
      />

      <div className={s.content}>
        {/* Encabezado */}
        <div className={s.hero}>
          <div className={s.logo}>
            {clinic.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo del storage
              <img src={getS3Url(clinic.logo_url)} alt={`Logo de ${clinic.name}`} className={s.logoImg} />
            ) : (
              <Hospital size={36} color="var(--color-primary)" aria-hidden />
            )}
          </div>
          <h2 className={s.name}>{clinic.name}</h2>
          <div className={s.meta}>
            <Star
              size={16}
              color="var(--color-accent)"
              fill={total > 0 ? "var(--color-accent)" : "transparent"}
              aria-hidden
            />
            <span className={s.metaStrong}>{total > 0 ? rating!.average_rating.toFixed(1) : "Nueva"}</span>
            <span className={s.metaMuted}>
              · {total} {total === 1 ? "reseña" : "reseñas"}
            </span>
          </div>
          {place ? (
            <div className={s.meta}>
              <MapPin size={13} color="var(--color-text-muted)" aria-hidden />
              <span className={s.metaMuted}>{place}</span>
            </div>
          ) : null}
          {clinic.is_24_hours || clinic.has_emergency ? (
            <div className={s.badges}>
              {clinic.is_24_hours ? (
                <Badge label="24 horas" color="var(--color-info)" size="sm" icon={<Clock size={12} />} />
              ) : null}
              {clinic.has_emergency ? (
                <Badge label="Urgencias" color="var(--color-error)" size="sm" icon={<AlertTriangle size={12} />} />
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Contacto rápido: solo lo que la clínica tiene registrado */}
        <ContactActions
          actions={[
            c.call ? { icon: Phone, label: "Llamar", color: "var(--color-primary)", onPress: c.call } : null,
            c.whatsapp
              ? { icon: MessageCircle, label: "WhatsApp", color: "var(--color-success)", onPress: c.whatsapp }
              : null,
            { icon: Navigation, label: "Cómo llegar", color: "var(--color-info)", onPress: c.directions },
            c.website ? { icon: Globe, label: "Sitio web", color: "var(--color-accent)", onPress: c.website } : null,
          ]}
        />

        {clinic.description ? (
          <section className={s.section}>
            <h3 className={s.sectionTitle}>Sobre la clínica</h3>
            <p className={s.body}>{clinic.description}</p>
          </section>
        ) : null}

        <section className={s.section}>
          <h3 className={s.sectionTitle}>Servicios</h3>
          {services.length === 0 ? (
            <p className={s.body}>
              Aún no hay servicios para agendar en línea. Puedes llamar a la clínica.
            </p>
          ) : (
            <div className={s.services}>
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={s.service}
                  onClick={() => c.book(service.id)}
                  aria-label={`Agendar ${service.name}`}
                >
                  <span className={s.serviceInfo}>
                    <span className={s.serviceName}>{service.name}</span>
                    <span className={s.serviceMeta}>{service.duration_minutes} min</span>
                  </span>
                  <span className={s.servicePrice}>
                    {service.price ? formatCurrency(Number(service.price)) : "Consultar"}
                  </span>
                  <ChevronRight size={16} color="var(--color-text-muted)" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </section>

        <ReviewsSection
          title="Opiniones"
          average={rating?.average_rating ?? 0}
          count={total}
          reviews={reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            author_name: "Cliente",
          }))}
          canReview={c.canReview}
          submitting={c.isCreatingReview}
          onSubmit={(value, comment) => c.handleCreateReview(value, comment || undefined)}
          formPrompt="¿Cómo te atendieron?"
        />
      </div>

      <div className={s.footer}>
        <Button
          label="Agendar cita"
          icon={<Calendar size={18} />}
          onPress={() => c.book()}
          size="lg"
        />
      </div>
    </ScreenContainer>
  );
}
