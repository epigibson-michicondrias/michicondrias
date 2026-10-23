"use client";

/**
 * ProviderCard — tarjeta de paseador o cuidador en el listado.
 * Toda la tarjeta abre el perfil (sin botón anidado).
 */
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Star } from "lucide-react";
import Badge from "@/components/Badge";
import s from "./servicios-pro.module.css";

type IconType = ComponentType<{ size?: number; color?: string }>;

export interface ProviderCardProps {
  href: string;
  name: string;
  photoUrl?: string | null;
  location?: string | null;
  rating?: number;
  verified?: boolean;
  /** Color de identidad del módulo (avatar). */
  accent: string;
  stats: { icon: IconType; text: string }[];
  tags: { label: string; color: string; icon?: ReactNode }[];
  price: string;
  priceUnit?: string;
  bio?: string | null;
}

export default function ProviderCard({
  href, name, photoUrl, location, rating, verified, accent, stats, tags, price, priceUnit, bio,
}: ProviderCardProps) {
  return (
    <Link href={href} className={s.providerCard} style={{ ["--c" as string]: accent }} aria-label={`Ver perfil de ${name}`}>
      <div className={s.providerHeader}>
        <div className={s.avatar}>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- la foto del proveedor viene del storage
            <img src={photoUrl} alt="" className={s.avatarImg} />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className={s.providerInfo}>
          <p className={s.providerName}>{name}</p>
          <p className={s.metaRow}>
            <MapPin size={14} aria-hidden />
            <span>{location || "Ubicación no disponible"}</span>
          </p>
        </div>
        <div className={s.rating}>
          <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" aria-hidden />
          {rating ? rating.toFixed(1) : "Nuevo"}
        </div>
      </div>

      <div className={s.providerStats}>
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.text} className={s.statItem}>
              <Icon size={14} color="var(--color-text-muted)" />
              {st.text}
            </div>
          );
        })}
      </div>

      <div className={s.tagRow}>
        {tags.map((t) => (
          <Badge key={t.label} label={t.label} color={t.color} icon={t.icon} size="sm" />
        ))}
        {verified ? <Badge label="Verificado" color="var(--color-success)" size="sm" /> : null}
      </div>

      {bio ? <p className={s.bioText}>{bio}</p> : null}

      <div className={s.providerFooter}>
        <p className={s.priceText}>
          {price}
          {priceUnit ? <span className={s.priceUnit}>{priceUnit}</span> : null}
        </p>
        <span className={s.seeProfile} aria-hidden>
          Ver perfil
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}
