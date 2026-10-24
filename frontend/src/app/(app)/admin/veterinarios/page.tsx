"use client";

/**
 * Veterinarios (`/admin/veterinarios`): cuentas con rol veterinario, búsqueda en el servidor; fila → detalle del usuario.
 * Espejo de `mobile/app/admin/veterinarios/index.tsx` (allí los botones solo mostraban avisos).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { getRoleColorFor } from "@/constants/roles";
import { Avatar, KYC_LABELS } from "@/features/admin/AdminKit";
import { useAdminVets } from "@/hooks/admin/useAdminVets";
import s from "@/features/admin/admin.module.css";

export default function AdminVeterinariosPage() {
  const router = useRouter();
  const v = useAdminVets();
  const searching = !!v.q.trim();
  const color = getRoleColorFor("veterinario");

  return (
    <ScreenContainer>
      <ScreenHeader title="Veterinarios" subtitle={`${v.total} ${v.total === 1 ? "cuenta" : "cuentas"}${searching ? " con esta búsqueda" : ""}`} />

      <div className={s.toolbar}>
        <SearchBar value={v.q} onChangeText={v.setQ} placeholder="Buscar por nombre o correo..." />
      </div>

      {v.isLoading ? (
        <SkeletonList count={6} />
      ) : v.vets.length === 0 ? (
        <EmptyState
          icon={<Stethoscope size={28} />}
          title={searching ? "Sin resultados" : "Aún no hay veterinarios"}
          subtitle={searching ? "Ninguna cuenta de veterinario coincide con la búsqueda." : "Las cuentas con rol de veterinario aparecerán aquí."}
          actionLabel={searching ? "Quitar búsqueda" : "Ver usuarios"}
          onAction={searching ? () => v.setQ("") : () => router.push("/admin/usuarios")}
        />
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Veterinario</th>
                <th>Especialidad</th>
                <th>Teléfono</th>
                <th>Verificación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {v.vets.map((vet) => {
                const kyc = KYC_LABELS[vet.verification_status || "UNVERIFIED"] ?? KYC_LABELS.UNVERIFIED;
                return (
                  <tr key={vet.id} className={s.rowLink} onClick={() => router.push(`/admin/usuarios/${vet.id}`)}>
                    <td>
                      <div className={s.who}>
                        <Avatar name={vet.full_name || vet.email} color={color} />
                        <div className={s.cellMain}>
                          <Link href={`/admin/usuarios/${vet.id}`} className={`${s.cellTitle} ${s.cellLink}`} onClick={(e) => e.stopPropagation()}>
                            {vet.full_name || "Sin nombre"}
                          </Link>
                          <span className={s.cellSub}>{vet.email}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Especialidad">{vet.specialty || "Medicina general"}</td>
                    <td data-label="Teléfono" className={s.nowrap}>
                      {vet.phone || "—"}
                    </td>
                    <td data-label="Verificación">
                      <Badge label={kyc.label} color={kyc.color} size="sm" variant="outlined" />
                    </td>
                    <td data-label="Estado">
                      <Badge label={vet.is_active ? "Activo" : "Inactivo"} color={vet.is_active ? "var(--color-success)" : "var(--color-text-muted)"} size="sm" />
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
