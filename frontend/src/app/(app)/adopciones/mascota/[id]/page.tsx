"use client";

/**
 * Detalle de mascota en adopción (`/adopciones/mascota/[id]`).
 * Espejo de `mobile/app/adopciones/[id].tsx`.
 */
import Image from "next/image";
import {
  PawPrint, MapPin, Heart, ClipboardList, Send, Home, Trees, Baby, Clock, Wallet, Thermometer, Zap,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useListingDetail } from "@/hooks/adopciones/useListingDetail";
import { getSpeciesLabel, getGenderLabel, formatAge, capitalize } from "@/utils/formatters";
import local from "@/features/adopciones/adopciones.module.css";

function Fact({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className={local.fact}>
      <Icon size={16} className={local.factIcon} aria-hidden />
      <span>{label}</span>
      <span className={local.factValue}>{value}</span>
    </div>
  );
}

export default function MascotaAdopcionPage() {
  const { listing, isLoading, goBack, goToApply, goToMyRequests, goToRequests, myRequest, isOwner } =
    useListingDetail();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mascota" />
        <Skeleton height={220} borderRadius={16} />
        <div style={{ marginTop: "var(--space-lg)", display: "grid", gap: "var(--space-md)" }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
          <Skeleton height={120} borderRadius={12} />
        </div>
      </ScreenContainer>
    );
  }

  if (!listing) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mascota" />
        <EmptyState
          icon={<Heart size={28} />}
          title="No encontramos esta mascota"
          subtitle="Puede que se haya retirado o que no tengas acceso."
        />
      </ScreenContainer>
    );
  }

  const species = listing.species.toLowerCase();
  const gender = getGenderLabel(listing.gender);

  return (
    <ScreenContainer>
      <ScreenHeader
        title={listing.name}
        subtitle={`${getSpeciesLabel(species)}${listing.breed ? ` · ${capitalize(listing.breed)}` : ""}`}
        onBack={goBack}
      />

      <div className={local.detailHero}>
        {listing.photo_url ? (
          <Image
            src={listing.photo_url}
            alt={listing.name}
            fill
            className={local.detailPhoto}
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        ) : (
          <div className={local.detailFallback}>
            <PawPrint size={64} strokeWidth={1.2} aria-hidden />
          </div>
        )}
      </div>

      <div className={local.badgeRow}>
        {listing.is_emergency ? <Badge label="Urgente" color="var(--error)" variant="solid" /> : null}
        {listing.is_sterilized ? <Badge label="Esterilizado" color="var(--primary)" /> : null}
        {listing.is_vaccinated ? <Badge label="Vacunado" color="var(--success)" /> : null}
        {listing.is_dewormed ? <Badge label="Desparasitado" color="var(--info)" /> : null}
      </div>

      <p className={local.detailMeta}>
        {gender} · {formatAge(listing.age_months)}
        {listing.weight_kg ? ` · ${listing.weight_kg} kg` : ""}
        {listing.location ? ` · ${listing.location}` : ""}
      </p>

      {listing.description ? (
        <div className={local.section}>
          <h2 className={local.sectionTitle}>Su historia</h2>
          <p className={local.desc}>{listing.description}</p>
        </div>
      ) : null}

      <div className={local.section}>
        <h2 className={local.sectionTitle}>Sobre él/ella</h2>
        <Card>
          <div className={local.facts}>
            <Fact icon={Home} label="Tamaño" value={listing.size ? capitalize(listing.size) : "Sin dato"} />
            <Fact icon={Trees} label="Patio" value={listing.social_dogs ? "Convive con perros" : "Prefiere ser único"} />
            <Fact icon={Baby} label="Niños" value={listing.social_children ? "Sí" : "No"} />
            <Fact icon={Clock} label="Energía" value={listing.energy_level || "Sin dato"} />
            <Fact icon={Thermometer} label="Temperamento" value={listing.temperament || "Sin dato"} />
            <Fact icon={Zap} label="Con gatos" value={listing.social_cats ? "Sí" : "No"} />
            <Fact icon={Wallet} label="Con perros" value={listing.social_dogs ? "Sí" : "No"} />
          </div>
        </Card>
      </div>

      <div className={local.actions}>
        {isOwner ? (
          <Button
            label="Ver solicitudes"
            icon={<ClipboardList size={18} />}
            onPress={goToRequests}
          />
        ) : myRequest ? (
          <>
            <Button label="Ver mi solicitud" icon={<ClipboardList size={18} />} onPress={goToMyRequests} />
            <p className={local.detailMeta} style={{ textAlign: "center" }}>
              Ya enviaste una solicitud para esta mascota.
            </p>
          </>
        ) : (
          <Button
            label="Solicitar adopción"
            icon={<Send size={18} />}
            onPress={goToApply}
            disabled={listing.status === "adoptado"}
          />
        )}
      </div>
    </ScreenContainer>
  );
}
