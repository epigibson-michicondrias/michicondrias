import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useDriverProfile } from '@/src/hooks/rides/useDriverProfile';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import {
  Car,
  CreditCard,
  Users,
  Snowflake,
  Box,
  CheckCircle2,
  Save,
  UserCircle,
} from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function PerfilConductorScreen() {
  const { theme } = useTheme();
  const {
    form,
    updateForm,
    isLoading,
    isExistingProfile,
    handleSave,
    isSaving,
  } = useDriverProfile();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Perfil de conductor" subtitle="Administra tu perfil de conductor" />
        <LoadingOverlay message="Cargando perfil..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Perfil de conductor"
        subtitle={isExistingProfile ? 'Edita tu perfil de conductor' : 'Crea tu perfil de conductor'}
      />

      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        {/* Profile status indicator */}
        <View style={[styles.statusBanner, { backgroundColor: isExistingProfile ? '#10b98115' : theme.primary + '10' }]}>
          <View style={[styles.statusIcon, { backgroundColor: isExistingProfile ? '#10b98120' : theme.primary + '20' }]}>
            {isExistingProfile ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : (
              <UserCircle size={24} color={theme.primary} />
            )}
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: isExistingProfile ? '#10b981' : theme.primary }]}>
              {isExistingProfile ? 'Perfil Activo' : 'Nuevo Perfil'}
            </Text>
            <Text style={[styles.statusSub, { color: theme.textMuted }]}>
              {isExistingProfile ? 'Tu perfil de conductor está configurado' : 'Completa los datos para empezar a conducir'}
            </Text>
          </View>
        </View>

        {/* Vehicle info */}
        <FormSection title="🚗 Información del Vehículo">
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Modelo del Vehículo *</Text>
            <View style={styles.inputWrapper}>
              <Car size={18} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Ej. Toyota Corolla 2023"
                placeholderTextColor={theme.textMuted}
                value={form.vehicle_model}
                onChangeText={(val) => updateForm({ vehicle_model: val })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Placa del Vehículo *</Text>
            <View style={styles.inputWrapper}>
              <CreditCard size={18} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Ej. ABC-1234"
                placeholderTextColor={theme.textMuted}
                value={form.vehicle_plate}
                onChangeText={(val) => updateForm({ vehicle_plate: val.toUpperCase() })}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Capacidad Máxima de Mascotas</Text>
            <View style={styles.inputWrapper}>
              <Users size={18} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Ej. 3"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={form.max_capacity}
                onChangeText={(val) => updateForm({ max_capacity: val.replace(/[^0-9]/g, '') })}
              />
            </View>
          </View>
        </FormSection>

        {/* Features */}
        <FormSection title="⚙️ Características del Servicio">
          <FormSwitch
            label="Aire Acondicionado"
            description="El vehículo cuenta con A/C funcional"
            value={form.has_air_conditioning}
            onChange={(val) => updateForm({ has_air_conditioning: val })}
          />

          <FormSwitch
            label="Transportines Disponibles"
            description="Cuento con transportines para las mascotas"
            value={form.has_carriers}
            onChange={(val) => updateForm({ has_carriers: val })}
          />
        </FormSection>

        {/* Availability */}
        <FormSection title="📡 Disponibilidad">
          <FormSwitch
            label="Disponible para viajes"
            description="Aparecerás como conductor disponible para los usuarios"
            value={form.is_available}
            onChange={(val) => updateForm({ is_available: val })}
          />
        </FormSection>

        {/* Features summary */}
        <View style={[styles.featuresSummary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>Tu perfil incluye</Text>
          <View style={styles.featuresRow}>
            <View style={[styles.featureChip, { backgroundColor: theme.background }]}>
              <Users size={14} color={theme.textMuted} />
              <Text style={[styles.featureText, { color: theme.textMuted }]}>
                {form.max_capacity || '1'} mascotas
              </Text>
            </View>
            {form.has_air_conditioning && (
              <View style={[styles.featureChip, { backgroundColor: '#06b6d415' }]}>
                <Snowflake size={14} color="#06b6d4" />
                <Text style={[styles.featureText, { color: '#06b6d4' }]}>A/C</Text>
              </View>
            )}
            {form.has_carriers && (
              <View style={[styles.featureChip, { backgroundColor: '#f59e0b15' }]}>
                <Box size={14} color="#f59e0b" />
                <Text style={[styles.featureText, { color: '#f59e0b' }]}>Transportín</Text>
              </View>
            )}
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.submitBtnText}>
            {isSaving ? 'Guardando...' : isExistingProfile ? 'Actualizar Perfil' : 'Crear Perfil'}
          </Text>
        </TouchableOpacity>
      </KeyboardScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 100,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: font.xl,
    fontWeight: '800',
    marginBottom: spacing.xxs,
  },
  statusSub: {
    fontSize: font.base,
    fontWeight: '500',
  },
  inputGroup: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.base,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    fontSize: font.lg,
    borderWidth: 1,
  },
  inputWithIcon: {
    paddingLeft: spacing.huge,
  },
  featuresSummary: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  featuresTitle: {
    fontSize: font.base,
    fontWeight: '800',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.sm,
  },
  featureText: {
    fontSize: font.md,
    fontWeight: '600',
  },
  submitBtn: {
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.huge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: font.xxl,
    fontWeight: '800',
  },
});
