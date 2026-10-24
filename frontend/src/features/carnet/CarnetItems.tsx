"use client";

/**
 * Piezas del carnet (espejo de `mobile/src/features/carnet/CarnetItems.tsx`):
 * `VaccineItem` y `RecordItem` para las pestañas Salud e Historial de la ficha.
 */
import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Pencil,
  Syringe,
  Trash2,
} from "lucide-react";
import type { MedicalRecord, Vaccine } from "@/types/carnet";
import s from "./carnetItems.module.css";

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "Sin fecha";

export function ItemActions({ onEdit, onDelete, label }: { onEdit?: () => void; onDelete?: () => void; label: string }) {
  if (!onEdit && !onDelete) return null;
  return (
    <div className={s.actions}>
      {onEdit ? (
        <button type="button" className={s.actionBtn} onClick={onEdit} aria-label={`Editar ${label}`}>
          <Pencil size={16} />
        </button>
      ) : null}
      {onDelete ? (
        <button type="button" className={`${s.actionBtn} ${s.actionDanger}`} onClick={onDelete} aria-label={`Eliminar ${label}`}>
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function VaccineItem({
  vaccine,
  onEdit,
  onDelete,
}: {
  vaccine: Vaccine;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const vencido = !!vaccine.next_due_date && vaccine.next_due_date.slice(0, 10) < hoy;

  return (
    <div className={s.card}>
      <div className={`${s.iconBox} ${vencido ? s.iconBad : s.iconOk}`}>
        <Syringe size={18} />
      </div>
      <div className={s.body}>
        <div className={s.titleRow}>
          <p className={s.title}>{vaccine.name}</p>
          <span className={`${s.tag} ${vencido ? s.tagBad : s.tagOk}`}>{vencido ? "Refuerzo vencido" : "Vigente"}</span>
        </div>
        <p className={s.meta}>Aplicada: {formatDate(vaccine.date_administered)}</p>
        {vaccine.next_due_date && (
          <p className={s.meta}>
            <Clock size={12} aria-hidden /> Refuerzo: {formatDate(vaccine.next_due_date)}
          </p>
        )}
      </div>
      <ItemActions onEdit={onEdit} onDelete={onDelete} label={vaccine.name} />
    </div>
  );
}

export function RecordItem({
  record,
  petId,
  onEdit,
  onDelete,
}: {
  record: MedicalRecord;
  petId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasPrescription = !!record.prescriptions?.length;

  return (
    <div className={s.card}>
      <button type="button" className={s.expandBtn} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
        <div className={s.body}>
          <p className={s.meta}>
            <Calendar size={12} aria-hidden /> {formatDate(record.date)}
          </p>
          <p className={s.title}>{record.reason_for_visit}</p>
          <div className={s.tags}>
            {!!record.weight_kg && <span className={s.tag}>{record.weight_kg} kg</span>}
            {!!record.temperature_c && <span className={s.tag}>{record.temperature_c} °C</span>}
            {hasPrescription && <span className={`${s.tag} ${s.tagOk}`}>Receta</span>}
          </div>
        </div>
        {expanded ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
      </button>

      {expanded && (
        <div className={s.details}>
          {record.diagnosis && <p className={s.detailLine}><strong>Diagnóstico:</strong> {record.diagnosis}</p>}
          {record.treatment && <p className={s.detailLine}><strong>Tratamiento:</strong> {record.treatment}</p>}
          {record.notes && <p className={s.detailLine}><strong>Notas:</strong> {record.notes}</p>}
          {hasPrescription && (
            <Link href={`/carnet/receta/${record.id}?petId=${petId}`} className={s.recetaLink}>
              <FileText size={16} aria-hidden /> Ver receta
              {" · "}
              {record.prescriptions.map((p) => p.medication_name).join(", ")}
            </Link>
          )}
        </div>
      )}

      <ItemActions onEdit={onEdit} onDelete={onDelete} label={record.reason_for_visit} />
    </div>
  );
}
