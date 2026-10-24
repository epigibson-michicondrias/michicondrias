"use client";

/**
 * Detalle de clínica (`/admin/clinicas/[id]`): ficha, edición, aprobación si está en revisión y
 * suspender/reactivar (`POST /clinics/admin/{id}/suspend|unsuspend`).
 * Espejo de `mobile/app/admin/clinicas/[id].tsx`.
 */
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Building2, CheckCircle2, Pencil, SearchX, ShieldOff, ShieldCheck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import { SkeletonList } from "@/components/Skeleton";
import { useAdminClinicDetail } from "@/hooks/admin/useAdminClinicDetail";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/admin/admin.module.css";

export default function AdminClinicaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const d = useAdminClinicDetail(id);

  if (d.isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Clínica" />
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (d.notFound || !d.clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Clínica" />
        <EmptyState
          icon={<SearchX size={28} />}
          title="No encontramos esta clínica"
          subtitle="Puede que se haya eliminado o que el enlace esté mal."
          actionLabel="Volver a clínicas"
          onAction={() => router.push("/admin/clinicas")}
        />
      </ScreenContainer>
    );
  }

  const cl = d.clinic;
  const approved = cl.is_approved !== false;
  const { form, updateField } = d;

  return (
    <ScreenContainer>
      <ScreenHeader title={cl.name} subtitle={[cl.city, cl.state].filter(Boolean).join(", ") || "Clínica del directorio"} />

      {d.isEditing ? (
        <section className={s.card}>
          <FormSection title="Información básica">
            <FormField label="Nombre *" value={form.name} onChangeText={(v) => updateField("name", v)} error={d.nameError} />
            <FormField label="Dirección" value={form.address} onChangeText={(v) => updateField("address", v)} />
            <div className={s.fieldRow}>
              <FormField label="Ciudad" value={form.city} onChangeText={(v) => updateField("city", v)} />
              <FormField label="Estado" value={form.state} onChangeText={(v) => updateField("state", v)} />
            </div>
          </FormSection>
          <FormSection title="Contacto">
            <FormField label="Teléfono" value={form.phone} onChangeText={(v) => updateField("phone", v)} keyboardType="phone-pad" />
            <FormField label="Correo" value={form.email} onChangeText={(v) => updateField("email", v)} keyboardType="email-address" autoCapitalize="none" />
            <FormField label="Sitio web" value={form.website} onChangeText={(v) => updateField("website", v)} keyboardType="url" autoCapitalize="none" placeholder="https://" />
          </FormSection>
          <FormSection title="Descripción">
            <FormField
              label="Acerca de la clínica"
              value={form.description}
              onChangeText={(v) => updateField("description", v)}
              multiline
              numberOfLines={4}
              placeholder="Especialidades, instalaciones, horarios..."
            />
          </FormSection>
          <FormSection title="Opciones">
            <FormSwitch label="Abierto 24 horas" value={form.is_24_hours} onChange={(v) => updateField("is_24_hours", v)} />
            <FormSwitch label="Atiende urgencias" value={form.has_emergency} onChange={(v) => updateField("has_emergency", v)} />
          </FormSection>
          <div className={s.formActions}>
            <Button label="Cancelar" variant="secondary" fullWidth={false} onPress={d.handleCancelEdit} disabled={d.isSaving} />
            <Button label="Guardar cambios" fullWidth={false} onPress={d.handleSave} loading={d.isSaving} />
          </div>
        </section>
      ) : (
        <div className={s.grid2}>
          <section className={s.card}>
            <div className={s.who}>
              {cl.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo del storage
                <img src={getS3Url(cl.logo_url)} alt={`Logo de ${cl.name}`} className={`${s.thumb} ${s.thumbLg}`} />
              ) : (
                <span className={`${s.thumb} ${s.thumbLg}`} aria-hidden>
                  <Building2 size={32} />
                </span>
              )}
              <div className={s.cellMain}>
                <span className={s.cellTitle}>{cl.name}</span>
                <div className={s.badges}>
                  <Badge label={approved ? "Verificada" : "En revisión"} color={approved ? "var(--color-success)" : "var(--color-warning)"} size="sm" />
                  {d.isSuspended ? <Badge label="Suspendida" color="var(--color-error)" size="sm" /> : null}
                  {cl.is_24_hours ? <Badge label="24 h" color="var(--color-info)" size="sm" variant="outlined" /> : null}
                  {cl.has_emergency ? <Badge label="Urgencias" color="var(--color-error)" size="sm" variant="outlined" /> : null}
                </div>
              </div>
            </div>
            <dl className={s.kv}>
              <dt>Dirección</dt>
              <dd>{[cl.address, cl.city, cl.state].filter(Boolean).join(", ") || "No proporcionada"}</dd>
              <dt>Teléfono</dt>
              <dd>{cl.phone || "No proporcionado"}</dd>
              <dt>Correo</dt>
              <dd>{cl.email || "No proporcionado"}</dd>
              <dt>Sitio web</dt>
              <dd>
                {cl.website ? (
                  <a href={/^https?:\/\//i.test(cl.website) ? cl.website : `https://${cl.website}`} target="_blank" rel="noopener noreferrer" className={s.cellLink}>
                    {cl.website}
                  </a>
                ) : (
                  "No proporcionado"
                )}
              </dd>
              <dt>Urgencias</dt>
              <dd>{cl.has_emergency ? "Sí atiende" : "No atiende"}</dd>
            </dl>
            <div className={s.toolbarRow}>
              <Button label="Editar información" icon={<Pencil size={16} />} fullWidth={false} onPress={d.startEditing} />
              {!approved ? (
                <Button label="Aprobar clínica" icon={<CheckCircle2 size={16} />} variant="secondary" fullWidth={false} onPress={d.handleApprove} loading={d.isApproving} />
              ) : null}
              {d.isSuspended ? (
                <Button
                  label="Reactivar clínica"
                  icon={<ShieldCheck size={16} />}
                  variant="secondary"
                  fullWidth={false}
                  onPress={d.handleSuspend}
                  loading={d.isSaving}
                  disabled={d.isSaving}
                />
              ) : (
                <Button
                  label="Suspender"
                  icon={<ShieldOff size={16} />}
                  variant="danger"
                  fullWidth={false}
                  onPress={d.handleSuspend}
                  loading={d.isSaving}
                  disabled={d.isSaving}
                />
              )}
            </div>
          </section>

          <div className={s.section}>
            <section className={s.card}>
              <h2 className={s.sectionTitle}>Acerca de la clínica</h2>
              <p className={s.description}>{cl.description || "La clínica aún no ha escrito una descripción."}</p>
            </section>
            <section className={s.card}>
              <h2 className={s.sectionTitle}>Datos internos</h2>
              <dl className={s.kv}>
                <dt>ID de la clínica</dt>
                <dd className={s.muted}>{cl.id}</dd>
                <dt>Propietario</dt>
                <dd>
                  {cl.owner_user_id ? (
                    <Link href={`/admin/usuarios/${cl.owner_user_id}`} className={s.cellLink}>
                      Ver cuenta del propietario
                    </Link>
                  ) : (
                    "Sin propietario"
                  )}
                </dd>
              </dl>
            </section>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}
