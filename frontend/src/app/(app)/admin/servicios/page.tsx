"use client";

/**
 * Servicios (`/admin/servicios`): catálogo global de servicios que ofrecen las clínicas, con cifras y búsqueda.
 * Espejo de `mobile/app/admin/servicios/index.tsx`.
 */
import Link from "next/link";
import { CheckCircle2, ClipboardList, Tags } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { StatTile } from "@/features/admin/AdminKit";
import { useAdminServices } from "@/hooks/admin/useAdminServices";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/admin/admin.module.css";

function formatDuration(min: number) {
  if (!min) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}

export default function AdminServiciosPage() {
  const v = useAdminServices();
  const searching = !!v.searchText.trim();

  return (
    <ScreenContainer>
      <ScreenHeader title="Servicios" subtitle="Lo que ofrecen las clínicas del directorio" />

      <div className={s.content}>
        <div className={s.tiles}>
          <StatTile icon={ClipboardList} value={v.total} label="Servicios" color="var(--color-primary)" />
          <StatTile icon={CheckCircle2} value={v.activeCount} label="Activos" color="var(--color-success)" />
          <StatTile icon={Tags} value={v.categoryCount} label="Categorías" color="var(--color-info)" />
        </div>

        <div>
          <div className={s.toolbar}>
            <SearchBar value={v.searchText} onChangeText={v.setSearchText} placeholder="Buscar por nombre o categoría..." />
          </div>

          {v.isLoading ? (
            <SkeletonList count={6} />
          ) : v.servicios.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title={searching ? "Sin resultados" : "Aún no hay servicios"}
              subtitle={searching ? "Ningún servicio coincide con la búsqueda." : "Cuando las clínicas den de alta sus servicios aparecerán aquí."}
              actionLabel={searching ? "Quitar búsqueda" : undefined}
              onAction={searching ? () => v.setSearchText("") : undefined}
            />
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Duración</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {v.servicios.map((sv) => {
                    const clinic = v.clinicName(sv.clinic_id);
                    return (
                      <tr key={sv.id}>
                        <td>
                          <div className={s.cellMain}>
                            <span className={s.cellTitle}>{sv.name}</span>
                            <Link href={`/admin/clinicas/${sv.clinic_id}`} className={`${s.cellSub} ${s.cellLink}`}>
                              {clinic ?? "Ver clínica"}
                            </Link>
                          </div>
                        </td>
                        <td data-label="Categoría">{sv.category ? <Badge label={sv.category} size="sm" variant="outlined" /> : <span className={s.cellSub}>Sin categoría</span>}</td>
                        <td data-label="Precio" className={s.nowrap}>
                          {sv.price != null ? formatCurrency(sv.price) : "A consultar"}
                        </td>
                        <td data-label="Duración" className={s.nowrap}>
                          {formatDuration(sv.duration_minutes)}
                        </td>
                        <td data-label="Estado">
                          <Badge label={sv.is_active ? "Activo" : "Inactivo"} color={sv.is_active ? "var(--color-success)" : "var(--color-text-muted)"} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
