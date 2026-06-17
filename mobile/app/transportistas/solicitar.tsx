import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useRequestRide } from '@/src/hooks/rides/useRequestRide';
import type { Pet } from '@/src/types/mascotas';
import type { DriverProfile } from '@/src/services/rides';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import {
  MapPin,
  Car,
  PawPrint,
  DollarSign,
  Info,
  Calculator,
  Clock,
  Route,
  ChevronRight,
} from 'lucide-react-native';

export default function SolicitarTransporteScreen() {
  const { theme } = useTheme();
  const {
    form,
    updateForm,
    estimate,
    pets,
    drivers,
    isLoading,
    handleEstimate,
    handleSubmit,
    isEstimating,
    isSubmitting,
  } = useRequestRide();

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="🚗 Solicitar Transporte" subtitle="Pide un viaje para tu mascota" />
        <LoadingOverlay message="Cargando datos..." />
      </ScreenContainer>
    );
  }

  const selectedPet = pets.find((p) => p.id === form.pet_id);
  const selectedDriver = drivers.find((d) => d.id === form.driver_id);

  return (
    <ScreenContainer>
      <ScreenHeader title="🚗 Solicitar Transporte" subtitle="Pide un viaje para tu mascota" />

      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        {/* Pet selection */}
        <FormSection title="🐾 Selecciona tu mascota">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectionRow}>
            {pets.map((pet: Pet) => {
              const isSelected = form.pet_id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.selectionCard,
                    {
                      backgroundColor: isSelected ? theme.primary + '15' : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => updateForm({ pet_id: pet.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.selectionIcon, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                    <PawPrint size={20} color={isSelected ? theme.primary : theme.textMuted} />
                  </View>
                  <Text style={[styles.selectionName, { color: isSelected ? theme.primary : theme.text }]} numberOfLines={1}>
                    {pet.name}
                  </Text>
                  <Text style={[styles.selectionSub, { color: theme.textMuted }]} numberOfLines={1}>
                    {pet.species}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </FormSection>

        {/* Addresses */}
        <FormSection title="📍 Direcciones">
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Origen *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={theme.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Ej. Calle Reforma 123, CDMX"
                placeholderTextColor={theme.textMuted}
                value={form.origin_address}
                onChangeText={(val) => updateForm({ origin_address: val })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Destino *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                placeholder="Ej. Veterinaria San José"
                placeholderTextColor={theme.textMuted}
                value={form.destination_address}
                onChangeText={(val) => updateForm({ destination_address: val })}
              />
            </View>
          </View>
        </FormSection>

        {/* Driver selection */}
        <FormSection title="🚙 Selecciona un conductor">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectionRow}>
            {drivers.map((driver: DriverProfile) => {
              const isSelected = form.driver_id === driver.id;
              return (
                <TouchableOpacity
                  key={driver.id}
                  style={[
                    styles.driverCard,
                    {
                      backgroundColor: isSelected ? theme.primary + '15' : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => updateForm({ driver_id: driver.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.selectionIcon, { backgroundColor: isSelected ? theme.primary + '20' : theme.background }]}>
                    <Car size={20} color={isSelected ? theme.primary : theme.textMuted} />
                  </View>
                  <Text style={[styles.selectionName, { color: isSelected ? theme.primary : theme.text }]} numberOfLines={1}>
                    {driver.vehicle_model}
                  </Text>
                  <Text style={[styles.selectionSub, { color: theme.textMuted }]} numberOfLines={1}>
                    {driver.vehicle_plate}
                  </Text>
                  <View style={styles.driverTags}>
                    <Text style={[styles.driverTagText, { color: theme.textMuted }]}>
                      {driver.max_capacity} 🐾
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </FormSection>

        {/* Options */}
        <FormSection title="⚙️ Opciones">
          <FormSwitch
            label="Requiere Transportín"
            description="Necesito que el conductor traiga transportín"
            value={form.requires_carrier}
            onChange={(val) => updateForm({ requires_carrier: val })}
          />
        </FormSection>

        {/* Fare estimate */}
        <FormSection title="💰 Tarifa Estimada">
          <TouchableOpacity
            style={[styles.estimateButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleEstimate}
            disabled={isEstimating}
            activeOpacity={0.7}
          >
            <Calculator size={20} color={theme.primary} />
            <Text style={[styles.estimateButtonText, { color: theme.primary }]}>
              {isEstimating ? 'Calculando...' : 'Calcular Tarifa'}
            </Text>
            <ChevronRight size={18} color={theme.primary} />
          </TouchableOpacity>

          {estimate && (
            <View style={[styles.estimateCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
              <View style={styles.estimateRow}>
                <View style={styles.estimateItem}>
                  <Route size={16} color={theme.primary} />
                  <Text style={[styles.estimateLabel, { color: theme.textMuted }]}>Distancia</Text>
                  <Text style={[styles.estimateValue, { color: theme.text }]}>{estimate.distance_km.toFixed(1)} km</Text>
                </View>
                <View style={styles.estimateItem}>
                  <Clock size={16} color={theme.primary} />
                  <Text style={[styles.estimateLabel, { color: theme.textMuted }]}>Duración</Text>
                  <Text style={[styles.estimateValue, { color: theme.text }]}>{estimate.estimated_duration_minutes} min</Text>
                </View>
                <View style={styles.estimateItem}>
                  <DollarSign size={16} color={theme.primary} />
                  <Text style={[styles.estimateLabel, { color: theme.textMuted }]}>Tarifa</Text>
                  <Text style={[styles.estimatePrice, { color: theme.primary }]}>${estimate.estimated_fare.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </FormSection>

        {/* Info box */}
        <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
          <Info size={18} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textMuted }]}>
            El transporte es seguro y supervisado. Puedes rastrear a tu mascota en tiempo real durante el viaje.
          </Text>
        </View>

        {/* Selected summary */}
        {(selectedPet || selectedDriver) && (
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Resumen</Text>
            {selectedPet && (
              <Text style={[styles.summaryLine, { color: theme.textMuted }]}>
                🐾 Mascota: {selectedPet.name}
              </Text>
            )}
            {selectedDriver && (
              <Text style={[styles.summaryLine, { color: theme.textMuted }]}>
                🚙 Conductor: {selectedDriver.vehicle_model} ({selectedDriver.vehicle_plate})
              </Text>
            )}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
          disabled={isSubmitting}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Car size={20} color="#fff" />
          <Text style={styles.submitBtnText}>{isSubmitting ? 'Solicitando...' : 'Solicitar Viaje'}</Text>
        </TouchableOpacity>
      </KeyboardScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 4,
  },
  selectionCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  driverCard: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  selectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionName: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectionSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  driverTags: {
    flexDirection: 'row',
    gap: 4,
  },
  driverTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
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
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  inputWithIcon: {
    paddingLeft: 46,
  },
  estimateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 12,
  },
  estimateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  estimateCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estimateItem: {
    alignItems: 'center',
    gap: 6,
  },
  estimateLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  estimatePrice: {
    fontSize: 20,
    fontWeight: '900',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
