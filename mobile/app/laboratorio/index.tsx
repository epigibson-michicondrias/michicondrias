import React, { useState } from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabOrders } from '@/src/hooks/laboratorio';
import { useQuery } from '@tanstack/react-query';
import { getPetLabHistory } from '@/src/services/laboratorio';
import FilterChip from '@/src/components/FilterChip';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { formatDateMx, statusTone } from '@/src/features/salud/format';
import { usePets } from '@/src/hooks/mascotas';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { FlaskConical, Calendar, Clock, ChevronRight, X, Info, DollarSign, Activity, PawPrint, CheckCircle } from 'lucide-react-native';

export default function LaboratorioScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets } = usePets();
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [view, setView] = useState<'citas' | 'estudios'>('citas');
    const {
        appointments,
        tests,
        isLoadingAppointments,
        isLoadingTests,
        cancelAppointment,
        isCancelling,
    } = useLabOrders();

    const { data: petResults = [] } = useQuery({
        queryKey: ['lab-history', selectedAppointment?.pet_id],
        queryFn: () => getPetLabHistory(selectedAppointment.pet_id),
        enabled: !!selectedAppointment?.pet_id && selectedAppointment?.status === 'completed',
    });

    const confirmCancel = (id: string) =>
        showAlert({
            type: 'warning',
            title: '¿Cancelar la cita?',
            message: 'El laboratorio será notificado.',
            buttonText: 'Sí, cancelar',
            showCancel: true,
            cancelText: 'Volver',
            onButtonPress: () => {
                cancelAppointment(id);
                setModalVisible(false);
            },
        });

    const renderAppointmentItem = ({ item }: { item: any }) => {
        const test = tests.find(t => t.id === item.test_id);
        const testName = item.test_name || (test ? test.name : 'Prueba de laboratorio');
        const tone = statusTone(theme, item.status);

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
                            {formatDateMx(item.scheduled_date) || 'Sin fecha'}{item.scheduled_time ? ` · ${item.scheduled_time.slice(0, 5)}` : ''}{item.pet_name ? ` · ${item.pet_name}` : ''}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.statusText, { color: tone.color }]}>{tone.label}</Text>
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
                Elige un estudio del catálogo para agendar tu primera cita.
            </Text>
            <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setView('estudios')}
                style={{ marginTop: 16, backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }}
            >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Ver estudios</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Laboratorio"
                subtitle="Estudios clínicos para tu mascota"
            />

            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginBottom: 12 }}>
                <FilterChip label="Mis citas" active={view === 'citas'} onPress={() => setView('citas')} />
                <FilterChip label={`Estudios${tests.length ? ` (${tests.length})` : ''}`} active={view === 'estudios'} onPress={() => setView('estudios')} />
            </View>

            {view === 'estudios' ? (
                isLoadingTests ? (
                    <View style={{ padding: 20 }}><SkeletonList count={4} /></View>
                ) : (
                    <FlatList
                        data={tests}
                        keyExtractor={(t) => t.id}
                        refreshControl={<AppRefreshControl />}
                        contentContainerStyle={[styles.listContent, tests.length === 0 && styles.emptyList]}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <FlaskConical size={48} color={theme.textMuted} />
                                <Text style={[styles.emptyTitle, { color: theme.text }]}>Aún no hay estudios disponibles</Text>
                                <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>Los laboratorios publicarán su catálogo pronto.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel={`Agendar ${item.name}`}
                                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                                onPress={() => router.push({ pathname: '/laboratorio/agendar', params: { test_id: item.id } } as any)}
                            >
                                <View style={[styles.cardIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <FlaskConical size={24} color={theme.primary} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                                    {!!item.description && <Text style={[styles.cardMetaText, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>}
                                    <Text style={{ color: theme.primary, fontWeight: '800' }}>${Number(item.price).toFixed(2)} MXN</Text>
                                </View>
                                <ChevronRight size={20} color={theme.textMuted} />
                            </TouchableOpacity>
                        )}
                    />
                )
            ) : isLoadingAppointments ? (
                <View style={{ padding: 20 }}><SkeletonList count={4} /></View>
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
                    refreshControl={<AppRefreshControl />}
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
                            const testName = selectedAppointment.test_name || (test ? test.name : 'Prueba de laboratorio');
                            const petName = selectedAppointment.pet_name || (pet ? pet.name : 'Mascota');
                            const labName = 'Laboratorio';
                            
                            const statusInfo = statusTone(theme, selectedAppointment.status);

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
                                                        {formatDateMx(selectedAppointment.scheduled_date) || 'Sin fecha'}
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
                                    {(test || selectedAppointment.test_price != null) && (
                                        <View style={[styles.priceRow, { borderBottomColor: theme.borderLight }]}>
                                            <DollarSign size={18} color={theme.textMuted} />
                                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Costo del Estudio</Text>
                                            <Text style={[styles.priceValue, { color: theme.text }]}>
                                                ${Number(selectedAppointment.test_price ?? test?.price ?? 0).toFixed(2)} MXN
                                            </Text>
                                        </View>
                                    )}

                                    {/* Notes / Indications */}
                                    {selectedAppointment.notes ? (
                                        <View style={[styles.notesCard, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
                                            <Info size={18} color={theme.warning} style={{ marginTop: 2 }} />
                                            <View style={{ flex: 1, marginLeft: 2 }}>
                                                <Text style={styles.notesTitle}>Indicaciones de Preparación</Text>
                                                <Text style={[styles.notesText, { color: theme.text }]}>
                                                    {selectedAppointment.notes}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : null}

                                    {selectedAppointment.status === 'completed' && (
                                        <View style={[styles.completedCard, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                                            <CheckCircle size={18} color={theme.success} style={{ marginTop: 2 }} />
                                            <View style={{ flex: 1, marginLeft: 2 }}>
                                                <Text style={[styles.completedTitle, { color: theme.success }]}>Resultados de {petName}</Text>
                                                {petResults.length === 0 ? (
                                                    <Text style={[styles.completedText, { color: theme.text }]}>
                                                        El laboratorio aún no ha cargado resultados. Te avisaremos cuando estén listos.
                                                    </Text>
                                                ) : (
                                                    petResults.slice(0, 12).map((r: any) => (
                                                        <Text key={r.id} style={[styles.completedText, { color: r.is_anomaly ? theme.error : theme.text }]}>
                                                            {r.parameter_name}: {r.measured_value}{r.unit ? ` ${r.unit}` : ''}
                                                            {r.reference_range ? ` (ref. ${r.reference_range})` : ''}{r.is_anomaly ? '  fuera de rango' : ''}
                                                        </Text>
                                                    ))
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                                        <TouchableOpacity
                                            accessibilityRole="button"
                                            disabled={isCancelling}
                                            onPress={() => confirmCancel(selectedAppointment.id)}
                                            style={{ borderWidth: 1, borderColor: theme.error, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 }}
                                        >
                                            <Text style={{ color: theme.error, fontWeight: '700' }}>Cancelar cita</Text>
                                        </TouchableOpacity>
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
        fontWeight: '800',
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
