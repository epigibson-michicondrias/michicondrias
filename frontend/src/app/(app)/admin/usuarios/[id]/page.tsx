"use client";

/**
 * Detalle de usuario (`/admin/usuarios/[id]`): datos, rol, estado, documentos KYC y acciones.
 * No existe en la app: la consola web va más allá (W4-A, ver HANDOFF.md).
 */
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, FileText, Pencil, Power, SearchX, Trash2, XCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSelect from "@/components/forms/FormSelect";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleColorFor, getRoleLabelFor } from "@/constants/roles";
import { Avatar, KYC_LABELS } from "@/features/admin/AdminKit";
import { useAdminUserDetail } from "@/hooks/admin/useAdminUserDetail";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import s from "@/features/admin/admin.module.css";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "—";

export default function AdminUsuarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();
  const d = useAdminUserDetail(id);
  const u = useAdminUsers();

  if (d.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Usuario" />
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (d.notFound || !d.user) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Usuario" />
        <EmptyState
          icon={<SearchX size={28} />}
          title="No encontramos esta cuenta"
          subtitle="Puede que se haya eliminado."
          actionLabel="Volver a usuarios"
          onAction={() => router.push("/admin/usuarios")}
        />
      </ScreenContainer>
    );
  }

  const usr = d.user;
  const isMe = usr.id === me?.id;
  const kyc = KYC_LABELS[usr.verification_status || "UNVERIFIED"] ?? KYC_LABELS.UNVERIFIED;
  const docs = [
    { label: "Identificación (frente)", url: usr.id_front_url },
    { label: "Identificación (reverso)", url: usr.id_back_url },
    { label: "Comprobante de domicilio", url: usr.proof_of_address_url },
  ].filter((x) => x.url);

  return (
    <ScreenContainer>
      <ScreenHeader title={usr.full_name || usr.email} subtitle={usr.email} />

      <div className={s.grid2}>
        <section className={s.card}>
          <div className={s.who}>
            <Avatar name={usr.full_name || usr.email} color={getRoleColorFor(usr.role_name)} />
            <div className={s.cellMain}>
              <span className={s.cellTitle}>{usr.full_name || "Sin nombre"}</span>
              <span>
                <Badge label={getRoleLabelFor(usr.role_name)} color={getRoleColorFor(usr.role_name)} size="sm" />{" "}
                <Badge label={usr.is_active ? "Activo" : "Inactivo"} color={usr.is_active ? "var(--color-success)" : "var(--color-text-muted)"} size="sm" />
              </span>
            </div>
          </div>
          <dl className={s.kv}>
            <dt>Correo</dt>
            <dd>{usr.email}</dd>
            <dt>Miembro desde</dt>
            <dd>{fmt(usr.created_at)}</dd>
            <dt>Verificación</dt>
            <dd>
              <Badge label={kyc.label} color={kyc.color} size="sm" variant="outlined" />
            </dd>
            <dt>ID</dt>
            <dd className={s.muted}>{usr.id}</dd>
          </dl>
          <div className={s.toolbarRow}>
            <Button label="Editar" icon={<Pencil size={16} />} size="sm" variant="secondary" fullWidth={false} onPress={() => u.openEditModal(usr)} />
            {!isMe ? (
              <>
                <Button
                  label={usr.is_active ? "Desactivar" : "Activar"}
                  icon={<Power size={16} />}
                  size="sm"
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => u.toggleStatus(usr.id)}
                  loading={u.togglingId === usr.id}
                />
                <Button label="Eliminar" icon={<Trash2 size={16} />} size="sm" variant="danger" fullWidth={false} onPress={() => u.handleDelete(usr, () => router.push("/admin/usuarios"))} />
              </>
            ) : (
              <span className={s.muted}>Es tu cuenta: no puedes desactivarla ni borrarla desde aquí.</span>
            )}
          </div>
        </section>

        <section className={s.card}>
          <h2 className={s.sectionTitle}>Documentos de identidad</h2>
          {docs.length === 0 ? (
            <p className={s.muted}>No ha subido documentos.</p>
          ) : (
            <div className={s.docs}>
              {docs.map((doc) => (
                <a key={doc.label} href={doc.url!} target="_blank" rel="noopener noreferrer" className={s.doc}>
                  {/\.pdf(\?|$)/i.test(doc.url!) ? (
                    <span className={`${s.docImg} ${s.docPlaceholder}`}>
                      <FileText size={28} />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal del bucket privado
                    <img src={doc.url!} alt={doc.label} className={s.docImg} />
                  )}
                  {doc.label}
                </a>
              ))}
            </div>
          )}
          {usr.verification_status === "PENDING" ? (
            <div className={s.toolbarRow}>
              <Button label="Aprobar identidad" icon={<CheckCircle2 size={16} />} size="sm" fullWidth={false} onPress={() => d.decideKyc("VERIFIED")} loading={d.isDeciding} />
              <Button label="Rechazar" icon={<XCircle size={16} />} size="sm" variant="ghost" fullWidth={false} onPress={() => d.decideKyc("REJECTED")} disabled={d.isDeciding} />
            </div>
          ) : null}
        </section>
      </div>

      <Modal
        open={u.modalVisible}
        title="Editar usuario"
        onClose={u.closeModal}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={u.closeModal} />
            <Button label="Guardar cambios" onPress={u.handleSubmit} loading={u.isSaving} />
          </>
        }
      >
        <FormField label="Nombre completo *" value={u.formData.full_name} onChangeText={(v) => u.updateForm("full_name", v)} error={u.formErrors.full_name} />
        <FormField label="Correo *" value={u.formData.email} onChangeText={(v) => u.updateForm("email", v)} keyboardType="email-address" autoCapitalize="none" error={u.formErrors.email} />
        <FormField label="Nueva contraseña" value={u.formData.password} onChangeText={(v) => u.updateForm("password", v)} secureTextEntry placeholder="Déjala vacía para no cambiarla" error={u.formErrors.password} />
        <FormSelect label="Rol *" options={u.roleOptions.map((r) => ({ label: r.label, value: r.id }))} value={u.formData.role_id} onChange={(v) => u.updateForm("role_id", v)} />
      </Modal>
    </ScreenContainer>
  );
}
