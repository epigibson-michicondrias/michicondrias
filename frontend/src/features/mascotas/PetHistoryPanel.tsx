"use client";

/**
 * Pestaña Historial de la ficha (web): línea de tiempo clínica (consultas con recetas, vacunas y laboratorio) por mes,
 * con búsqueda y filtros; a un lado, el resumen del historial (Michi-IA o automático) con copiar e imprimir/PDF y la
 * evolución de peso y temperatura. Lógica en `useClinicalHistory` (espejo de la app).
 */
import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Copy, FileText, FlaskConical, Printer, RefreshCw, SearchX, Sparkles, Syringe, TrendingUp } from "lucide-react";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import Sparkline from "@/components/Sparkline";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { ItemActions } from "@/features/carnet/CarnetItems";
import { useClinicalHistory, historyReportText } from "@/hooks/carnet/useClinicalHistory";
import { KIND_LABEL, PERIOD_LABEL, type TimelineEvent, type TimelineKind, type TimelinePeriod } from "@/hooks/carnet/clinicalTimeline";
import type { usePetHealth } from "@/hooks/carnet/usePetHealth";
import type { Pet } from "@/types/mascotas";
import { capitalize, formatAge, formatDate } from "@/utils/formatters";
import { copyText } from "@/utils/helpers";
import { printHistoryReport } from "./printHistory";
import d from "./PetDetail.module.css";
import h from "./PetHistory.module.css";

type Health = ReturnType<typeof usePetHealth>;

const KIND_ICON: Record<TimelineKind, typeof ClipboardList> = { consulta: ClipboardList, vacuna: Syringe, laboratorio: FlaskConical };
const KINDS: TimelineKind[] = ["consulta", "vacuna", "laboratorio"];

