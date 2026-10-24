"use client";

/**
 * Roles y permisos (`/admin/roles`). Pestaña "Roles": tabla con alta, edición y baja (los del sistema no se renombran
 * ni se borran; uno con usuarios tampoco se borra). Pestaña "Permisos": matriz de solo lectura y vista previa por rol.
 * Espejo ampliado de `mobile/app/admin/roles/index.tsx`.
 */
import { useState } from "react";
import { KeyRound, Lock, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import SegmentedControl from "@/components/SegmentedControl";
import { SkeletonList } from "@/components/Skeleton";
import { getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import { deleteBlockReason, useAdminRoles } from "@/hooks/admin/useAdminRoles";
import PermissionsTab from "./PermissionsTab";
import s from "@/features/admin/admin.module.css";

type Tab = "roles" | "permisos";

export default function AdminRolesPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const r = useAdminRoles();
  const editingSystem = !!r.editingRole?.is_system;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Roles y permisos"
        subtitle={tab === "roles" ? `${r.roles.length} ${r.roles.length === 1 ? "rol" : "roles"}` : "Qué puede abrir cada rol"}
        actions={tab === "roles" ? [{ icon: Plus, label: "Nuevo rol", onPress: () => r.handleAction() }] : undefined}
      />

      <div className={s.toolbar}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          accessibilityLabel="Sección"
          options={[
            { value: "roles", label: "Roles", icon: Shield },
            { value: "permisos", label: "Permisos", icon: KeyRound },
          ]}
        />
      </div>

      {tab === "permisos" ? (
        <PermissionsTab />
      ) : r.isLoading ? (
        <SkeletonList count={6} />
      ) : r.roles.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} />}
          title="Aún no hay roles"
          subtitle="Crea el primero para poder asignarlo a las cuentas."
          actionLabel="Nuevo rol"
          onAction={() => r.handleAction()}
        />
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripción</th>
                <th>Usuarios</th>
                <th>Tipo</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {r.roles.map((role) => {
                const label = getRoleLabelFor(role.name);
                const blocked = deleteBlockReason(role);
                const count = role.users_count ?? 0;
                return (
                  <tr key={role.id}>
                    <td>
                      <div className={s.cellMain}>
                        <span className={s.cellTitle}>{label}</span>
                        <span className={s.cellSub}>{role.name}</span>
                      </div>
                    </td>
                    <td data-label="Descripción">
                      <div className={s.cellMain}>
                        <span className={role.description ? undefined : s.muted}>{role.description || "Sin descripción"}</span>
                        {blocked ? (
                          <span className={s.reason}>
                            <Lock size={12} aria-hidden />
                            {blocked}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td data-label="Usuarios">
                      <Badge label={String(count)} color={count ? getRoleColorFor(role.name) : "var(--color-text-muted)"} size="sm" variant="outlined" />
                    </td>
                    <td data-label="Tipo">
                      {role.is_system ? <Badge label="Del sistema" color="var(--color-info)" size="sm" /> : <span className={s.muted}>Personalizado</span>}
                    </td>
                    <td>
                      <div className={s.cellActions}>
                        <IconButton icon={Pencil} accessibilityLabel={`Editar el rol ${label}`} onPress={() => r.handleAction(role)} size="sm" />
                        <IconButton
                          icon={Trash2}
                          accessibilityLabel={blocked ? `No se puede eliminar ${label}: ${blocked}` : `Eliminar el rol ${label}`}
                          onPress={() => r.handleDelete(role)}
                          disabled={!!blocked}
                          loading={r.deletingId === role.id}
                          color={blocked ? undefined : "var(--color-error)"}
                          size="sm"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={r.isModalVisible}
        title={r.editingRole ? `Editar ${getRoleLabelFor(r.editingRole.name)}` : "Nuevo rol"}
        subtitle={editingSystem ? "Rol del sistema: solo se puede cambiar la descripción." : undefined}
        onClose={r.closeModal}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={r.closeModal} />
            <Button label={r.editingRole ? "Guardar cambios" : "Crear rol"} onPress={r.handleSubmit} loading={r.isSaving} />
          </>
        }
      >
        <FormField
          label="Nombre *"
          value={r.formData.name}
          onChangeText={(v) => r.updateForm("name", v)}
          editable={!editingSystem}
          placeholder="Ej. soporte"
          autoCapitalize="none"
          error={r.formErrors.name}
          hint={
            editingSystem
              ? "La plataforma usa este nombre: no se puede cambiar."
              : r.normalizedName
                ? `Se guardará como «${r.normalizedName}».`
                : "Minúsculas, sin espacios ni acentos."
          }
        />
        <FormField
          label="Descripción"
          value={r.formData.description}
          onChangeText={(v) => r.updateForm("description", v)}
          multiline
          numberOfLines={3}
          placeholder="Para qué sirve este rol"
          error={r.formErrors.description}
        />
      </Modal>
    </ScreenContainer>
  );
}
