/**
 * Agendar Grooming — Book a grooming appointment
 * Service → Pet → Date → Time slot → Confirm
 */
import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import DatePicker from '@/src/components/DatePicker';
import { Scissors, Calendar, Clock, PawPrint, Sparkles, Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingBooking } from '@/src/hooks/grooming/useGroomingBooking';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import type { GroomingService } from '@/src/services/grooming';
import type { Pet } from '@/src/types/mascotas';

export default function AgendarGroomingScreen() {
    const { theme } = useTheme();
    const {
        services,
        pets,
        availableSlots,
        selectedServiceId,
        selectedPetId,
        selectedDate,
        selectedSlot,
        servicesLoading,
        petsLoading,
        slotsLoading,
        isPending,
        setSelectedServiceId,
        setSelectedPetId,
        setSelectedDate,
        setSelectedSlot,
        handleBook,
        canSubmit,
        selectedService,
    } = useGroomingBooking();

    const renderServiceCard = (service: GroomingService) => {
        const isActive = selectedServiceId === service.id;
        return (
            <TouchableOpacity
                key={service.id}
                style={[
                    styles.serviceCard,
                    {
                        backgroundColor: isActive ? theme.primaryLight : theme.surface,
                        borderColor: isActive ? theme.primary : theme.cardBorder,
                    },
                ]}
                onPress={() => {
                    setSelectedServiceId(service.id);
                    setSelectedSlot('');
                }}
                activeOpacity={0.7}
            >
                <View style={[styles.serviceIcon, { backgroundColor: isActive ? theme.primary + '30' : theme.primaryLight }]}>
                    <Scissors size={20} color={isActive ? theme.primary : theme.textMuted} />
                </View>
                <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { color: isActive ? theme.primary : theme.text }]}>
                        {service.name}
                    </Text>
                    {service.description ? (
                        <Text style={[styles.serviceDesc, { color: theme.textMuted }]} numberOfLines={1}>
                            {service.description}
                        </Text>
                    ) : null}
                    <View style={styles.serviceMeta}>
                        <Text style={[styles.servicePrice, { color: theme.secondary }]}>
                            ${service.price}
                        </Text>
                        <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>
                            · {service.duration_minutes} min
                        </Text>
                    </View>
                </View>
                {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                        <Check size={14} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderPetCard = (pet: Pet) => {
        const isActive = selectedPetId === pet.id;
        return (
            <TouchableOpacity
                key={pet.id}
                style={[
                    styles.petCard,
                    {
                        backgroundColor: isActive ? theme.primaryLight : theme.surface,
                        borderColor: isActive ? theme.primary : theme.cardBorder,
                    },
                ]}
                onPress={() => setSelectedPetId(pet.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.petAvatar, { backgroundColor: isActive ? theme.primary + '30' : theme.backgroundSecondary }]}>
                    <PawPrint size={20} color={isActive ? theme.primary : theme.textMuted} />
                </View>
                <Text style={[styles.petName, { color: isActive ? theme.primary : theme.text }]}>
                    {pet.name}
                </Text>
                {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                        <Check size={12} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Agendar Cita"
                subtitle="Spa & Grooming para tu mascota"
                gradient={[theme.primary, theme.secondary]}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Service selector ───────────────────────── */}
                <FormSection title="✨ Elige un Servicio">
                    {servicesLoading ? (
                        <ActivityIndicator color={theme.primary} style={styles.loader} />
                    ) : services.length === 0 ? (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            No hay servicios disponibles por el momento.
                        </Text>
                    ) : (
                        services.map(renderServiceCard)
                    )}
                </FormSection>

                {/* ── Pet selector ───────────────────────────── */}
                <FormSection title="🐾 ¿Para quién es la cita?">
                    {petsLoading ? (
                        <ActivityIndicator color={theme.primary} style={styles.loader} />
                    ) : pets.length === 0 ? (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            Registra una mascota primero.
                        </Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petRow}>
                            {pets.map(renderPetCard)}
                        </ScrollView>
                    )}
                </FormSection>

                {/* ── Date picker ────────────────────────────── */}
                <FormSection title="📅 Fecha">
                    <DatePicker
                        value={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            setSelectedSlot('');
                        }}
                        minimumDate={new Date()}
                    />
                </FormSection>

                {/* ── Available slots ────────────────────────── */}
                {selectedServiceId ? (
                    <FormSection title="🕐 Horarios Disponibles">
                        {slotsLoading ? (
                            <ActivityIndicator color={theme.primary} style={styles.loader} />
                        ) : availableSlots.length === 0 ? (
                            <View style={[styles.noSlotsCard, { backgroundColor: theme.warningLight }]}>
                                <Clock size={18} color={theme.warning} />
                                <Text style={[styles.noSlotsText, { color: theme.text }]}>
                                    No hay horarios disponibles para esta fecha.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.slotsGrid}>
                                {availableSlots.map(slot => {
                                    const isActive = selectedSlot === slot;
                                    return (
                                        <TouchableOpacity
                                            key={slot}
                                            style={[
                                                styles.slotChip,
                                                {
                                                    backgroundColor: isActive ? theme.primary : theme.surface,
                                                    borderColor: isActive ? theme.primary : theme.cardBorder,
                                                },
                                            ]}
                                            onPress={() => setSelectedSlot(slot)}
                                            activeOpacity={0.7}
                                        >
                                            <Clock size={14} color={isActive ? '#fff' : theme.textMuted} />
                                            <Text style={[styles.slotText, { color: isActive ? '#fff' : theme.text }]}>
                                                {slot}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </FormSection>
                ) : null}

                {/* ── Summary & Confirm ─────────────────────── */}
                {canSubmit && selectedService ? (
                    <View style={[styles.summaryCard, { backgroundColor: theme.successLight, borderColor: theme.success + '40' }]}>
                        <Sparkles size={20} color={theme.success} />
                        <View style={styles.summaryInfo}>
                            <Text style={[styles.summaryTitle, { color: theme.text }]}>Resumen de tu cita</Text>
                            <Text style={[styles.summaryDetail, { color: theme.textMuted }]}>
                                {selectedService.name} · {selectedSlot} · ${selectedService.price}
                            </Text>
                        </View>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[
                        styles.bookBtn,
                        {
                            backgroundColor: canSubmit ? theme.primary : theme.border,
                        },
                    ]}
                    onPress={handleBook}
                    disabled={!canSubmit || isPending}
                    activeOpacity={0.8}
                >
                    {isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Sparkles size={20} color="#fff" />
                            <Text style={styles.bookBtnText}>Confirmar Cita</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    loader: {
        paddingVertical: 24,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },

    // Service cards
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 12,
        gap: 14,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    serviceDesc: {
        fontSize: 13,
        marginBottom: 4,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: '700',
    },
    serviceDuration: {
        fontSize: 13,
    },
    checkBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Pet cards
    petRow: {
        flexDirection: 'row',
        gap: 12,
        paddingRight: 24,
    },
    petCard: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        width: 100,
        gap: 8,
    },
    petAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    petName: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Date
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    datePicker: {
        flex: 1,
    },

    // Slots
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slotChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 6,
    },
    slotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    noSlotsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 12,
    },
    noSlotsText: {
        flex: 1,
        fontSize: 14,
    },

    // Summary
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        gap: 14,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 2,
    },
    summaryDetail: {
        fontSize: 13,
    },

    // Book button
    bookBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        gap: 10,
    },
    bookBtnText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },
    bottomSpacer: {
        height: 60,
    },
});
