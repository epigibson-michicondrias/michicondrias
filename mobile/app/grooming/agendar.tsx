/**
 * Agendar Grooming — Book a grooming appointment
 * Service → Pet → Date → Time slot → Confirm
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import DatePicker from '@/src/components/DatePicker';
import { Scissors, Clock, PawPrint, Sparkles, Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useGroomingBooking } from '@/src/hooks/grooming/useGroomingBooking';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import FormSection from '@/src/components/forms/FormSection';
import type { GroomingService } from '@/src/services/grooming';
import type { Pet } from '@/src/types/mascotas';
import { font, spacing } from '@/constants/design';

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
            <TouchableOpacity accessibilityRole="button"
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
                        {service.groomer_rating_count ? (
                            <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>
                                · ★ {(service.groomer_rating_avg ?? 0).toFixed(1)} ({service.groomer_rating_count})
                            </Text>
                        ) : null}
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
            <TouchableOpacity accessibilityRole="button"
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
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Service selector ───────────────────────── */}
                <FormSection title="Elige un Servicio">
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
                <FormSection title="¿Para quién es la cita?">
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
                <FormSection title="Fecha">
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
                    <FormSection title="Horarios Disponibles">
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
                                        <TouchableOpacity accessibilityRole="button"
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

                <TouchableOpacity accessibilityRole="button"
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
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxl,
    },
    loader: {
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: font.base,
        textAlign: 'center',
        paddingVertical: spacing.xl,
    },

    // Service cards
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: spacing.md,
        gap: spacing.lg,
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
        fontSize: font.xl,
        fontWeight: '800',
        marginBottom: spacing.xxs,
    },
    serviceDesc: {
        fontSize: font.base,
        marginBottom: spacing.xs,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    servicePrice: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    serviceDuration: {
        fontSize: font.base,
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
        gap: spacing.md,
        paddingRight: spacing.xxl,
    },
    petCard: {
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1.5,
        width: 100,
        gap: spacing.sm,
    },
    petAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    petName: {
        fontSize: font.base,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Date
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 14,
        borderWidth: 1,
        gap: spacing.md,
    },
    datePicker: {
        flex: 1,
    },

    // Slots
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    slotChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.sm,
    },
    slotText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    noSlotsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 14,
        gap: spacing.md,
    },
    noSlotsText: {
        flex: 1,
        fontSize: font.base,
    },

    // Summary
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.xl,
        gap: spacing.lg,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: font.lg,
        fontWeight: '800',
        marginBottom: spacing.xxs,
    },
    summaryDetail: {
        fontSize: font.base,
    },

    // Book button
    bookBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderRadius: 16,
        gap: spacing.md,
    },
    bookBtnText: {
        fontSize: font.xxl,
        fontWeight: '800',
        color: '#fff',
    },
    bottomSpacer: {
        height: 60,
    },
});
