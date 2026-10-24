/**
 * Perfil de conductor (`/transportistas/perfil-conductor`): alta/edición del vehículo.
 * Espejo de `frontend/src/app/(app)/transportistas/perfil-conductor/page.tsx`.
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AlertCircle, Car, CheckCircle2, Save, UserCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDriverProfile } from '@/src/hooks/rides/useDriverProfile';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import RoleGuard from '@/src/components/RoleGuard';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { SkeletonList } from '@/src/components/Skeleton';
import { radius, spacing, tint, type } from '@/constants/design';

function PerfilConductorContent() {
  const { theme } = useTheme();
  const { form, errors, updateForm, isLoading, isError, isExistingProfile, handleSave, isSaving, refetch } =
    useDriverProfile();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Perfil de conductor" subtitle="Datos del vehículo" />
        <View style={styles.pad}>
          <SkeletonList count={3} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Perfil de conductor" subtitle="Datos del vehículo" />
        <EmptyState
          icon={<AlertCircle size={32} color={theme.textMuted} />}
          title="No pudimos cargar tu perfil"
          subtitle="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Perfil de conductor"
        subtitle={isExistingProfile ? 'Edita los datos de tu vehículo' : 'Completa los datos para empezar a conducir'}
      />

      <KeyboardScreen
        contentContainerStyle={styles.content}
        footer={
          <Button
            label={isExistingProfile ? 'Guardar perfil' : 'Crear perfil'}
            icon={<Save size={18} color={theme.onPrimary} />}
            onPress={handleSave}
            loading={isSaving}
            size="lg"
          />
        }
      >
        <Card style={styles.statusBanner}>
          <View style={[styles.statusIcon, { backgroundColor: isExistingProfile ? theme.success + tint.faint : theme.primary + tint.faint }]}>
            {isExistingProfile ? (
              <CheckCircle2 size={22} color={theme.success} />
            ) : (
              <UserCircle size={22} color={theme.primary} />
            )}
          </View>
          <View style={styles.flex}>
            <Text style={[type.bodyStrong, { color: isExistingProfile ? theme.success : theme.primary }]}>
              {isExistingProfile ? 'Perfil activo' : 'Nuevo perfil'}
            </Text>
            <Text style={[type.caption, { color: theme.textMuted }]}>
              {isExistingProfile
                ? 'Tu perfil de conductor está configurado'
                : 'Completa los datos para empezar a conducir'}
            </Text>
          </View>
        </Card>

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
            autoCapitalize="characters"
            maxLength={10}
            error={errors.vehicle_plate}
          />
          <FormField
            label="Capacidad máxima de mascotas"
            value={form.max_capacity}
            onChangeText={(val) => updateForm({ max_capacity: val.replace(/\D/g, '') })}
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

        <View style={[styles.note, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Car size={16} color={theme.textMuted} />
          <Text style={[type.caption, styles.flex, { color: theme.textMuted }]}>
            Conductor, vehículo y disponibilidad se validan también al aceptar cada viaje.
          </Text>
        </View>
      </KeyboardScreen>
    </ScreenContainer>
  );
}

export default function PerfilConductorScreen() {
  return (
    <RoleGuard roles={['transportista']} message="El perfil de conductor es solo para cuentas de transportista.">
      <PerfilConductorContent />
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing.xl },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statusIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
