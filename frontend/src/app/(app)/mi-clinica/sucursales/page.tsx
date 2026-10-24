"use client";

/**
 * Sucursales del hospital (`/mi-clinica/sucursales`): alta, edición y baja de sedes.
 * Espejo de `mobile/app/mi-clinica/sucursales.tsx`. Solo rol hospital.
 */
import { Building, Edit, Globe, Mail, MapPin, Phone, Plus, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSwitch from "@/components/forms/FormSwitch";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import ClinicGuard from "@/features/mi-clinica/ClinicGuard";
import { useBranches } from "@/hooks/clinica/useBranches";
import s from "@/features/mi-clinica/clinica.module.css";

export default function SucursalesPage() {
  return (
    <ClinicGuard hospitalOnly>
      <Sucursales />
    </ClinicGuard>
  );
}

function Sucursales() {
  const b = useBranches();

  return (
    <ScreenContainer>
      <ScreenHeader title="Sucursales" subtitle="Sedes de tu hospital" actions={[{ icon: Plus, label: "Agregar sucursal", onPress: b.openCreateModal }]} />

      {b.isLoading ? (
        <SkeletonList count={3} />
      ) : b.clinics.length === 0 ? (
        <EmptyState
          icon={<Building size={28} />}
          title="No tienes sucursales registradas"
          subtitle="Registra cada sede para que aparezca en el directorio."
          actionLabel="Agregar sucursal"
          onAction={b.openCreateModal}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {b.clinics.map((item) => (
            <article key={item.id} className={s.card}>
              <div className={s.cardHead}>
                <span className={s.iconBox}>
                  <Building size={20} />
                </span>
                <div className={s.cardInfo}>
                  <span className={s.cardTitle}>{item.name}</span>
                  <span>
                    {item.is_24_hours ? <Badge label="24 horas" color="var(--color-info)" size="sm" /> : null}{" "}
                    {item.has_emergency ? <Badge label="Urgencias" color="var(--color-error)" size="sm" /> : null}
                  </span>
                </div>
                <Badge
                  label={item.is_approved ? "Verificada" : "En revisión"}
                  color={item.is_approved ? "var(--color-success)" : "var(--color-warning)"}
                  size="sm"
                />
              </div>
              <div className={s.section} style={{ gap: "var(--space-xs)" }}>
                {item.address ? (
                  <span className={s.cardSub}>
                    <MapPin size={14} /> {item.address}
                    {item.city ? `, ${item.city}` : ""}
                  </span>
                ) : null}
                {item.phone ? (
                  <span className={s.cardSub}>
                    <Phone size={14} /> {item.phone}
                  </span>
                ) : null}
                {item.email ? (
                  <span className={s.cardSub}>
                    <Mail size={14} /> {item.email}
                  </span>
                ) : null}
                {item.website ? (
                  <span className={s.cardSub}>
                    <Globe size={14} /> {item.website}
                  </span>
                ) : null}
              </div>
              <div className={s.actions} style={{ justifyContent: "flex-end" }}>
                <IconButton icon={Edit} accessibilityLabel={`Editar ${item.name}`} onPress={() => b.handleEdit(item)} size="sm" />
                <IconButton icon={Trash2} accessibilityLabel={`Eliminar ${item.name}`} onPress={() => b.handleDelete(item)} color="var(--color-error)" size="sm" />
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={b.modalVisible}
        title={b.editingClinic ? "Editar sucursal" : "Registrar sucursal"}
        onClose={() => b.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => b.setModalVisible(false)} />
            <Button label="Guardar" onPress={b.handleSave} loading={b.loadingAction} />
          </>
        }
      >
        <FormField label="Nombre de la sucursal *" value={b.name} onChangeText={b.setName} placeholder="Hospital Veterinario Coyoacán" />
        <FormField label="Dirección" value={b.address} onChangeText={b.setAddress} />
        <div className={s.row2}>
          <FormField label="Ciudad" value={b.city} onChangeText={b.setCity} />
          <FormField label="Estado" value={b.state} onChangeText={b.setState} />
        </div>
        <FormField label="Teléfono" value={b.phone} onChangeText={b.setPhone} keyboardType="phone-pad" />
        <FormField label="Correo" value={b.email} onChangeText={b.setEmail} keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Sitio web" value={b.website} onChangeText={b.setWebsite} keyboardType="url" autoCapitalize="none" placeholder="https://" />
        <FormField label="Descripción" value={b.description} onChangeText={b.setDescription} placeholder="Equipamiento, especialidades..." multiline />
        <FormSwitch label="Servicio 24 horas" value={b.is24Hours} onChange={b.setIs24Hours} />
        <FormSwitch label="Sala de urgencias" value={b.hasEmergency} onChange={b.setHasEmergency} />
      </Modal>
    </ScreenContainer>
  );
}
