"use client";

/**
 * Perfil de conductor (`/transportistas/perfil-conductor`): alta/edición del vehículo.
 * Espejo de `mobile/app/transportistas/perfil-conductor.tsx`.
 */
import { AlertCircle, Car, CheckCircle2, Save, UserCircle } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import FormField from "@/components/FormField";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { useDriverProfile } from "@/hooks/rides/useDriverProfile";
import l from "../transportistas.module.css";

function PerfilConductorContent() {
  const { form, errors, updateForm, isLoading, isError, isExistingProfile, handleSave, isSaving, refetch } =
    useDriverProfile();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Perfil de conductor"
        subtitle={isExistingProfile ? "Edita los datos de tu vehículo" : "Completa los datos para empezar a conducir"}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="No pudimos cargar tu perfil"
          subtitle="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      ) : (
        <>
          <div className={`${l.statusBanner} ${!isExistingProfile ? l.statusBannerNew : ""}`}>
            <div className={l.iconBox}>
              {isExistingProfile ? <CheckCircle2 size={22} /> : <UserCircle size={22} />}
            </div>
            <div>
              <p className={l.statusTitle}>{isExistingProfile ? "Perfil activo" : "Nuevo perfil"}</p>
              <p className={l.statusSub}>
                {isExistingProfile
                  ? "Tu perfil de conductor está configurado"
                  : "Completa los datos para empezar a conducir"}
              </p>
            </div>
          </div>

          <FormSection title="Información del vehículo">
            <FormField
              label="Modelo del vehículo *"
              value={form.vehicle_model}
              onChangeText={(val) => updateForm({ vehicle_model: val })}
              placeholder="Ej. Toyota Corolla 2023"
              error={errors.vehicle_model}
            />
            <FormField
              label="Placa del vehículo *"
              value={form.vehicle_plate}
              onChangeText={(val) => updateForm({ vehicle_plate: val.toUpperCase() })}
              placeholder="Ej. ABC-1234"
              maxLength={10}
              error={errors.vehicle_plate}
            />
            <FormField
              label="Capacidad máxima de mascotas"
              value={form.max_capacity}
              onChangeText={(val) => updateForm({ max_capacity: val.replace(/\D/g, "") })}
              placeholder="1"
              keyboardType="number-pad"
              maxLength={2}
              error={errors.max_capacity}
            />
          </FormSection>

          <FormSection title="Comodidades">
            <FormSwitch
              label="Aire acondicionado"
              description="El vehículo cuenta con A/C"
              value={form.has_air_conditioning}
              onChange={(val) => updateForm({ has_air_conditioning: val })}
            />
            <FormSwitch
              label="Transportines"
              description="Puedes llevar transportines para las mascotas"
              value={form.has_carriers}
              onChange={(val) => updateForm({ has_carriers: val })}
            />
            <FormSwitch
              label="Disponible para viajes"
              description="Los clientes podrán solicitarte viajes"
              value={form.is_available}
              onChange={(val) => updateForm({ is_available: val })}
            />
          </FormSection>

          <div className={l.noteBox}>
            <Car size={16} />
            <span>
              Conductor, vehículo y disponibilidad se validan también al aceptar cada viaje.
            </span>
          </div>

          <Button label="Guardar perfil" icon={<Save size={18} />} onPress={handleSave} loading={isSaving} />
        </>
      )}
    </ScreenContainer>
  );
}

export default function PerfilConductorPage() {
  return (
    <RoleGuard roles={["transportista"]} message="El perfil de conductor es solo para cuentas de transportista.">
      <PerfilConductorContent />
    </RoleGuard>
  );
}
