import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabOrders } from '@/src/hooks/laboratorio';
import { usePets } from '@/src/hooks/mascotas';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { FlaskConical, Calendar, Clock, ChevronRight, X, Info, DollarSign, Activity, PawPrint, CheckCircle } from 'lucide-react-native';

const LAB_NAMES: Record<string, string> = {
    'u008': 'Clínica Patitas',
    'u002': 'Dra. Ana López',
    'u001': 'Clínica Central',
};

export default function LaboratorioScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets } = usePets();
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const {
        appointments,
        tests,
        isLoadingAppointments,
        isLoadingTests,
        refetchAppointments,
    } = useLabOrders();

    const renderAppointmentItem = ({ item }: { item: any }) => {
        const test = tests.find(t => t.id === item.test_id);
        const testName = test ? test.name : 'Prueba de laboratorio';

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                onPress={() => {
                    setSelectedAppointment(item);
                    setModalVisible(true);
                }}
            >
                <View style={[styles.cardIcon, { backgroundColor: theme.primary + '15' }]}>
                    <FlaskConical size={24} color={theme.primary} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {testName}
                    </Text>
                    <View style={styles.cardMeta}>
                        <Calendar size={14} color={theme.textMuted} />
                        <Text style={[styles.cardMetaText, { color: theme.textMuted }]}>
                            {item.scheduled_date || item.created_at || 'Sin fecha'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, {
                        backgroundColor: item.status === 'completed' ? '#10b98120' : '#f59e0b20',
                    }]}>
                        <Text style={[styles.statusText, {
                            color: item.status === 'completed' ? '#10b981' : '#f59e0b',
                        }]}>
                            {item.status === 'completed' ? 'Completada'
                                : item.status === 'pending' ? 'Pendiente'
                                : item.status === 'confirmed' ? 'Confirmada'
                                : item.status || 'En proceso'}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <FlaskConical size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Sin citas de laboratorio
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Cuando agendes una cita de laboratorio aparecerá aquí.
            </Text>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Laboratorio"
                subtitle="Mis citas y resultados"
            />

            {/* Tests Summary */}
            {!isLoadingTests && tests.length > 0 && (
                <View style={[styles.summaryCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                    <FlaskConical size={20} color={theme.primary} />
                    <Text style={[styles.summaryText, { color: theme.primary }]}>
                        {tests.length} pruebas disponibles en el catálogo
                    </Text>
                </View>
            )}

            {/* Appointments List */}
            {isLoadingAppointments ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Cargando citas...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointmentItem}
                    keyExtractor={(item, index) => item.id || String(index)}
                    contentContainerStyle={[
                        styles.listContent,
                        appointments.length === 0 && styles.emptyList,
                    ]}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    refreshing={isLoadingAppointments}
                    onRefresh={refetchAppointments}
                />
            )}

            {/* Appointment Detail Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Detalles de la Cita</Text>
                            <TouchableOpacity
                                style={[styles.closeBtn, { backgroundColor: theme.borderLight }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <X size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedAppointment && (() => {
                            const test = tests.find(t => t.id === selectedAppointment.test_id);
                            const pet = pets.find(p => p.id === selectedAppointment.pet_id);
                            const testName = test ? test.name : 'Prueba de laboratorio';
                            const petName = pet ? pet.name : 'Mascota';
                            const labName = LAB_NAMES[selectedAppointment.lab_id] || `Laboratorio #${selectedAppointment.lab_id?.slice(0, 8)}`;
                            
                            const statusInfo = selectedAppointment.status === 'completed' 
                                ? { label: 'Completada', color: '#10b981', bg: '#10b98120' }
                                : selectedAppointment.status === 'confirmed'
                                ? { label: 'Confirmada', color: '#0ea5e9', bg: '#0ea5e920' }
                                : selectedAppointment.status === 'cancelled'
                                ? { label: 'Cancelada', color: '#ef4444', bg: '#ef444420' }
                                : { label: 'Pendiente', color: '#f59e0b', bg: '#f59e0b20' };

                            return (
                                <View style={styles.modalBody}>
                                    {/* Test info header */}
                                    <View style={[styles.modalTestCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                                        <View style={[styles.modalTestIcon, { backgroundColor: theme.primary + '15' }]}>
                                            <FlaskConical size={28} color={theme.primary} />
                                        </View>
                                        <View style={styles.modalTestInfo}>
                                            <Text style={[styles.modalTestName, { color: theme.text }]}>{testName}</Text>
                                            <Text style={[styles.modalLabName, { color: theme.textMuted }]}>{labName}</Text>
                                        </View>
                                    </View>

                                    {/* Info grid */}
                                    <View style={styles.gridContainer}>
                                        <View style={[styles.gridRow, { borderBottomColor: theme.borderLight }]}>
                                            <View style={styles.gridItem}>
                                                <PawPrint size={18} color={theme.textMuted} />
                                                <View style={{ marginLeft: 2 }}>
                                                    <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Paciente</Text>
                                                    <Text style={[styles.gridValue, { color: theme.text }]}>{petName}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.gridItem}>
                                                <Activity size={18} color={theme.textMuted} />
                                                <View style={{ marginLeft: 2 }}>
                                                    <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Estado</Text>
                                                    <View style={[styles.statusBadgeInline, { backgroundColor: statusInfo.bg }]}>
                                                        <Text style={[styles.statusTextInline, { color: statusInfo.color }]}>
                                                            {statusInfo.label}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={[styles.gridRow, { borderBottomColor: theme.borderLight }]}>
                                            <View style={styles.gridItem}>
                                                <Calendar size={18} color={theme.textMuted} />
                                                <View style={{ marginLeft: 2 }}>
                                                    <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Fecha</Text>
                                                    <Text style={[styles.gridValue, { color: theme.text }]}>
                                                        {selectedAppointment.scheduled_date || 'Sin fecha'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.gridItem}>
                                                <Clock size={18} color={theme.textMuted} />
                                                <View style={{ marginLeft: 2 }}>
                                                    <Text style={[styles.gridLabel, { color: theme.textMuted }]}>Hora</Text>
                                                    <Text style={[styles.gridValue, { color: theme.text }]}>
                                                        {selectedAppointment.scheduled_time?.slice(0, 5) || 'Sin hora'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Cost/Price Info if available */}
                                    {test && (
                                        <View style={[styles.priceRow, { borderBottomColor: theme.borderLight }]}>
                                            <DollarSign size={18} color={theme.textMuted} />
                                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Costo del Estudio</Text>
                                            <Text style={[styles.priceValue, { color: theme.text }]}>
                                                ${test.price.toFixed(2)} MXN
                                            </Text>
                                        </View>
                                    )}

                                    {/* Notes / Indications */}
                                    {selectedAppointment.notes ? (
                                        <View style={[styles.notesCard, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b30' }]}>
                                            <Info size={18} color="#f59e0b" style={{ marginTop: 2 }} />
                                            <View style={{ flex: 1, marginLeft: 2 }}>
                                                <Text style={styles.notesTitle}>Indicaciones de Preparación</Text>
                                                <Text style={[styles.notesText, { color: theme.text }]}>
                                                    {selectedAppointment.notes}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : null}

                                    {/* Completed message */}
                                    {selectedAppointment.status === 'completed' && (
                                        <View style={[styles.completedCard, { backgroundColor: '#10b98110', borderColor: '#10b98130' }]}>
                                            <CheckCircle size={18} color="#10b981" style={{ marginTop: 2 }} />
                                            <View style={{ flex: 1, marginLeft: 2 }}>
                                                <Text style={styles.completedTitle}>Resultados Listos</Text>
                                                <Text style={[styles.completedText, { color: theme.text }]}>
                                                    Los resultados de este estudio han sido cargados al Historial Clínico de tu mascota. Puedes verlos en el Carnet Digital.
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
        gap: 14,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardMetaText: {
        fontSize: 13,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        borderWidth: 1,
        borderBottomWidth: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        gap: 16,
    },
    modalTestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 14,
    },
    modalTestIcon: {
        width: 54,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTestInfo: {
        flex: 1,
        gap: 2,
    },
    modalTestName: {
        fontSize: 16,
        fontWeight: '800',
    },
    modalLabName: {
        fontSize: 13,
        fontWeight: '600',
    },
    gridContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    gridRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    gridItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    gridLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    gridValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    statusBadgeInline: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    statusTextInline: {
        fontSize: 11,
        fontWeight: '700',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 8,
    },
    priceLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    priceValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    notesCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#f59e0b',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    completedCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    completedTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
        marginBottom: 4,
    },
    completedText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
});
