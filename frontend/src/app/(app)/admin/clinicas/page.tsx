"use client";

/**
 * Clínicas (`/admin/clinicas`): directorio completo (aprobadas y en revisión) con búsqueda y filtro; fila → detalle.
 * Espejo de `mobile/app/admin/clinicas/index.tsx`.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Siren } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useAdminClinics, type ClinicFilter } from "@/hooks/admin/useAdminClinics";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/admin/admin.module.css";

export default function AdminClinicasPage() {
  const router = useRouter();
  const c = useAdminClinics();

  const chips: { key: ClinicFilter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: c.total },
    { key: "approved", label: "Verificadas", count: c.approvedCount },
    { key: "pending", label: "En revisión", count: c.pendingCount },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Clínicas" subtitle={`${c.total} en el directorio · ${c.pendingCount} en revisión`} />

      <div className={s.toolbar}>
        <SearchBar value={c.searchText} onChangeText={c.setSearchText} placeholder="Buscar por nombre, ciudad o dirección..." />
        <div className={s.chips}>
          {chips.map((f) => (
            <FilterChip key={f.key} label={f.label} count={f.count} active={c.filter === f.key} onPress={() => c.setFilter(f.key)} />
          ))}
        </div>
      </div>

      {c.isLoading ? (
        <SkeletonList count={6} />
      ) : c.clinics.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title={c.filtering ? "Sin resultados" : "Aún no hay clínicas"}
          subtitle={c.filtering ? "Ninguna clínica coincide con la búsqueda o el filtro." : "Las clínicas que se registren aparecerán aquí."}
          actionLabel={c.filtering ? "Quitar filtros" : undefined}
          onAction={c.filtering ? c.clearFilters : undefined}
        />
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Clínica</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Servicio</th>
              </tr>
            </thead>
            <tbody>
              {c.clinics.map((cl) => {
                const approved = cl.is_approved !== false;
                return (
                  <tr key={cl.id} className={s.rowLink} onClick={() => router.push(`/admin/clinicas/${cl.id}`)}>
                    <td>
                      <div className={s.who}>
                        {cl.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- logo del storage
                          <img src={getS3Url(cl.logo_url)} alt="" className={s.thumb} />
                        ) : (
                          <span className={s.thumb} aria-hidden>
                            <Building2 size={20} />
                          </span>
                        )}
                        <div className={s.cellMain}>
                          <Link href={`/admin/clinicas/${cl.id}`} className={`${s.cellTitle} ${s.cellLink}`} onClick={(e) => e.stopPropagation()}>
                            {cl.name}
                          </Link>
                          {cl.address ? <span className={s.cellSub}>{cl.address}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td data-label="Ciudad">{[cl.city, cl.state].filter(Boolean).join(", ") || "—"}</td>
                    <td data-label="Teléfono" className={s.nowrap}>
                      {cl.phone || "—"}
                    </td>
                    <td data-label="Estado">
                      <Badge label={approved ? "Verificada" : "En revisión"} color={approved ? "var(--color-success)" : "var(--color-warning)"} size="sm" />
                    </td>
                    <td data-label="Servicio">
                      <div className={s.badges}>
                        {cl.is_24_hours ? <Badge label="24 h" color="var(--color-info)" size="sm" variant="outlined" /> : null}
                        {cl.has_emergency ? <Badge label="Urgencias" icon={<Siren size={12} />} color="var(--color-error)" size="sm" variant="outlined" /> : null}
                        {!cl.is_24_hours && !cl.has_emergency ? <span className={s.cellSub}>Horario normal</span> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ScreenContainer>
  );
}
