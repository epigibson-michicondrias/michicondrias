"use client";

/**
 * Tarjeta de mascota en adopción (grid o fila). Espejo de `MediaCard`/`MediaRow` de la app.
 */
import Image from "next/image";
import Link from "next/link";
import { Dog, Cat, PawPrint, MapPin } from "lucide-react";
import Badge from "@/components/Badge";
import { getSpeciesLabel, capitalize } from "@/utils/formatters";
import type { Listing } from "@/types/adopciones";
import s from "./adopciones.module.css";

const SPECIES_ICONS: Record<string, typeof Dog> = { gato: Cat, perro: Dog };

interface ListingCardProps {
  listing: Listing;
  /** Vista compacta (fila) en vez de tarjeta. */
  compact?: boolean;
}

export default function ListingCard({ listing, compact }: ListingCardProps) {
  const species = listing.species.toLowerCase();
  const SpeciesIcon = SPECIES_ICONS[species] ?? PawPrint;
  const gender = listing.gender === "hembra" ? "Hembra" : "Macho";
  const breedLine = `${listing.breed ? capitalize(listing.breed) : "Mestizo"} · ${gender}`;
  const placeLine = listing.location || "Sin ubicación";
  const href = `/adopciones/mascota/${listing.id}`;

  if (compact) {
    return (
      <Link href={href} className={s.listingRow}>
        <div className={s.listingRowPhoto}>
          {listing.photo_url ? (
            <Image src={listing.photo_url} alt={listing.name} width={64} height={64} className={s.listingPhoto} />
          ) : (
            <SpeciesIcon size={28} aria-hidden />
          )}
        </div>
        <div className={s.listingRowBody}>
          <p className={s.listingName}>{listing.name}</p>
          <p className={s.listingMeta}>{breedLine}</p>
          <p className={s.listingMeta}>
            <MapPin size={12} style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden />
            {placeLine}
          </p>
        </div>
        {listing.is_emergency ? <Badge label="Urgente" color="var(--error)" variant="solid" size="sm" /> : null}
      </Link>
    );
  }

  return (
    <Link href={href} className={s.listingCard}>
      <div className={s.listingVisual}>
        {listing.photo_url ? (
          <Image src={listing.photo_url} alt={listing.name} fill className={s.listingPhoto} sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className={s.listingFallback}>
            <SpeciesIcon size={48} strokeWidth={1.5} aria-hidden />
          </div>
        )}
        {listing.is_emergency ? (
          <span className={s.listingUrgent}>
            <Badge label="Urgente" color="var(--error)" variant="solid" size="sm" />
          </span>
        ) : null}
      </div>
      <div className={s.listingBody}>
        <p className={s.listingName}>{listing.name}</p>
        <p className={s.listingMeta}>{breedLine}</p>
        <p className={s.listingMeta}>
          <MapPin size={12} style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden />
          {placeLine}
        </p>
        <div className={s.listingChips}>
          {listing.is_sterilized ? <span className={s.listingChip}>Esterilizado</span> : null}
          {listing.is_vaccinated ? <span className={s.listingChip}>Vacunado</span> : null}
          <span className={s.listingChip}>{getSpeciesLabel(species)}</span>
        </div>
      </div>
    </Link>
  );
}
