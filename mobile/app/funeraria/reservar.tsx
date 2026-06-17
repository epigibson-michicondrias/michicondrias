import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryBooking } from '@/src/hooks/funerary/useFuneraryBooking';
import { FuneraryService } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Calendar, DollarSign, Check, Heart, Info, Send } from 'lucide-react-native';

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
                            <Text style={[styles.tagText, { color: theme.secondary }]}>{item.cremation_type}</Text>
                        </View>
                    )}
                    {item.urn_included && (
                        <View style={[styles.tag, { backgroundColor: '#f59e0b20' }]}>
                            <Text style={[styles.tagText, { color: '#f59e0b' }]}>Urna incluida</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📅 Reservar Servicio"
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
                        <Text style={[styles.label, { color: theme.text }]}>ID de Mascota *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Ingresa el ID de tu mascota"
                            placeholderTextColor={theme.textMuted}
                            value={form.pet_id}
                            onChangeText={(val) => updateForm('pet_id', val)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Fecha Programada *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textMuted}
                            value={form.scheduled_date}
                            onChangeText={(val) => updateForm('scheduled_date', val)}
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
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        paddingHorizontal: 24,
        marginTop: 16,
        marginBottom: 12,
    },
    servicesList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    serviceCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: '700',
    },
    serviceDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginTop: 2,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginLeft: 34,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    formSection: {
        marginTop: 24,
        gap: 16,
    },
    inputGroup: {
        gap: 8,
        paddingHorizontal: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 100,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
        marginHorizontal: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 24,
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
