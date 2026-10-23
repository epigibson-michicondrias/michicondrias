"use client";

/**
 * Tarjetas del listado del directorio (clínica y especialista).
 * Espejo de `renderClinicItem` / `renderVetItem` en `mobile/app/directorio/index.tsx`.
 */
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import type { Clinic, Vet } from "@/types/directorio";
import s from "./cards.module.css";

function RatingInline({ average, total }: { average?: number; total?: number }) {
  if (!total) return <span className={s.ratingMuted}>Sin reseñas</span>;
  return (
    <span className={s.ratingRow}>
      <Star size={13} color="var(--color-warning)" fill="var(--color-warning)" aria-hidden />
      <span className={s.ratingValue}>{Number(average || 0).toFixed(1)}</span>
      <span className={s.ratingMuted}>({total})</span>
    </span>
  );
}

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  return (
    <Link href={`/directorio/clinica/${clinic.id}`} className={s.card}>
      <div className={s.cardHeader}>
        <div className={`${s.avatar} ${s.avatarPrimary}`} aria-hidden>
          {clinic.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={clinic.logo_url} alt="" className={s.avatarImg} />
          ) : (
            clinic.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={s.cardMainInfo}>
          <p className={s.cardTitle}>{clinic.name}</p>
          <div className={s.cardSubrows}>
            <span className={s.locationRow}>
              <MapPin size={13} color="var(--color-text-muted)" aria-hidden />
              <span className={s.cardSubtitle}>
                {[clinic.city, clinic.state].filter(Boolean).join(", ") || "Ubicación no indicada"}
              </span>
            </span>
            <RatingInline average={clinic.average_rating} total={clinic.total_reviews} />
          </div>
        </div>
        <ChevronRight size={20} color="var(--color-text-muted)" aria-hidden />
      </div>

      <div className={s.cardBody}>
        <div className={s.tagsRow}>
          {clinic.is_24_hours ? (
            <span className={`${s.tag} ${s.tagInfo}`}>
              <Clock size={12} aria-hidden /> 24 Horas
            </span>
          ) : null}
          {clinic.has_emergency ? (
            <span className={`${s.tag} ${s.tagError}`}>
              <Navigation size={12} aria-hidden /> Urgencias
            </span>
          ) : null}
          {!clinic.is_24_hours && !clinic.has_emergency ? (
            <span className={s.tag}>
              <Clock size={12} aria-hidden /> Horario Regular
            </span>
          ) : null}
        </div>
        {clinic.services && clinic.services.length > 0 ? (
          <p className={s.servicesRow}>
            <span className={s.servicesLabel}>Servicios: </span>
            <span className={s.servicesList}>{clinic.services.join(", ")}</span>
          </p>
        ) : null}
        {clinic.description ? <p className={s.description}>{clinic.description}</p> : null}
      </div>
    </Link>
  );
}

export function VetCard({ vet }: { vet: Vet }) {
  return (
    <Link href={`/directorio/especialista/${vet.id}`} className={s.card}>
      <div className={s.cardHeader}>
        <div className={`${s.avatar} ${s.avatarSuccess}`} aria-hidden>
          {vet.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vet.photo_url} alt="" className={s.avatarImg} />
          ) : (
            vet.first_name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={s.cardMainInfo}>
          <p className={s.cardTitle}>
            {vet.first_name} {vet.last_name}
          </p>
          <div className={s.cardSubrows}>
            <span className={s.locationRow}>
              <Stethoscope size={13} color="var(--color-primary)" aria-hidden />
              <span className={s.specialty}>{vet.specialty || "Médico Veterinario"}</span>
            </span>
            <RatingInline average={vet.average_rating} total={vet.total_reviews} />
          </div>
        </div>
        <ChevronRight size={20} color="var(--color-text-muted)" aria-hidden />
      </div>

      {vet.bio ? <p className={s.description}>{vet.bio}</p> : null}

      {vet.license_number ? (
        <div className={s.certification}>
          <ShieldCheck size={14} aria-hidden /> Cédula registrada
        </div>
      ) : null}
    </Link>
  );
}
