"use client";

/**
 * Usuarios (`/admin/usuarios`): tabla con búsqueda, filtros y orden en el servidor; alta, edición, activar y borrar.
 * Espejo ampliado de `mobile/app/admin/usuarios/index.tsx`.
 */
import { useRouter } from "next/navigation";
import { Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import FormField from "@/components/FormField";
import FormSelect from "@/components/forms/FormSelect";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import { Avatar, KYC_LABELS, Pager } from "@/features/admin/AdminKit";
import { PAGE_SIZE, useAdminUsers, type KycFilter, type StatusFilter } from "@/hooks/admin/useAdminUsers";
import s from "@/features/admin/admin.module.css";

const STATUS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "inactive", label: "Inactivos" },
];

const KYC: { key: KycFilter; label: string }[] = [
  { key: "all", label: "Cualquier verificación" },
  { key: "PENDING", label: "Por revisar" },
  { key: "VERIFIED", label: "Verificada" },
  { key: "REJECTED", label: "Rechazada" },
  { key: "UNVERIFIED", label: "Sin verificar" },
];

const ORDER = [
  { value: "created_at_desc", label: "Más recientes" },
  { value: "created_at_asc", label: "Más antiguos" },
  { value: "name_asc", label: "Nombre A–Z" },
  { value: "name_desc", label: "Nombre Z–A" },
  { value: "email_asc", label: "Correo A–Z" },
] as const;

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { user: me } = useAuth();
  const u = useAdminUsers();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Usuarios"
        subtitle={`${u.total} ${u.total === 1 ? "cuenta" : "cuentas"}${u.filtering ? " con estos filtros" : ""}`}
        actions={[{ icon: Plus, label: "Nuevo usuario", onPress: u.openCreateModal }]}
      />

      <div className={s.toolbar}>
        <SearchBar value={u.q} onChangeText={u.setQ} placeholder="Buscar por nombre o correo..." />
        <div className={s.toolbarRow}>
          <select className={s.select} value={u.role} onChange={(e) => u.setRole(e.target.value)} aria-label="Filtrar por rol">
            <option value="all">Todos los roles</option>
            {u.roleOptions.map((r) => (
              <option key={r.id} value={r.name}>
                {r.label} ({r.count})
              </option>
            ))}
          </select>
          <select className={s.select} value={u.kyc} onChange={(e) => u.setKyc(e.target.value as KycFilter)} aria-label="Filtrar por verificación">
            {KYC.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
          <select className={s.select} value={u.orderBy} onChange={(e) => u.setOrderBy(e.target.value as (typeof ORDER)[number]["value"])} aria-label="Ordenar">
            {ORDER.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s.chips}>
          {STATUS.map((f) => (
            <FilterChip key={f.key} label={f.label} active={u.status === f.key} onPress={() => u.setStatus(f.key)} />
          ))}
        </div>
      </div>

      {u.isLoading ? (
        <SkeletonList count={6} />
      ) : u.users.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={u.filtering ? "Sin resultados" : "Aún no hay usuarios"}
          subtitle={u.filtering ? "Ninguna cuenta coincide con la búsqueda o los filtros." : "Las cuentas registradas aparecerán aquí."}
          actionLabel={u.filtering ? "Quitar filtros" : "Nuevo usuario"}
          onAction={u.filtering ? u.clearFilters : u.openCreateModal}
        />
      ) : (
        <>
          <div className={s.tableWrap} style={{ opacity: u.isFetching ? 0.6 : 1 }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Verificación</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {u.users.map((usr) => {
                  const kyc = KYC_LABELS[usr.verification_status || "UNVERIFIED"] ?? KYC_LABELS.UNVERIFIED;
                  const isMe = usr.id === me?.id;
                  return (
                    <tr key={usr.id} className={s.rowLink} onClick={() => router.push(`/admin/usuarios/${usr.id}`)}>
                      <td>
                        <div className={s.who}>
                          <Avatar name={usr.full_name || usr.email} color={getRoleColorFor(usr.role_name)} />
                          <div className={s.cellMain}>
                            <span className={s.cellTitle}>{usr.full_name || "Sin nombre"}</span>
                            <span className={s.cellSub}>{usr.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Rol">
                        <Badge label={getRoleLabelFor(usr.role_name)} color={getRoleColorFor(usr.role_name)} size="sm" />
                      </td>
                      <td data-label="Verificación">
                        <Badge label={kyc.label} color={kyc.color} size="sm" variant="outlined" />
                      </td>
                      <td data-label="Estado">
                        <Badge label={usr.is_active ? "Activo" : "Inactivo"} color={usr.is_active ? "var(--color-success)" : "var(--color-text-muted)"} size="sm" />
                      </td>
                      <td data-label="Alta" className={s.cellSub}>
                        {usr.created_at ? new Date(usr.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className={s.cellActions}>
                          <IconButton icon={Pencil} accessibilityLabel={`Editar a ${usr.full_name || usr.email}`} onPress={() => u.openEditModal(usr)} size="sm" />
                          {!isMe ? (
                            <>
                              <IconButton
                                icon={Power}
                                accessibilityLabel={usr.is_active ? `Desactivar a ${usr.full_name || usr.email}` : `Activar a ${usr.full_name || usr.email}`}
                                onPress={() => u.toggleStatus(usr.id)}
                                loading={u.togglingId === usr.id}
                                color={usr.is_active ? "var(--color-warning)" : "var(--color-success)"}
                                size="sm"
                              />
                              <IconButton icon={Trash2} accessibilityLabel={`Eliminar a ${usr.full_name || usr.email}`} onPress={() => u.handleDelete(usr)} color="var(--color-error)" size="sm" />
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager page={u.page} pageCount={u.pageCount} total={u.total} pageSize={PAGE_SIZE} onChange={u.setPage} />
        </>
      )}

      <Modal
        open={u.modalVisible}
        title={u.editingUser ? "Editar usuario" : "Nuevo usuario"}
        onClose={u.closeModal}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={u.closeModal} />
            <Button label={u.editingUser ? "Guardar cambios" : "Crear usuario"} onPress={u.handleSubmit} loading={u.isSaving} />
          </>
        }
      >
        <FormField label="Nombre completo *" value={u.formData.full_name} onChangeText={(v) => u.updateForm("full_name", v)} error={u.formErrors.full_name} />
        <FormField label="Correo *" value={u.formData.email} onChangeText={(v) => u.updateForm("email", v)} keyboardType="email-address" autoCapitalize="none" error={u.formErrors.email} />
        <FormField
          label={u.editingUser ? "Nueva contraseña" : "Contraseña *"}
          value={u.formData.password}
          onChangeText={(v) => u.updateForm("password", v)}
          secureTextEntry
          placeholder={u.editingUser ? "Déjala vacía para no cambiarla" : "Mínimo 8 caracteres"}
          error={u.formErrors.password}
        />
        <FormSelect
          label="Rol *"
          options={u.roleOptions.map((r) => ({ label: r.label, value: r.id }))}
          value={u.formData.role_id}
          onChange={(v) => u.updateForm("role_id", v)}
        />
        {u.formErrors.role_id ? <span className={s.muted} style={{ color: "var(--color-error)" }}>{u.formErrors.role_id}</span> : null}
      </Modal>
    </ScreenContainer>
  );
}
