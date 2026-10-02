import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calculator, Car, Clock, Info, LocateFixed, MapPin, PawPrint, Route, Users, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useRequestRide } from '@/src/hooks/rides/useRequestRide';
import type { Pet } from '@/src/types/mascotas';
import type { DriverProfile } from '@/src/services/rides';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import { SkeletonList } from '@/src/components/Skeleton';
import { formatMoney } from '@/src/components/rides/rideStatus';
import { radius, spacing, type } from '@/constants/design';

export default function SolicitarTransporteScreen() {
  const { theme } = useTheme();
  const {
    form,
    updateForm,
    estimate,
    estimateNote,
    pets,
    drivers,
    isLoading,
    handleEstimate,
    handleSubmit,
    useMyLocation,
    canEstimate,
    isLocating,
    isEstimating,
    isSubmitting,
    router,
  } = useRequestRide();
  const [scheduled, setScheduled] = useState(!!form.scheduled_at);

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />
        <View style={styles.pad}>
          <SkeletonList count={3} />
        </View>
      </ScreenContainer>
    );
  }

  if (pets.length === 0) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />
        <EmptyState
          icon={<PawPrint size={32} color={theme.textMuted} />}
          title="Primero registra a tu mascota"
          subtitle="Necesitamos saber quién viajará para asignarte el conductor adecuado."
          actionLabel="Registrar mascota"
          onAction={() => router.push('/mascotas/nuevo' as any)}
        />
      </ScreenContainer>
    );
  }

  const selectedPet = pets.find((p) => p.id === form.pet_id);
  const selectedDriver = drivers.find((d) => d.driver_id === form.driver_id);

  const inputStyle = [styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }];

  return (
    <ScreenContainer>
      <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />

      <KeyboardScreen contentContainerStyle={styles.scrollContent}>
        <FormSection title="🐾 Selecciona tu mascota">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectionRow}>
            {pets.map((pet: Pet) => {
              const isSelected = form.pet_id === pet.id;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.selectionCard,
                    { backgroundColor: isSelected ? theme.primary + '15' : theme.surface, borderColor: isSelected ? theme.primary : theme.border },
                  ]}
                  onPress={() => updateForm({ pet_id: pet.id })}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Mascota ${pet.name}`}
                  accessibilityState={{ selected: isSelected }}
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

        <FormSection title="📍 Direcciones">
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Origen *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={theme.success} style={styles.inputIcon} />
              <TextInput
                style={[...inputStyle, styles.inputWithIcon]}
                placeholder="Calle, número y ciudad"
                placeholderTextColor={theme.textMuted}
                value={form.origin_address}
                onChangeText={(val) => updateForm({ origin_address: val })}
                maxLength={255}
                accessibilityLabel="Dirección de origen"
              />
            </View>
            <TouchableOpacity
              style={styles.locateBtn}
              onPress={useMyLocation}
              disabled={isLocating}
              accessibilityRole="button"
              accessibilityLabel="Usar mi ubicación como origen"
            >
              <LocateFixed size={14} color={theme.primary} />
              <Text style={[type.caption, { color: theme.primary, fontWeight: '700' }]}>
                {isLocating ? 'Ubicando...' : 'Usar mi ubicación'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Destino *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[...inputStyle, styles.inputWithIcon]}
                placeholder="Veterinaria, estética, casa..."
                placeholderTextColor={theme.textMuted}
                value={form.destination_address}
                onChangeText={(val) => updateForm({ destination_address: val })}
                maxLength={255}
                accessibilityLabel="Dirección de destino"
              />
            </View>
          </View>
        </FormSection>

        <FormSection title="🚙 Conductor (opcional)">
          {drivers.length === 0 ? (
            <Text style={[type.body, { color: theme.textMuted }]}>
              Por ahora no hay conductores disponibles; tu solicitud quedará abierta hasta que alguien la acepte.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectionRow}>
              <TouchableOpacity
                style={[
                  styles.driverCard,
                  { backgroundColor: !form.driver_id ? theme.primary + '15' : theme.surface, borderColor: !form.driver_id ? theme.primary : theme.border },
                ]}
                onPress={() => updateForm({ driver_id: '' })}
                accessibilityRole="button"
                accessibilityLabel="Cualquier conductor disponible"
                accessibilityState={{ selected: !form.driver_id }}
              >
                <View style={[styles.selectionIcon, { backgroundColor: !form.driver_id ? theme.primary + '20' : theme.background }]}>
                  <Users size={20} color={!form.driver_id ? theme.primary : theme.textMuted} />
                </View>
                <Text style={[styles.selectionName, { color: !form.driver_id ? theme.primary : theme.text }]} numberOfLines={1}>
                  Cualquiera
                </Text>
                <Text style={[styles.selectionSub, { color: theme.textMuted }]}>El más rápido</Text>
              </TouchableOpacity>
              {drivers.map((driver: DriverProfile) => {
                const isSelected = form.driver_id === driver.driver_id;
                return (
                  <TouchableOpacity
                    key={driver.id}
                    style={[
                      styles.driverCard,
                      { backgroundColor: isSelected ? theme.primary + '15' : theme.surface, borderColor: isSelected ? theme.primary : theme.border },
                    ]}
                    onPress={() => updateForm({ driver_id: driver.driver_id })}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Conductor ${driver.vehicle_model}, placa ${driver.vehicle_plate}`}
                    accessibilityState={{ selected: isSelected }}
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
                    <Text style={[styles.selectionSub, { color: theme.textMuted }]}>
                      {driver.rating_avg != null ? `★ ${driver.rating_avg.toFixed(1)} · ` : ''}
                      {driver.max_capacity} 🐾
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </FormSection>

        <FormSection title="⚙️ Opciones">
          <FormSwitch
            label="Requiere transportín"
            description="Necesito que el conductor traiga transportín (costo extra)"
            value={form.requires_carrier}
            onChange={(val) => updateForm({ requires_carrier: val })}
          />
          <FormSwitch
            label="Programar para después"
            description="Elige día y hora del viaje"
            value={scheduled}
            onChange={(val) => {
              setScheduled(val);
              updateForm({ scheduled_at: val ? new Date(Date.now() + 60 * 60_000) : null });
            }}
          />
          {scheduled && form.scheduled_at && (
            <DatePicker
              mode="datetime"
              label="Fecha y hora"
              value={form.scheduled_at}
              minimumDate={new Date()}
              onChange={(d) => updateForm({ scheduled_at: d })}
            />
          )}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Notas para el conductor</Text>
            <TextInput
              style={[...inputStyle, styles.notes]}
              placeholder="Ej. Mi perro se pone nervioso, toca el timbre dos veces"
              placeholderTextColor={theme.textMuted}
              value={form.notes}
              onChangeText={(val) => updateForm({ notes: val })}
              maxLength={500}
              multiline
              accessibilityLabel="Notas para el conductor"
            />
          </View>
        </FormSection>

        <FormSection title="💰 Tarifa estimada">
          <Button
            label={isEstimating ? 'Calculando...' : 'Calcular tarifa'}
            variant="secondary"
            icon={<Calculator size={18} color={theme.primary} />}
            disabled={!canEstimate || isEstimating}
            loading={isEstimating}
            onPress={handleEstimate}
          />
          {estimate && (
            <Card style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <View style={styles.estimateItem} accessible accessibilityLabel={`Distancia ${estimate.distance_km.toFixed(1)} kilómetros`}>
                  <Route size={16} color={theme.primary} />
                  <Text style={[type.caption, { color: theme.textMuted }]}>Distancia</Text>
                  <Text style={[type.title, { color: theme.text }]}>{estimate.distance_km.toFixed(1)} km</Text>
                </View>
                <View style={styles.estimateItem} accessible accessibilityLabel={`Duración ${estimate.estimated_duration_minutes} minutos`}>
                  <Clock size={16} color={theme.primary} />
                  <Text style={[type.caption, { color: theme.textMuted }]}>Duración</Text>
                  <Text style={[type.title, { color: theme.text }]}>{Math.round(estimate.estimated_duration_minutes)} min</Text>
                </View>
                <View style={styles.estimateItem} accessible accessibilityLabel={`Tarifa ${formatMoney(estimate.estimated_fare)}`}>
                  <DollarSign size={16} color={theme.primary} />
                  <Text style={[type.caption, { color: theme.textMuted }]}>Tarifa</Text>
                  <Text style={[type.h2, { color: theme.primary }]}>{formatMoney(estimate.estimated_fare)}</Text>
                </View>
              </View>
            </Card>
          )}
          {!!estimateNote && <Text style={[type.caption, { color: theme.textMuted }]}>{estimateNote}</Text>}
        </FormSection>

        <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
          <Info size={18} color={theme.primary} />
          <Text style={[type.caption, styles.flex, { color: theme.textMuted }]}>
            La tarifa final la calcula el servicio según la distancia. Un conductor aceptará tu solicitud y podrás seguir el viaje en tiempo real.
          </Text>
        </View>

        {(selectedPet || selectedDriver) && (
          <Card style={styles.summary}>
            <Text style={[type.title, { color: theme.text }]}>Resumen</Text>
            {selectedPet && <Text style={[type.body, { color: theme.textMuted }]}>🐾 Mascota: {selectedPet.name}</Text>}
            {selectedDriver && (
              <Text style={[type.body, { color: theme.textMuted }]}>
                🚙 Conductor sugerido: {selectedDriver.vehicle_model} ({selectedDriver.vehicle_plate})
              </Text>
            )}
          </Card>
        )}

        <Button
          label={isSubmitting ? 'Solicitando...' : 'Solicitar viaje'}
          size="lg"
          icon={<Car size={20} color="#fff" />}
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={styles.submit}
        />
      </KeyboardScreen>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 20 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  selectionRow: { flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.xs },
  selectionCard: { width: 120, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, alignItems: 'center', gap: spacing.sm },
  driverCard: { width: 140, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, alignItems: 'center', gap: spacing.sm },
  selectionIcon: { width: 44, height: 44, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  selectionName: { fontSize: 14, fontWeight: '700' },
  selectionSub: { fontSize: 12, fontWeight: '500' },
  inputGroup: { gap: spacing.sm, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '700', marginLeft: spacing.xs },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 16, top: 18, zIndex: 1 },
  input: { minHeight: 56, borderRadius: radius.lg, paddingHorizontal: spacing.lg, fontSize: 15, borderWidth: 1 },
  inputWithIcon: { paddingLeft: 46 },
  notes: { minHeight: 80, paddingTop: spacing.md, textAlignVertical: 'top' },
  locateBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 44, paddingHorizontal: spacing.xs },
  estimateCard: { marginTop: spacing.md },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-around' },
  estimateItem: { alignItems: 'center', gap: spacing.xs },
  infoBox: { flexDirection: 'row', padding: spacing.lg, borderRadius: radius.lg, gap: spacing.md, alignItems: 'center', marginBottom: spacing.lg },
  summary: { marginBottom: spacing.lg, gap: spacing.sm },
  submit: { marginTop: spacing.sm, marginBottom: 40 },
});
