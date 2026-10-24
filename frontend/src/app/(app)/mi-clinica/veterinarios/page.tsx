"use client";

/**
 * Veterinarios de la clínica (`/mi-clinica/veterinarios`): equipo, alta, edición y desasociación.
 * Espejo de `mobile/app/mi-clinica/veterinarios.tsx`.
 */
import { useRouter } from "next/navigation";
import { Edit, Mail, Phone, Plus, ShieldCheck, Star, Stethoscope, Trash2, Users } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import { useVeterinarians } from "@/hooks/clinica/useVeterinarians";
import s from "@/features/mi-clinica/clinica.module.css";

export default function VeterinariosPage() {
  return <Veterinarios />;
}

function Veterinarios() {
  const router = useRouter();
  const v = useVeterinarians();

  if (v.loadingClinics) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Veterinarios" />
        <SkeletonList count={3} />
      </ScreenContainer>
    );
  }

  if (!v.clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Veterinarios" />
        <EmptyState
          icon={<Stethoscope size={28} />}
          title="No tienes clínicas registradas"
          subtitle="Registra tu clínica para armar tu equipo."
          actionLabel="Registrar clínica"
          onAction={() => router.push("/directorio/nuevo")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Veterinarios"
        subtitle={`${v.veterinarians.length} en tu equipo · ${v.activeVetsCount} aprobados`}
        actions={[{ icon: Plus, label: "Agregar veterinario", onPress: v.openCreateModal }]}
      />

      {v.loadingVets ? (
        <SkeletonList count={3} />
      ) : v.veterinarians.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Aún no tienes veterinarios"
          subtitle="Agrega a tu equipo para que los dueños sepan quién los atiende."
          actionLabel="Agregar veterinario"
          onAction={v.openCreateModal}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {v.veterinarians.map((item) => {
            const vetName = `${item.first_name || ""} ${item.last_name || ""}`.trim();
            return (
              <article key={item.id} className={s.card}>
                <div className={s.cardHead}>
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- la foto viene del storage
                    <img src={item.photo_url} alt="" className={s.logo} />
                  ) : (
                    <span className={s.logo}>
                      <Stethoscope size={24} />
                    </span>
                  )}
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>{vetName || "Veterinario"}</span>
                    <span className={s.cardSub}>{item.specialty || "Medicina general"}</span>
                    <span className={s.cardSub}>
                      {item.total_reviews ? (
                        <>
                          <Star size={12} /> {Number(item.average_rating || 0).toFixed(1)} ({item.total_reviews})
                        </>
                      ) : (
                        "Sin reseñas todavía"
                      )}
                    </span>
                  </div>
                  <Badge
                    label={item.is_approved ? "Aprobado" : "En revisión"}
                    color={item.is_approved ? "var(--color-success)" : "var(--color-warning)"}
                    size="sm"
                  />
                </div>
                <div className={s.cardSub}>
                  <Mail size={14} /> {item.email || "Sin correo"} · <Phone size={14} /> {item.phone || "Sin teléfono"}
                </div>
                {item.bio ? <p className={s.muted}>{item.bio}</p> : null}
                <div className={s.sectionHead} style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--color-border-light)" }}>
                  <span className={s.muted}>
                    <ShieldCheck size={14} /> Cédula: {item.license_number || "sin registrar"}
                  </span>
                  <span>
                    <IconButton icon={Edit} accessibilityLabel={`Editar a ${vetName}`} onPress={() => v.handleEdit(item)} size="sm" />
                    <IconButton icon={Trash2} accessibilityLabel={`Desasociar a ${vetName}`} onPress={() => v.handleDelete(item)} color="var(--color-error)" size="sm" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={v.modalVisible}
        title={v.editingVet ? "Editar veterinario" : "Agregar veterinario"}
        onClose={() => v.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => v.setModalVisible(false)} />
            <Button label="Guardar" onPress={v.handleSave} loading={v.loadingAction} />
          </>
        }
      >
        <FormField label="Nombre completo *" value={v.name} onChangeText={v.setName} placeholder="Dra. Ana Pérez" />
        <FormField label="Correo *" value={v.email} onChangeText={v.setEmail} placeholder="ana@clinica.com" keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Teléfono" value={v.phone} onChangeText={v.setPhone} placeholder="+52 55 1234 5678" keyboardType="phone-pad" />
        <FormField label="Especialidad *" value={v.specialty} onChangeText={v.setSpecialty} placeholder="Medicina felina" />
        <FormField label="Cédula profesional" value={v.licenseNumber} onChangeText={v.setLicenseNumber} placeholder="1234567" />
        <FormField label="Biografía" value={v.bio} onChangeText={v.setBio} placeholder="Breve descripción profesional" multiline />
      </Modal>
    </ScreenContainer>
  );
}
