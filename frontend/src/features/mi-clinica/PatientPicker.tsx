"use client";

/**
 * PatientPicker — elige un paciente de la clínica (mascotas que ya agendaron cita).
 * Espejo de `mobile/src/features/salud/PatientPicker.tsx`.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PawPrint } from "lucide-react";
import FilterChip from "@/components/FilterChip";
import SearchBar from "@/components/SearchBar";
import { Skeleton } from "@/components/Skeleton";
import { getMyClinics } from "@/services/directorio";
import { getClinicPatients } from "@/services/patients";
import s from "./clinica.module.css";

interface Props {
  value: string;
  onChange: (petId: string) => void;
  label?: string;
  error?: string;
}

export default function PatientPicker({ value, onChange, label = "Paciente *", error }: Props) {
  const [q, setQ] = useState("");
  const { data: clinics = [] } = useQuery({ queryKey: ["my-clinics"], queryFn: getMyClinics });
  const clinicId = clinics[0]?.id;
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["clinic-patients", clinicId],
    queryFn: () => getClinicPatients(clinicId!),
    enabled: !!clinicId,
  });
  const list = patients.filter((p) => `${p.name} ${p.owner}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className={s.field} role="group" aria-label={label}>
      <span className={s.fieldLabel}>{label}</span>
      {isLoading ? (
        <Skeleton height={40} />
      ) : patients.length === 0 ? (
        <span className={s.muted}>
          Aún no tienes pacientes: aparecen cuando una mascota agenda una cita en tu clínica.
        </span>
      ) : (
        <>
          {patients.length > 6 ? <SearchBar value={q} onChangeText={setQ} placeholder="Buscar paciente o dueño" /> : null}
          <div className={s.chips}>
            {list.map((p) => (
              <FilterChip
                key={p.id}
                icon={<PawPrint size={14} />}
                label={`${p.name} · ${p.owner}`}
                active={p.id === value}
                onPress={() => onChange(p.id)}
              />
            ))}
          </div>
        </>
      )}
      {error ? <span className={s.error}>{error}</span> : null}
    </div>
  );
}