function EventRow({ event, health, petId }: { event: TimelineEvent; health: Health; petId: string }) {
  const [open, setOpen] = useState(false);
  const Icon = KIND_ICON[event.kind];
  const canEdit = health.canEdit && (event.record || event.vaccine);
  const rx = event.record?.prescriptions ?? [];
  // La receta va siempre a la vista (enlace propio); el desplegable solo lleva el resto del detalle
  const details = event.details.filter((line) => !line.startsWith("Receta:"));
  const hasDetails = details.length > 0;
  const vitals = event.record
    ? [event.record.weight_kg ? `${event.record.weight_kg} kg` : null, event.record.temperature_c ? `${event.record.temperature_c} °C` : null].filter(Boolean)
    : [];

  return (
    <li className={`${h.event} ${h[event.kind]}`}>
      <span className={h.dot} aria-hidden><Icon size={14} /></span>
      <div className={h.card}>
        <div className={h.cardHead}>
          <div className={h.cardTitles}>
            <span className={h.kindDate}>{KIND_LABEL[event.kind].replace(/s$/, "")} · {formatDate(event.date)}</span>
            <strong className={h.title}>{event.title}</strong>
            {event.subtitle && <span className={h.subtitle}>{event.subtitle}</span>}
          </div>
          {event.flag && <span className={h.warn}>Atención</span>}
          {canEdit && (
            <ItemActions
              label={event.title}
              onEdit={() => (event.record ? health.editRecord(event.record.id) : health.editVaccine(event.vaccine!.id))}
              onDelete={() =>
                event.record
                  ? health.confirmDeleteRecord(event.record.id, event.record.reason_for_visit)
                  : health.confirmDeleteVaccine(event.vaccine!.id, event.vaccine!.name)
              }
            />
          )}
        </div>
        {(vitals.length > 0 || rx.length > 0) && (
          <div className={h.tags}>
            {vitals.map((v) => <span key={v} className={h.tag}>{v}</span>)}
            {rx.length > 0 && <span className={`${h.tag} ${h.tagRx}`}>Receta</span>}
          </div>
        )}
        {rx.length > 0 && event.record && (
          <Link href={`/carnet/receta/${event.record.id}?petId=${petId}`} className={h.rxLink}>
            <FileText size={16} aria-hidden />
            <span>
              <strong>Ver receta</strong>
              <span className={h.rxMeds}>{rx.map((p) => `${p.medication_name} ${p.dosage}`).join(" · ")}</span>
            </span>
          </Link>
        )}
        {hasDetails && (
          <>
            {open && (
              <ul className={h.details}>
                {details.map((line) => <li key={line}>{line}</li>)}
              </ul>
            )}
            <button type="button" className={h.more} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? "Ocultar detalle" : `Ver detalle (${details.length})`}
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function PetHistoryPanel({ pet, health }: { pet: Pet; health: Health }) {
  const ch = useClinicalHistory(pet.id, health);
  const meta = [capitalize(pet.species), pet.breed, pet.age_months ? formatAge(pet.age_months) : null].filter(Boolean).join(" · ");

  const copySummary = async () => {
    if (!ch.summary) return;
    const ok = await copyText(historyReportText(pet.name, ch.summary));
    showAlert({ type: ok ? "success" : "error", title: ok ? "Resumen copiado" : "No se pudo copiar", message: ok ? "Pégalo donde quieras." : "Inténtalo de nuevo." });
  };
  const print = () => {
    if (!printHistoryReport(pet.name, meta, ch.summary, ch.filtered)) {
      showAlert({ type: "error", title: "No se pudo abrir el reporte", message: "Permite las ventanas emergentes de este sitio e inténtalo de nuevo." });
    }
  };

  return (
    <div className={d.columns}>
      <div className={d.main}>
        <div className={h.toolbar}>
          <div className={h.search}>
            <SearchBar value={ch.query} onChangeText={ch.setQuery} placeholder="Buscar motivo, diagnóstico, medicamento o vacuna" />
          </div>
          <label className={h.period}>
            <span className={h.srOnly}>Periodo</span>
            <select value={ch.period} onChange={(e) => ch.setPeriod(e.target.value as TimelinePeriod)}>
              {(Object.keys(PERIOD_LABEL) as TimelinePeriod[]).map((p) => <option key={p} value={p}>{PERIOD_LABEL[p]}</option>)}
            </select>
          </label>
        </div>
        <div className={h.chips} role="group" aria-label="Tipo de registro">
          {KINDS.map((k) => {
            const Icon = KIND_ICON[k];
            const on = ch.kinds.includes(k);
            return (
              <button key={k} type="button" className={`${h.chip} ${on ? h.chipOn : ""}`} aria-pressed={on} onClick={() => ch.toggleKind(k)}>
                <Icon size={14} aria-hidden /> {KIND_LABEL[k]} <span className={h.count}>{ch.counts[k]}</span>
              </button>
            );
          })}
          {ch.hasFilters && <button type="button" className={h.clear} onClick={ch.clearFilters}>Quitar filtros</button>}
        </div>

        {ch.isLoading ? (
          <Skeleton height={220} borderRadius={16} />
        ) : ch.events.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} />}
            title="Sin historial todavía"
            subtitle={health.canEdit ? "Las consultas, vacunas y resultados aparecerán aquí." : `Cuando un veterinario atienda a ${pet.name}, sus registros aparecerán aquí.`}
            actionLabel={health.canEdit ? "Registrar consulta" : health.isOwner ? "Buscar veterinario" : undefined}
            onAction={health.canEdit ? health.addRecord : health.isOwner ? health.findVet : undefined}
          />
        ) : ch.filtered.length === 0 ? (
          <EmptyState icon={<SearchX size={28} />} title="Sin resultados" subtitle="Ningún registro coincide con la búsqueda o los filtros." actionLabel="Quitar filtros" onAction={ch.clearFilters} />
        ) : (
          <div className={h.timeline}>
            {ch.groups.map((g) => (
              <section key={g.key} aria-label={g.label}>
                <h3 className={h.month}>{capitalize(g.label)}</h3>
                <ol className={h.events}>
                  {g.events.map((e) => <EventRow key={e.id} event={e} health={health} petId={pet.id} />)}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>

      <aside className={d.aside}>
        <section className={d.panel} aria-label="Resumen del historial">
          <header className={d.panelHead}>
            <span className={d.panelIcon} aria-hidden><Sparkles size={18} /></span>
            <h2 className={d.panelTitle}>Resumen del historial</h2>
          </header>
          {ch.summary ? (
            <>
              <p className={h.summary}>{ch.summary.summary}</p>
              {ch.summary.highlights.length > 0 && (
                <ul className={h.highlights}>{ch.summary.highlights.map((x) => <li key={x}>{x}</li>)}</ul>
              )}
              <p className={h.source}>{ch.summary.analysis_source} · {ch.summary.disclaimer}</p>
              <div className={h.summaryActions}>
                <Button label="Imprimir o guardar PDF" icon={<Printer size={16} />} onPress={print} />
                <div className={h.summaryRow}>
                  <Button label="Copiar" variant="secondary" fullWidth={false} icon={<Copy size={16} />} onPress={copySummary} />
                  <Button label="Actualizar" variant="ghost" fullWidth={false} icon={<RefreshCw size={16} />} onPress={ch.generateSummary} loading={ch.isSummarizing} />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className={d.muted}>
                Michi-IA junta consultas, recetas, vacunas y laboratorio en un resumen para ti o para llevarlo a otro veterinario.
              </p>
              {ch.summaryError && <p className={h.error}>No se pudo generar el resumen. Inténtalo de nuevo.</p>}
              <Button label="Resumir historial" icon={<Sparkles size={16} />} onPress={ch.generateSummary} loading={ch.isSummarizing} disabled={ch.events.length === 0} />
              <Button label="Imprimir o guardar PDF" variant="secondary" icon={<Printer size={16} />} onPress={print} disabled={ch.events.length === 0} />
            </>
          )}
        </section>

        <section className={d.panel} aria-label="Evolución">
          <header className={d.panelHead}>
            <span className={d.panelIcon} aria-hidden><TrendingUp size={18} /></span>
            <h2 className={d.panelTitle}>Evolución</h2>
          </header>
          {ch.vitals.weight.length === 0 && ch.vitals.temperature.length === 0 ? (
            <p className={d.muted}>El peso y la temperatura de cada consulta se verán aquí.</p>
          ) : (
            <>
              <Sparkline label="Peso" unit="kg" formatDate={formatDate} points={ch.vitals.weight.map((p) => ({ date: p.date, value: p.value, note: p.reason }))} />
              <Sparkline label="Temperatura" unit="°C" tone="info" formatDate={formatDate} points={ch.vitals.temperature.map((p) => ({ date: p.date, value: p.value, note: p.reason }))} />
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
