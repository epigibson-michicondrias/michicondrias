"use client";

/**
 * Tarjeta de reporte de mascota perdida/encontrada (grid o fila).
 * Espejo de `mobile/src/features/perdidas/ReportCard.tsx`.
 */
import Image from "next/image";
import Link from "next/link";
import { Cat, Clock, Dog, MapPin, PawPrint } from "lucide-react";
import Badge from "@/components/Badge";
import { getTimeAgo, sentenceCase } from "@/utils/formatters";
import type { LostPetReport } from "@/services/perdidas";
import s from "./perdidas.module.css";

function SpeciesGlyph({ species, size }: { species?: string | null; size: number }) {
  if (species === "gato") return <Cat size={size} aria-hidden />;
  if (species === "perro") return <Dog size={size} aria-hidden />;
  return <PawPrint size={size} aria-hidden />;
}

function reportHref(id: string) {
  return `/perdidas/rastreo/${id}`;
}

function TypeBadge({ report }: { report: LostPetReport }) {
  const isLost = report.report_type !== "found";
  return (
    <Badge
      label={isLost ? "Perdido" : "Encontrado"}
      color={isLost ? "var(--color-error)" : "var(--color-info)"}
      variant="solid"
      size="sm"
    />
  );
}

export function ReportGridCard({ report }: { report: LostPetReport }) {
  const meta = [report.species ? sentenceCase(report.species) : null, report.breed]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={reportHref(report.id)} className={s.reportCard}>
      <div className={s.reportVisual}>
        {report.image_url ? (
          <Image
            src={report.image_url}
            alt={report.pet_name}
            fill
            className={s.reportPhoto}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className={s.reportPhotoFallback}>
            <SpeciesGlyph species={report.species} size={32} />
          </div>
        )}
        <div className={s.reportBadges}>
          <TypeBadge report={report} />
          {report.is_resolved ? (
            <Badge label="Reunido" color="var(--color-success)" variant="solid" size="sm" />
          ) : null}
        </div>
      </div>
      <p className={s.reportName}>{report.pet_name}</p>
      <p className={s.reportMeta}>{meta || "Sin datos de raza"}</p>
      {report.last_seen_location ? (
        <p className={s.reportMeta}>
          <MapPin size={12} style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden />
          {report.last_seen_location}
        </p>
      ) : null}
      {report.created_at ? (
        <p className={s.reportMeta}>
          <Clock size={12} style={{ verticalAlign: -1, marginRight: 4 }} aria-hidden />
          {getTimeAgo(report.created_at)}
        </p>
      ) : null}
    </Link>
  );
}

export function ReportListRow({ report }: { report: LostPetReport }) {
  const meta = [
    report.species ? sentenceCase(report.species) : null,
    report.last_seen_location,
    report.created_at ? getTimeAgo(report.created_at) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={reportHref(report.id)} className={s.reportRow}>
      {report.image_url ? (
        <Image
          src={report.image_url}
          alt={report.pet_name}
          width={52}
          height={52}
          className={s.reportThumb}
        />
      ) : (
        <div className={s.reportThumbFallback}>
          <SpeciesGlyph species={report.species} size={22} />
        </div>
      )}
      <div className={s.reportRowBody}>
        <p className={s.reportRowName}>{report.pet_name}</p>
        <p className={s.reportRowMeta}>{meta || "Sin datos"}</p>
      </div>
      <TypeBadge report={report} />
    </Link>
  );
}
