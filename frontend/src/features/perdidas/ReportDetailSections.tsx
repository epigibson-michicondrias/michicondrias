"use client";

/**
 * Secciones del detalle de reporte (espejo de
 * `mobile/src/features/perdidas/ReportDetailSections.tsx`). El tracker solo muestra
 * la posición real del backend; sin datos muestra el estado vacío.
 */
import { useState } from "react";
import { Eye, MapPin, Radio, WifiOff } from "lucide-react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import SectionHeader from "@/components/SectionHeader";
import { getTimeAgo } from "@/utils/formatters";
import type { LostPetReport, Sighting } from "@/services/perdidas";
import s from "./perdidas.module.css";

// Si la última señal del collar tiene más de este tiempo se considera "sin señal"
const TRACKER_STALE_MS = 15 * 60 * 1000;

interface TrackerCardProps {
  report: LostPetReport;
}

/** Estado del collar Michi-Tracker con la última posición real reportada. */
export function TrackerCard({ report }: TrackerCardProps) {
  const hasPosition = report.current_lat != null && report.current_lng != null;
  const [now] = useState(() => Date.now());
  const trackerAge = report.last_tracked_at ? now - new Date(report.last_tracked_at).getTime() : null;
  const isLive = trackerAge != null && trackerAge < TRACKER_STALE_MS;

  if (!hasPosition) {
    return (
      <div className={s.trackerEmpty}>
        <SectionHeader title="Michi-Tracker" icon={<WifiOff size={16} color="var(--color-text-muted)" />} />
        <p className={s.sectionText}>
          El collar está vinculado, pero aún no ha enviado una posición. Cuando reporte ubicación aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className={s.trackerCard}>
      <SectionHeader
        title="Michi-Tracker"
        icon={<Radio size={16} color={isLive ? "var(--color-success)" : "var(--color-text-muted)"} />}
      />
      <p className={s.trackerMeta}>
        {isLive ? "Señal reciente" : "Sin señal reciente"}
        {report.last_tracked_at ? ` · Última actualización ${getTimeAgo(report.last_tracked_at).toLowerCase()}` : ""}
      </p>
      <p className={s.trackerCoords}>
        <MapPin size={14} style={{ verticalAlign: -2, marginRight: 6 }} aria-hidden />
        {report.current_lat?.toFixed(5)}, {report.current_lng?.toFixed(5)}
      </p>
    </div>
  );
}

interface SightingFormProps {
  isLost: boolean;
  sending: boolean;
  onSubmit: (locationText: string, note: string) => void;
}

/** Aviso de avistamiento para quien no es el dueño (solo texto: sin coordenadas inventadas). */
export function SightingForm({ isLost, sending, onSubmit }: SightingFormProps) {
  const [locationText, setLocationText] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className={s.sightingForm}>
      <SectionHeader
        title="¿Lo viste?"
        subtitle={
          isLost
            ? "Cualquier dato ayuda a reunirlo con su familia."
            : "Ayuda a encontrar a su familia contando dónde lo viste."
        }
        icon={<Eye size={16} color="var(--color-warning)" />}
      />
      <FormField
        label="¿Dónde lo viste?"
        value={locationText}
        onChangeText={setLocationText}
        placeholder="Colonia, calle, referencia…"
      />
      <FormField
        label="Nota para el dueño"
        value={note}
        onChangeText={setNote}
        placeholder="Señas, collar, comportamiento…"
        multiline
        numberOfLines={3}
      />
      <Button
        label="Avisar que lo vi"
        onPress={() => {
          onSubmit(locationText, note);
          setLocationText("");
          setNote("");
        }}
        loading={sending}
        icon={<Eye size={18} />}
        accessibilityLabel="Enviar avistamiento"
      />
    </div>
  );
}

interface SightingListProps {
  sightings: Sighting[];
}

export function SightingList({ sightings }: SightingListProps) {
  return (
    <div className={s.section}>
      <SectionHeader title={`Avistamientos (${sightings.length})`} icon={<Eye size={16} color="var(--color-warning)" />} />
      {sightings.length === 0 ? (
        <p className={s.sectionText}>
          Aún nadie ha avisado que lo vio. Cuando alguien lo haga, recibirás una notificación y aparecerá aquí.
        </p>
      ) : (
        sightings.map((item) => (
          <div key={item.id} className={s.factItem}>
            <Eye size={16} className={s.factIcon} aria-hidden />
            <div className={s.factBody}>
              <p className={s.factLabel}>
                {item.location_text ||
                  (item.latitude != null ? "Ubicación marcada en el mapa" : "Sin ubicación")}
              </p>
              <p className={s.factValue}>
                {[item.note, item.created_at ? getTimeAgo(item.created_at) : null].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
