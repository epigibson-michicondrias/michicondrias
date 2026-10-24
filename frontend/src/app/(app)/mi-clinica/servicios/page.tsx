"use client";

/**
 * Servicios de la clínica (`/mi-clinica/servicios`): catálogo con precio y duración (alta, edición y baja).
 * Espejo de `mobile/app/mi-clinica/servicios.tsx`.
 */
import { Briefcase, Clock, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import { useClinicServices } from "@/hooks/clinica/useClinicServices";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/mi-clinica/clinica.module.css";

export default function ServiciosPage() {
  return <Servicios />;
}

function Servicios() {
  const c = useClinicServices();
  const digits = (v: string) => v.replace(/[^\d.]/g, "");

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Servicios"
        subtitle="Catálogo de prestaciones"
        actions={[{ icon: Plus, label: "Nuevo servicio", onPress: c.openCreateModal }]}
      />

      {c.loadingServices ? (
        <SkeletonList count={4} />
      ) : c.services.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="Aún no has agregado servicios"
          subtitle="Los dueños solo pueden agendar servicios que estén en tu catálogo."
          actionLabel="Agregar servicio"
          onAction={c.openCreateModal}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {c.services.map((item) => (
            <article key={item.id} className={s.card}>
              <div className={s.cardHead}>
                <span className={s.iconBox}>
                  <Briefcase size={20} />
                </span>
                <div className={s.cardInfo}>
                  <span className={s.cardTitle}>{item.name}</span>
                  <span className={s.cardSub}>{item.description || "Sin descripción"}</span>
                  <span className={s.cardSub}>
                    <Clock size={12} /> {item.duration_minutes} min · <Tag size={12} /> {item.category || "General"}
                  </span>
                </div>
                <span className={s.strong}>{formatCurrency(Number(item.price || 0))}</span>
              </div>
              <div className={s.actions}>
                <Button label="Editar" icon={<Pencil size={16} />} size="sm" variant="secondary" onPress={() => c.handleEdit(item)} />
                <Button label="Eliminar" icon={<Trash2 size={16} />} size="sm" variant="ghost" onPress={() => c.handleDelete(item.id)} />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={c.modalVisible}
        title={c.editingService ? "Editar servicio" : "Nuevo servicio"}
        onClose={() => c.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => c.setModalVisible(false)} />
            <Button label={c.editingService ? "Guardar cambios" : "Crear servicio"} onPress={c.handleSave} loading={c.loadingAction} />
          </>
        }
      >
        <FormField label="Nombre del servicio *" value={c.name} onChangeText={c.setName} placeholder="Ej: Consulta general" />
        <FormField label="Descripción" value={c.description} onChangeText={c.setDescription} placeholder="Qué incluye el servicio" multiline />
        <div className={s.row2}>
          <FormField label="Precio (MXN) *" value={c.price} onChangeText={(v) => c.setPrice(digits(v))} keyboardType="decimal-pad" placeholder="450" />
          <FormField label="Duración (min) *" value={c.duration} onChangeText={(v) => c.setDuration(v.replace(/\D/g, ""))} keyboardType="numeric" placeholder="30" />
        </div>
        <FormField label="Categoría" value={c.category} onChangeText={c.setCategory} placeholder="Ej: Vacuna, Estética, Cirugía" />
      </Modal>
    </ScreenContainer>
  );
}
