import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryBooking } from '@/src/hooks/funerary/useFuneraryBooking';
import { FuneraryService, cremationLabel } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import DatePicker from '@/src/components/DatePicker';
import PetPicker from '@/src/features/salud/PetPicker';
import { toISODate } from '@/src/features/salud/format';
import { DollarSign, Check, Heart, Info } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function ReservarScreen() {
    const { theme } = useTheme();
    const {
        form,
        updateForm,
        selectedServiceId,
        setSelectedServiceId,
        availableServices,
        isLoadingServices,
        handleBooking,
        isBooking,
    } = useFuneraryBooking();

    const renderServiceOption = ({ item }: { item: FuneraryService }) => {
        const isSelected = selectedServiceId === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.serviceCard,
                    { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : theme.border },
                    isSelected && { borderWidth: 2 },
                ]}
                onPress={() => setSelectedServiceId(item.id)}
            >
                <View style={styles.serviceHeader}>
                    <View style={[styles.radioCircle, { borderColor: isSelected ? theme.primary : theme.textMuted }]}>
                        {isSelected && <View style={[styles.radioFill, { backgroundColor: theme.primary }]} />}
                    </View>
                    <View style={styles.serviceInfo}>
                        <Text style={[styles.serviceName, { color: theme.text }]}>{item.name}</Text>
                        {item.description && (
                            <Text style={[styles.serviceDesc, { color: theme.textMuted }]} numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: theme.primary + '10' }]}>
                        <DollarSign size={12} color={theme.primary} />
                        <Text style={[styles.tagText, { color: theme.primary }]}>${item.price}</Text>
                    </View>
                    {item.cremation_type && (
                        <View style={[styles.tag, { backgroundColor: theme.secondary + '10' }]}>
                            <Text style={[styles.tagText, { color: theme.secondary }]}>{cremationLabel(item.cremation_type)}</Text>
                        </View>
                    )}
                    {item.urn_included && (
                        <View style={[styles.tag, { backgroundColor: theme.warningLight }]}>
                            <Text style={[styles.tagText, { color: theme.warning }]}>Urna incluida</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Reservar Servicio"
                subtitle="Selecciona un servicio funerario"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                {/* Services list */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Disponibles</Text>

                {isLoadingServices ? (
                    <LoadingOverlay message="Cargando servicios..." />
                ) : availableServices.length === 0 ? (
                    <EmptyState
                        icon={<Heart size={32} color={theme.textMuted} />}
                        title="No hay servicios disponibles"
                    />
                ) : (
                    <View style={styles.servicesList}>
                        {availableServices.map((service) => (
                            <View key={service.id}>
                                {renderServiceOption({ item: service })}
                            </View>
                        ))}
                    </View>
                )}

                {/* Booking form */}
                <View style={styles.formSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Datos de la Reserva</Text>

                    <View style={styles.inputGroup}>
                        <PetPicker value={form.pet_id} onChange={(id) => updateForm('pet_id', id)} />
                    </View>

                    <View style={styles.inputGroup}>
                        <DatePicker
                            label="Fecha Programada *"
                            value={form.scheduled_date ? new Date(form.scheduled_date + 'T12:00:00') : new Date()}
                            minimumDate={new Date()}
                            placeholder="Seleccionar fecha"
                            onChange={(d) => updateForm('scheduled_date', toISODate(d))}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Notas (opcional)</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Instrucciones especiales..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={form.notes}
                            onChangeText={(val) => updateForm('notes', val)}
                        />
                    </View>

                    {/* Info */}
                    <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={18} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Recibirás una confirmación una vez que el proveedor acepte tu reserva.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }, isBooking && { opacity: 0.7 }]}
                        disabled={isBooking}
                        onPress={handleBooking}
                    >
                        <Check size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>
                            {isBooking ? 'Reservando...' : 'Confirmar Reserva'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingBottom: spacing.huge,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '800',
        paddingHorizontal: spacing.xxl,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    servicesList: {
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
    },
    serviceCard: {
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioFill: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: font.xl,
        fontWeight: '700',
    },
    serviceDesc: {
        fontSize: font.base,
        lineHeight: 18,
        marginTop: spacing.xxs,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginLeft: spacing.xxxl,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        gap: spacing.xs,
    },
    tagText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    formSection: {
        marginTop: spacing.xxl,
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.sm,
        paddingHorizontal: spacing.xxl,
    },
    label: {
        fontSize: font.base,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        fontSize: font.xl,
        borderWidth: 1,
    },
    textArea: {
        height: 100,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: font.xl,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 16,
        gap: spacing.md,
        alignItems: 'center',
        marginHorizontal: spacing.xxl,
    },
    infoText: {
        flex: 1,
        fontSize: font.md,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
        marginHorizontal: spacing.xxl,
        marginTop: spacing.md,
        marginBottom: spacing.huge,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: font.xxl,
        fontWeight: '800',
    },
});
