import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePrescriptionDetail } from '@/src/hooks/carnet/usePrescriptionDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { ShoppingBag, Scissors, QrCode, Share2, Download } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PrescriptionDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pet, record, loading } = usePrescriptionDetail();

    if (loading) {
        return (
            <ScreenContainer style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenContainer>
        );
    }

    if (!record) {
        return (
            <ScreenContainer style={styles.center}>
                <Text style={[styles.errorText, { color: theme.text }]}>Receta no encontrada</Text>
                <TouchableOpacity 
                    style={[styles.backErrorBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backErrorBtnText}>Volver</Text>
                </TouchableOpacity>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.headerTitle, { color: theme.text }]}>Receta Médica</Text>
                <View style={{ width: 40 }} />
            </View>

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
                                Fecha: {new Date(record.date).toLocaleDateString()}
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
                        <Text style={[styles.ticketSectionTitle, { color: theme.primary }]}>MEDICAMENTOS PRESECRITOS</Text>
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
                                            📋 Instrucciones: {p.instructions}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.cutLineContainer}>
                        <Scissors size={16} color={theme.textMuted} style={styles.scissorsIcon} />
                        <View style={[styles.cutLine, { borderBottomColor: theme.borderLight }]} />
                    </View>

                    <View style={styles.barcodeWrapper}>
                        <QrCode size={100} color={theme.text} />
                        <Text style={[styles.barcodeText, { color: theme.textMuted }]}>
                            MICHICONDRIAS-VET-SECURE-RX
                        </Text>
                        <Text style={[styles.barcodeSubText, { color: theme.textMuted }]}>
                            Válido en establecimientos afiliados y farmacias de socios
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                        onPress={() => {
                            Alert.alert(
                                "Compartir Receta",
                                "La receta se ha preparado para compartir en formato PDF.",
                                [{ text: "OK" }]
                            );
                        }}
                    >
                        <Share2 size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>Compartir Receta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.actionBtn, 
                            { 
                                backgroundColor: 'transparent', 
                                borderWidth: 1.5, 
                                borderColor: theme.primary,
                                shadowOpacity: 0,
                                elevation: 0,
                            }
                        ]}
                        onPress={() => {
                            Alert.alert(
                                "Guardar PDF",
                                "La receta en PDF se ha descargado exitosamente en tus archivos locales.",
                                [{ text: "OK" }]
                            );
                        }}
                    >
                        <Download size={18} color={theme.primary} />
                        <Text style={[styles.actionBtnText, { color: theme.primary }]}>Guardar PDF</Text>
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    backErrorBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backErrorBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
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
        padding: 24,
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },
    ticketHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
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
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    ticketSubtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    ticketMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ticketMetaLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    ticketBody: {
        padding: 24,
    },
    ticketSection: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    ticketSectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 14,
    },
    ticketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ticketLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    ticketValue: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    ticketMedCard: {
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    ticketMedName: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 6,
    },
    ticketMedDetails: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    ticketInstructionsContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderStyle: 'dashed',
    },
    ticketInstructionsText: {
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    cutLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginVertical: 24,
    },
    scissorsIcon: {
        marginRight: 10,
    },
    cutLine: {
        flex: 1,
        borderBottomWidth: 1.5,
        borderStyle: 'dashed',
    },
    barcodeWrapper: {
        alignItems: 'center',
        paddingBottom: 32,
        paddingTop: 8,
        gap: 8,
    },
    barcodeText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: 8,
    },
    barcodeSubText: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        paddingHorizontal: 4,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 15,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
});
