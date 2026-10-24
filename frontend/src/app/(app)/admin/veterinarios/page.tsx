"use client";

/**
 * Veterinarios (`/admin/veterinarios`): cuentas con rol veterinario (búsqueda en el servidor, fila → detalle del
 * usuario) y perfiles del directorio pendientes de aprobación (`/veterinarians/admin/*`).
 * Espejo de `mobile/app/admin/veterinarios/index.tsx` (allí los botones solo mostraban avisos) + cola de aprobación.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Stethoscope, UserCheck, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import { SkeletonList } from "@/components/Skeleton";
import { getRoleColorFor } from "@/constants/roles";
import { Avatar, KYC_LABELS } from "@/features/admin/AdminKit";
import { useAdminVets, type PendingVetProfile } from "@/hooks/admin/useAdminVets";
import s from "@/features/admin/admin.module.css";

/** «consulta general» → «Consulta general» */
const capitalize = (v: string) => v.trim().replace(/^./, (c) => c.toUpperCase());

function PendingVetCard({
  vet,
  busy,
  onAction,
}: {
  vet: PendingVetProfile;
  busy: boolean;
  onAction: (action: "approve" | "reject") => void;
}) {
  const name = [vet.first_name, vet.last_name].filter(Boolean).join(" ") || "Sin nombre";
  return (
    <section className={s.card}>
      <div className={s.kycHead}>
        <div className={s.who}>
          <Avatar name={name} color={getRoleColorFor("veterinario")} />
          <div className={s.cellMain}>
            <span className={s.cellTitle}>{name}</span>
            <span className={s.cellSub}>
              {vet.specialty ? capitalize(vet.specialty) : "Medicina general"}
              {vet.license_number ? ` · Cédula ${vet.license_number}` : ""}
            </span>
          </div>
        </div>
        <Badge label="Por aprobar" color="var(--color-warning)" size="sm" variant="outlined" />
      </div>
      <div className={s.toolbarRow}>
        <Button
          label="Aprobar perfil"
          icon={<CheckCircle2 size={16} />}
          size="sm"
          fullWidth={false}
          onPress={() => onAction("approve")}
          loading={busy}
        />
        <Button
          label="Rechazar"
          icon={<XCircle size={16} />}
          size="sm"
          variant="ghost"
          fullWidth={false}
          onPress={() => onAction("reject")}
          disabled={busy}
        />
      </div>
    </section>
  );
}

export default function AdminVeterinariosPage() {
  const router = useRouter();
  const v = useAdminVets();
  const searching = !!v.q.trim();
  const color = getRoleColorFor("veterinario");
  const pendingCount = v.pending.length;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Veterinarios"
        subtitle={
          pendingCount
            ? `${v.total} ${v.total === 1 ? "cuenta" : "cuentas"} · ${pendingCount} ${pendingCount === 1 ? "perfil por aprobar" : "perfiles por aprobar"}`
            : `${v.total} ${v.total === 1 ? "cuenta" : "cuentas"}${searching ? " con esta búsqueda" : ""}`
        }
      />

      {v.pendingLoading ? (
        <SkeletonList count={2} />
      ) : pendingCount > 0 ? (
        <div className={s.kycList}>
          <SectionHeader
            title="Pendientes de aprobación"
            subtitle="Perfiles del directorio que esperan tu revisión"
            icon={<UserCheck size={18} color="var(--color-warning)" />}
          />
          {v.pending.map((vet) => (
            <PendingVetCard
              key={vet.id}
              vet={vet}
              busy={v.pendingBusyId === vet.id}
              onAction={(action) => v.handlePendingAction(action, vet)}
            />
          ))}
        </div>
      ) : null}

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
                    <td data-label="Especialidad">{vet.specialty ? capitalize(vet.specialty) : "Medicina general"}</td>
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
