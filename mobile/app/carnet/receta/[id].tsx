import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { usePrescriptionDetail } from '@/src/hooks/carnet/usePrescriptionDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { ShoppingBag, Share2, Bell } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';


export default function PrescriptionDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pet, record, loading } = usePrescriptionDetail();

    if (loading) {
        return (
            <ScreenContainer><SkeletonList count={4} /></ScreenContainer>
        );
    }

    if (!record) {
        return (
            <ScreenContainer style={styles.center}>
                <Text style={[styles.errorText, { color: theme.text }]}>Receta no encontrada</Text>
                <TouchableOpacity 
                    style={[styles.backErrorBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.back()}
                    accessibilityRole="button"
                >
                    <Text style={styles.backErrorBtnText}>Volver</Text>
                </TouchableOpacity>
            </ScreenContainer>
        );
    }

    const handleShare = async () => {
        const lines = [
            `Receta digital RX-${record.id.substring(0, 8).toUpperCase()}`,
            `Paciente: ${pet?.name ?? 'N/A'}`,
            `Fecha: ${new Date(record.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            `Motivo: ${record.reason_for_visit}`,
            ...(record.diagnosis ? [`Diagnóstico: ${record.diagnosis}`] : []),
            '',
            'Medicamentos:',
            ...(record.prescriptions ?? []).map(
                (p) => `- ${p.medication_name}: ${p.dosage}, cada ${p.frequency_hours} h por ${p.duration_days} días${p.instructions ? ` (${p.instructions})` : ''}`
            ),
        ];
        try {
            await Share.share({ message: lines.join('\n'), title: 'Receta digital' });
        } catch {
            // El usuario canceló o el sistema no pudo abrir el menú de compartir
        }
    };

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Receta médica" />

            <ScrollView 
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.ticketContainer, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    
                    <View style={[styles.ticketHeader, { borderBottomColor: theme.borderLight }]}>
                        <View style={styles.ticketHeaderRow}>
                            <View style={[styles.logoIcon, { backgroundColor: theme.primary + '15' }]}>
                                <ShoppingBag size={22} color={theme.primary} />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={[styles.ticketTitle, { color: theme.text }]}>RECETA DIGITAL</Text>
                                <Text style={[styles.ticketSubtitle, { color: theme.textMuted }]}>Michicondrias Vet Clinica</Text>
                            </View>
                        </View>
                        <View style={styles.ticketMetaRow}>
                            <Text style={[styles.ticketMetaLabel, { color: theme.textMuted }]}>
                                Folio: RX-{record.id.substring(0, 8).toUpperCase()}
                            </Text>
                            <Text style={[styles.ticketMetaLabel, { color: theme.textMuted }]}>
                                Fecha: {new Date(record.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.ticketSection, { borderBottomColor: theme.borderLight }]}>
                        <Text style={[styles.ticketSectionTitle, { color: theme.primary }]}>PACIENTE</Text>
                        <View style={styles.ticketRow}>
                            <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Nombre:</Text>
                            <Text style={[styles.ticketValue, { color: theme.text }]}>{pet?.name}</Text>
                        </View>
                        <View style={styles.ticketRow}>
                            <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Especie / Raza:</Text>
                            <Text style={[styles.ticketValue, { color: theme.text }]}>
                                {pet?.species === 'perro' ? 'Perro' : pet?.species === 'gato' ? 'Gato' : pet?.species || 'N/A'} · {pet?.breed || 'N/A'}
                            </Text>
                        </View>
                        {record.weight_kg && (
                            <View style={styles.ticketRow}>
                                <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Peso registrado:</Text>
                                <Text style={[styles.ticketValue, { color: theme.text }]}>{record.weight_kg} kg</Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.ticketSection, { borderBottomColor: theme.borderLight }]}>
                        <Text style={[styles.ticketSectionTitle, { color: theme.primary }]}>CONSULTA</Text>
                        <View style={styles.ticketRow}>
                            <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Motivo:</Text>
                            <Text style={[styles.ticketValue, { color: theme.text }]}>{record.reason_for_visit}</Text>
                        </View>
                        {record.diagnosis && (
                            <View style={styles.ticketRow}>
                                <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Diagnóstico:</Text>
                                <Text style={[styles.ticketValue, { color: theme.text }]}>{record.diagnosis}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.ticketSection}>
                        <Text style={[styles.ticketSectionTitle, { color: theme.primary }]}>MEDICAMENTOS PRESCRITOS</Text>
                        {record.prescriptions?.map((p, idx) => (
                            <View key={idx} style={[styles.ticketMedCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                                <Text style={[styles.ticketMedName, { color: theme.text }]}>{p.medication_name}</Text>
                                <Text style={[styles.ticketMedDetails, { color: theme.textMuted }]}>
                                    Dosis: {p.dosage}
                                </Text>
                                <Text style={[styles.ticketMedDetails, { color: theme.textMuted }]}>
                                    Frecuencia: Cada {p.frequency_hours} horas por {p.duration_days} días
                                </Text>
                                {p.instructions && (
                                    <View style={[styles.ticketInstructionsContainer, { borderTopColor: theme.borderLight }]}>
                                        <Text style={[styles.ticketInstructionsText, { color: theme.text }]}>
                                            Instrucciones: {p.instructions}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Recordatorios de medicación */}
                    {record.prescriptions && record.prescriptions.length > 0 && (
                        <View style={[styles.ticketSection, { borderBottomColor: theme.borderLight }]}>
                            <View style={styles.reminderHeader}>
                                <Text style={[styles.ticketSectionTitle, { color: theme.primary, marginBottom: 0 }]}>
                                    RECORDATORIOS
                                </Text>
                                <Bell size={16} color={theme.primary} />
                            </View>
                            <Text style={[styles.barcodeSubText, { color: theme.textMuted, textAlign: 'left', paddingHorizontal: 0 }]}>
                                Te avisamos cuando le toque cada dosis. Puedes marcarlas como dadas en la pestaña Salud de {pet?.name ?? 'tu mascota'}.
                            </Text>
                        </View>
                    )}

                    {/* QR para surtir en farmacia / verificar receta */}
                    <View style={[styles.ticketSection, { borderBottomColor: theme.borderLight, alignItems: 'center' }]}>
                        <Text style={[styles.ticketSectionTitle, { color: theme.primary, textAlign: 'center' }]}>SURTIR EN FARMACIA</Text>
                        <View style={[styles.barcodeWrapper, { backgroundColor: theme.background }]}>
                            <QRCode
                                value={`RX-${record.id.substring(0, 8).toUpperCase()}|${pet?.name ?? ''}|${record.date}|${(record.prescriptions ?? []).map((p) => p.medication_name).join(', ')}`}
                                size={160}
                                color={theme.text}
                                backgroundColor={theme.background}
                            />
                            <Text style={[styles.barcodeText, { color: theme.text }]}>
                                RX-{record.id.substring(0, 8).toUpperCase()}
                            </Text>
                            <Text style={[styles.barcodeSubText, { color: theme.textMuted }]}>
                                Muestra este código en la farmacia para surtir tu receta
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                        onPress={handleShare}
                        accessibilityRole="button"
                        accessibilityLabel="Compartir receta"
                    >
                        <Share2 size={18} color={theme.onPrimary} />
                        <Text style={styles.actionBtnText}>Compartir Receta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: font.xl,
        fontWeight: 'bold',
        marginBottom: spacing.lg,
    },
    backErrorBtn: {
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backErrorBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.huge,
    },
    ticketContainer: {
        width: '100%',
        borderRadius: 28,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    ticketHeader: {
        padding: spacing.xxl,
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },
    ticketHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: font.lg,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    ticketSubtitle: {
        fontSize: font.md,
        fontWeight: '600',
    },
    ticketMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ticketMetaLabel: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    ticketBody: {
        padding: spacing.xxl,
    },
    ticketSection: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.xl,
        paddingTop: spacing.xl,
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    ticketSectionTitle: {
        fontSize: font.sm,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: spacing.lg,
    },
    ticketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    ticketLabel: {
        fontSize: font.base,
        fontWeight: '500',
    },
    ticketValue: {
        fontSize: font.base,
        fontWeight: '700',
        textAlign: 'right',
        flex: 1,
        marginLeft: spacing.lg,
    },
    ticketMedCard: {
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    ticketMedName: {
        fontSize: font.lg,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    ticketMedDetails: {
        fontSize: font.md,
        fontWeight: '500',
        marginBottom: spacing.xxs,
    },
    ticketInstructionsContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderStyle: 'dashed',
    },
    ticketInstructionsText: {
        fontSize: font.md,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    cutLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: layout.screenPadding,
        marginVertical: spacing.xxl,
    },
    scissorsIcon: {
        marginRight: spacing.md,
    },
    cutLine: {
        flex: 1,
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },
    barcodeWrapper: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: 16,
        width: '100%',
        gap: spacing.md,
    },
    reminderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    reminderToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    barcodeText: {
        fontSize: font.md,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: spacing.sm,
    },
    barcodeSubText: {
        fontSize: font.xs,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: layout.screenPadding,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xxl,
        paddingHorizontal: spacing.xs,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '800',
    },
});
