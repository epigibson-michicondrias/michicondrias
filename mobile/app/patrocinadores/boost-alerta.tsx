import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCampaignForm } from '@/src/hooks/sponsors/useCampaignForm';
import { LostPetReport } from '@/src/services/perdidas';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Zap, DollarSign, MapPin, PawPrint, Check } from 'lucide-react-native';

export default function BoostAlertaScreen() {
    const { theme } = useTheme();
    const {
        boostForm,
        updateBoostField,
        handleSubmitBoost,
        isSubmittingBoost,
        lostPetReports,
        isLoadingReports,
    } = useCampaignForm('boost');

    const renderReportItem = ({ item }: { item: LostPetReport }) => {
        const isSelected = boostForm.lost_pet_report_id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.reportCard,
                    {
                        backgroundColor: isSelected ? theme.primary + '15' : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                    },
                ]}
                onPress={() => updateBoostField('lost_pet_report_id', item.id)}
            >
                <View style={styles.reportHeader}>
                    <View style={[styles.petIcon, { backgroundColor: theme.primary + '20' }]}>
                        <PawPrint size={20} color={theme.primary} />
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={[styles.petName, { color: theme.text }]}>{item.pet_name}</Text>
                        <Text style={[styles.petSpecies, { color: theme.textMuted }]}>
                            {item.species} {item.breed ? `• ${item.breed}` : ''}
                        </Text>
                    </View>
                    {isSelected && (
                        <View style={[styles.checkIcon, { backgroundColor: theme.primary }]}>
                            <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                    )}
                </View>
                {item.last_seen_location && (
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
                            {item.last_seen_location}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="⚡ Impulsar Alerta"
                subtitle="Amplía el alcance de una alerta de mascota perdida"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <FormSection title="Selecciona un reporte">
                        {isLoadingReports ? (
                            <LoadingOverlay message="Cargando reportes..." />
                        ) : lostPetReports.length === 0 ? (
                            <EmptyState
                                icon={<PawPrint size={32} color={theme.textMuted} />}
                                title="No hay reportes activos"
                            />
                        ) : (
                            <FlatList
                                data={lostPetReports}
                                renderItem={renderReportItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </FormSection>

                    <FormSection title="Configuración del impulso">
                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <MapPin size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Radio extra (metros)"
                                    placeholderTextColor={theme.textMuted}
                                    value={boostForm.extra_radius_meters}
                                    onChangeText={(v) => updateBoostField('extra_radius_meters', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={[styles.radiusInfo, { backgroundColor: theme.secondary + '10' }]}>
                            <Text style={[styles.radiusInfoText, { color: theme.textMuted }]}>
                                Radio adicional: {Number(boostForm.extra_radius_meters || 0).toLocaleString()} metros ({(Number(boostForm.extra_radius_meters || 0) / 1000).toFixed(1)} km)
                            </Text>
                        </View>

                        <View style={[styles.inputGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.inputRow}>
                                <DollarSign size={18} color={theme.secondary} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Monto a pagar (MXN)"
                                    placeholderTextColor={theme.textMuted}
                                    value={boostForm.amount_paid}
                                    onChangeText={(v) => updateBoostField('amount_paid', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </FormSection>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            isSubmittingBoost && styles.submitDisabled,
                        ]}
                        onPress={handleSubmitBoost}
                        disabled={isSubmittingBoost}
                    >
                        {isSubmittingBoost ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Zap size={20} color="#fff" />
                                <Text style={styles.submitText}>Impulsar Alerta</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    form: {
        paddingHorizontal: 24,
    },
    reportCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        marginBottom: 10,
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    petIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    petSpecies: {
        fontSize: 13,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    locationText: {
        fontSize: 12,
        flex: 1,
    },
    inputGroup: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 16,
    },
    radiusInfo: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    radiusInfoText: {
        fontSize: 13,
        textAlign: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 8,
        gap: 10,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
