import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Stethoscope, Clock, AlertTriangle, PawPrint, Phone, Building2 } from 'lucide-react-native';
import { useBookAppointment } from '@/src/hooks/directorio/useBookAppointment';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormSwitch from '@/src/components/forms/FormSwitch';
import FilterChip from '@/src/components/FilterChip';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

export default function AgendarCitaScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        clinic, pets, services, slots, clinicLoading, clinicError, refetchClinic, petsLoading, servicesLoading,
        slotsLoading, slotsError, refetchSlots, isRescheduling,
        selectedPet, selectedService, selectedDate, selectedSlot, reason, isEmergency, isPending,
        setSelectedPet, setSelectedService, setSelectedDate, setSelectedSlot, setReason,
        toggleEmergency, handleAgendar,
    } = useBookAppointment();
    const title = isRescheduling ? 'Reagendar cita' : 'Agendar cita';

    if (clinicLoading || petsLoading || servicesLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <View style={styles.content}>
                    <Skeleton height={72} />
                    <Skeleton height={90} />
                    <Skeleton height={140} />
                    <Skeleton height={90} />
                </View>
            </ScreenContainer>
        );
    }

    if (!clinic) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <EmptyState
                    icon={<Building2 size={layout.icon.xl} color={theme.textMuted} />}
                    title={clinicError ? 'No pudimos cargar la clínica' : 'No encontramos esta clínica'}
                    subtitle={clinicError ? 'Revisa tu conexión e inténtalo de nuevo.' : 'Puede que ya no esté en el directorio.'}
                    actionLabel={clinicError ? 'Reintentar' : 'Ver directorio'}
                    onAction={clinicError ? () => refetchClinic() : () => router.replace('/directorio')}
                />
            </ScreenContainer>
        );
    }

    const service = services.find((s) => s.id === selectedService);

    return (
        <ScreenContainer>
            <ScreenHeader title={title} subtitle={clinic.name} />
            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <DetailFooter>
                        <Button
                            label={isRescheduling ? 'Confirmar nuevo horario' : selectedSlot ? `Agendar a las ${selectedSlot}` : 'Agendar cita'}
                            icon={<Calendar size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={handleAgendar}
                            loading={isPending}
                            size="lg"
                            style={styles.flex}
                        />
                    </DetailFooter>
                )}
            >
                {/* Clínica */}
                <Card style={styles.clinicCard}>
                    <View style={styles.clinic}>
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + tint.faint }]}>
                            <Stethoscope size={layout.icon.md} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{clinic.name}</Text>
                            {clinic.city ? (
                                <View style={styles.meta}>
                                    <MapPin size={layout.icon.xs} color={theme.textMuted} />
                                    <Text style={[type.caption, { color: theme.textMuted }]}>{clinic.city}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                    {clinic.is_24_hours || clinic.has_emergency ? (
                        <View style={styles.badges}>
                            {clinic.is_24_hours ? <Badge label="24 horas" color={theme.info} size="sm" icon={<Clock size={layout.icon.xs} color={theme.info} />} /> : null}
                            {clinic.has_emergency ? <Badge label="Urgencias" color={theme.error} size="sm" icon={<AlertTriangle size={layout.icon.xs} color={theme.error} />} /> : null}
                        </View>
                    ) : null}
                </Card>

                {!isRescheduling ? (
                    <FormSection title="¿Para quién?">
                        {pets.length === 0 ? (
                            <View style={styles.inline}>
                                <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>Agrega a tu mascota para poder agendar.</Text>
                                <Button label="Agregar" size="sm" onPress={() => router.push('/mascotas/nuevo')} />
                            </View>
                        ) : (
                            <View style={styles.chips}>
                                {pets.map((pet) => {
                                    const active = selectedPet === pet.id;
                                    return (
                                        <FilterChip
                                            key={pet.id}
                                            label={pet.name}
                                            active={active}
                                            onPress={() => setSelectedPet(pet.id)}
                                            icon={<PawPrint size={layout.icon.xs} color={active ? theme.onPrimary : theme.textMuted} />}
                                        />
                                    );
                                })}
                            </View>
                        )}
                    </FormSection>
                ) : null}

                <FormSection title="Servicio">
                    {services.length === 0 ? (
                        <Text style={[type.body, { color: theme.textMuted }]}>Esta clínica aún no tiene servicios para agendar en línea. Llámales para hacer tu cita.</Text>
                    ) : (
                        <View style={styles.services}>
                            {services.map((svc) => {
                                const active = selectedService === svc.id;
                                return (
                                    <Card
                                        key={svc.id}
                                        onPress={isRescheduling ? undefined : () => setSelectedService(svc.id)}
                                        style={active ? { borderColor: theme.primary, backgroundColor: theme.primary + tint.faint } : undefined}
                                        accessibilityLabel={`${svc.name}, ${svc.duration_minutes} minutos${svc.price ? `, ${formatCurrency(svc.price)}` : ''}`}
                                    >
                                        <View style={styles.service}>
                                            <View style={styles.flex}>
                                                <Text style={[type.bodyStrong, { color: active ? theme.primary : theme.text }]}>{svc.name}</Text>
                                                <Text style={[type.caption, { color: theme.textMuted }]}>{svc.duration_minutes} min</Text>
                                            </View>
                                            {svc.price ? <Text style={[type.bodyStrong, { color: theme.text }]}>{formatCurrency(svc.price)}</Text> : null}
                                        </View>
                                    </Card>
                                );
                            })}
                        </View>
                    )}
                </FormSection>

                <FormSection title="Fecha y hora">
                    <DatePicker value={selectedDate} onChange={setSelectedDate} mode="date" label="Día" placeholder="Elige el día" minimumDate={new Date()} />
                    {!selectedService ? (
                        <Text style={[type.body, { color: theme.textMuted }]}>Elige un servicio para ver los horarios.</Text>
                    ) : slotsLoading ? (
                        <View style={styles.chips}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} width={72} height={36} borderRadius={radius.pill} />)}</View>
                    ) : slotsError ? (
                        <View style={styles.inline}>
                            <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>No pudimos cargar los horarios.</Text>
                            <Button label="Reintentar" size="sm" variant="secondary" onPress={() => refetchSlots()} />
                        </View>
                    ) : slots.length === 0 ? (
                        <Text style={[type.body, { color: theme.textMuted }]}>No quedan horarios ese día{service ? ` para ${service.name.toLowerCase()}` : ''}. Prueba con otra fecha.</Text>
                    ) : (
                        <View style={styles.chips}>
                            {slots.map((slot) => (
                                <FilterChip key={slot.start_time} label={slot.start_time} active={selectedSlot === slot.start_time} onPress={() => setSelectedSlot(slot.start_time)} />
                            ))}
                        </View>
                    )}
                </FormSection>

                {!isRescheduling ? (
                    <FormSection title="Motivo">
                        <FormField
                            label="¿Qué le pasa o qué necesita?"
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Síntomas, desde cuándo, o el motivo de la visita"
                            multiline
                        />
                        <FormSwitch
                            variant="switch"
                            label="Es urgente"
                            description="La clínica verá la cita marcada como urgente."
                            value={isEmergency}
                            onChange={toggleEmergency}
                        />
                        {isEmergency ? (
                            <View style={[styles.note, { backgroundColor: theme.error + tint.faint }]}>
                                <Phone size={layout.icon.sm} color={theme.error} />
                                <Text style={[type.body, styles.flex, { color: theme.text }]}>
                                    Si su vida corre peligro, no esperes la confirmación: llama a la clínica o ve directo{clinic.has_emergency ? ' (atienden urgencias)' : ''}.
                                </Text>
                            </View>
                        ) : null}
                    </FormSection>
                ) : null}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl },
    clinicCard: { marginBottom: spacing.xl },
    clinic: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconBox: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    services: { gap: spacing.sm },
    service: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
});
