"use client";

/**
 * Pacientes de la clínica (`/mi-clinica/pacientes`): todos, con cita próxima o críticos.
 * Espejo de `mobile/app/mi-clinica/pacientes.tsx`.
 */
import type { CSSProperties } from "react";
import Link from "next/link";
import { AlertTriangle, PawPrint, Users } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { formatDateMx } from "@/features/mi-clinica/format";
import { useClinicPatients, type PatientFilter } from "@/hooks/clinica/useClinicPatients";
import s from "@/features/mi-clinica/clinica.module.css";

const FILTERS: { key: PatientFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "upcoming", label: "Con cita próxima" },
  { key: "critical", label: "Críticos" },
];

export default function PacientesPage() {
  return <Pacientes />;
}

function Pacientes() {
  const p = useClinicPatients();
  const filtering = !!p.q || p.filter !== "all";

  return (
    <ScreenContainer>
      <ScreenHeader title="Pacientes" subtitle="Mascotas que atiendes" />

      <div className={s.filters}>
        <SearchBar value={p.q} onChangeText={p.setQ} placeholder="Buscar por mascota o dueño..." />
        <div className={s.chips}>
          {FILTERS.map((f) => (
            <FilterChip key={f.key} label={f.label} count={p.count(f.key)} active={p.filter === f.key} onPress={() => p.setFilter(f.key)} />
          ))}
        </div>
      </div>

      {p.isLoading ? (
        <SkeletonList count={4} />
      ) : p.list.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={filtering ? "Sin coincidencias" : "Aún no tienes pacientes"}
          subtitle={filtering ? "Prueba con otro filtro o búsqueda." : "Aparecen aquí cuando una mascota agenda una cita en tu clínica."}
          actionLabel={filtering ? "Ver todos" : undefined}
          onAction={filtering ? () => { p.setFilter("all"); p.setQ(""); } : undefined}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {p.list.map((item) => {
            const critical = p.isCritical(item);
            const tone = item.alert_level === "red" ? "var(--color-error)" : "var(--color-warning)";
            return (
              <Link key={item.id} href={`/mascotas/${item.id}?tab=historial`} className={s.card} aria-label={`Abrir ficha de ${item.name}`}>
                <div className={s.cardHead}>
                  <span className={s.iconBox} style={critical ? ({ "--c": tone } as CSSProperties) : undefined}>
                    {critical ? <AlertTriangle size={20} /> : <PawPrint size={20} />}
                  </span>
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>{item.name}</span>
                    <span className={s.cardSub}>
                      {[item.species, item.breed].filter(Boolean).join(" · ") || "Mascota"} · Dueño: {item.owner}
                    </span>
                  </div>
                  {critical ? <Badge label={item.alert_level === "red" ? "Urgente" : "En observación"} color={tone} size="sm" /> : null}
                </div>
                <div className={s.stats}>
                  <div className={s.stat}>
                    <span className={s.statLabel}>Visitas</span>
                    <span className={s.statValue}>{item.visits}</span>
                  </div>
                  <div className={s.stat}>
                    <span className={s.statLabel}>Última</span>
                    <span className={s.statValue}>{formatDateMx(item.last_visit) || "—"}</span>
                  </div>
                  <div className={s.stat}>
                    <span className={s.statLabel}>Próxima</span>
                    <span className={s.statValue}>{formatDateMx(item.next_visit) || "Sin cita"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
