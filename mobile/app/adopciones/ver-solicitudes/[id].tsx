import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { useViewApplications } from '@/src/hooks/adopciones/useViewApplications';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { AdoptionRequest } from '@/src/services/adopciones';
import { User, Home, Heart, Check, X, ChevronLeft } from 'lucide-react-native';

export default function VerSolicitudesScreen() {
    const { theme } = useTheme();
    const {
        requests, listing, isLoading, selectedRequest,
        setSelectedRequest, handleStatusUpdate, getStatusColor,
        goBack, closeModal,
    } = useViewApplications();

    const renderRequestItem = ({ item }: { item: AdoptionRequest }) => (
        <TouchableOpacity
            style={[styles.requestCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedRequest(item)}
        >
            <View style={styles.requestHeader}>
                <View style={styles.applicantInfo}>
                    <Text style={[styles.applicantName, { color: theme.text }]}>{item.applicant_name}</Text>
                    <Text style={[styles.requestDate, { color: theme.textMuted }]}>
                        Enviada el: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={[styles.reasonPreview, { color: theme.text }]} numberOfLines={2}>
                "{item.reason}"
            </Text>
            <View style={styles.viewMoreRow}>
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>Ver detalles completos</Text>
                <ChevronLeft size={16} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Solicitudes Recibidas"
                subtitle={`Mascota: ${listing?.name || 'Cargando...'}`}
                onBack={goBack}
            />

            {isLoading ? (
                <View style={styles.center}>
                    <LoadingOverlay />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequestItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Heart size={48} color={theme.textMuted} strokeWidth={1} />}
                            title="Aún no hay interesados"
                            subtitle={`Las solicitudes que recibas para ${listing?.name || 'esta mascota'} aparecerán aquí.`}
                        />
                    }
                />
            )}

            <Modal
                visible={!!selectedRequest}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Detalle de la Solicitud</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedRequest && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                                <View style={styles.detailSection}>
                                    <View style={styles.detailHeader}>
                                        <User size={20} color={theme.primary} />
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>Candidato: {selectedRequest.applicant_name}</Text>
                                    </View>
                                    <Text style={[styles.detailText, { color: theme.text }]}>
                                        Razones para adoptar:{"\n"}
                                        <Text style={{ fontWeight: '400', fontStyle: 'italic' }}>"{selectedRequest.reason}"</Text>
                                    </Text>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailHeader}>
                                        <Home size={20} color={theme.primary} />
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>Hogar y Estilo de Vida</Text>
                                    </View>
                                    <View style={styles.grid}>
                                        <GridItem label="VIVIENDA" value={selectedRequest.house_type} theme={theme} icon="🏠" />
                                        <GridItem label="PATIO" value={selectedRequest.has_yard ? 'Sí' : 'No'} theme={theme} icon="🌿" />
                                        <GridItem label="SITUACIÓN" value={selectedRequest.own_or_rent} theme={theme} icon="🔑" />
                                        <GridItem label="NIÑOS" value={selectedRequest.has_children ? 'Sí' : 'No'} theme={theme} icon="👶" />
                                        <GridItem label="SOLO" value={`${selectedRequest.hours_alone}h`} theme={theme} icon="⏰" />
                                        <GridItem label="PETS" value={selectedRequest.other_pets ? 'Sí' : 'No'} theme={theme} icon="🐕" />
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailHeader}>
                                        <Heart size={20} color={theme.primary} />
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>Compromisos</Text>
                                    </View>
                                    <View style={styles.commitmentRow}>
                                        <Check size={16} color="#10b981" />
                                        <Text style={[styles.commitmentText, { color: theme.text }]}>Acepta compromiso financiero</Text>
                                    </View>
                                    {selectedRequest.own_or_rent === 'Renta' && (
                                        <View style={styles.commitmentRow}>
                                            <Check size={16} color={selectedRequest.landlord_permission ? "#10b981" : "#ef4444"} />
                                            <Text style={[styles.commitmentText, { color: theme.text }]}>
                                                {selectedRequest.landlord_permission ? 'Tiene permiso del casero' : 'No tiene permiso del casero'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}

                        <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                            {selectedRequest?.status === 'pendiente' ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.statusBtn, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}
                                        onPress={() => handleStatusUpdate(selectedRequest.id, 'rechazado')}
                                    >
                                        <X size={20} color="#ef4444" />
                                        <Text style={[styles.statusBtnText, { color: '#ef4444' }]}>Rechazar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.statusBtn, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}
                                        onPress={() => handleStatusUpdate(selectedRequest.id, 'aprobado')}
                                    >
                                        <Check size={20} color="#10b981" />
                                        <Text style={[styles.statusBtnText, { color: '#10b981' }]}>Aprobar</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={[styles.finalStatus, { backgroundColor: getStatusColor(selectedRequest?.status || '') + '20' }]}>
                                    <Text style={[styles.finalStatusText, { color: getStatusColor(selectedRequest?.status || '') }]}>
                                        Solicitud {selectedRequest?.status}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

function GridItem({ label, value, theme, icon }: { label: string, value: string, theme: any, icon: string }) {
    return (
        <View style={styles.gridItem}>
            <Text style={styles.statIconSmall}>{icon}</Text>
            <View>
                <Text style={[styles.gridLabel, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[styles.gridValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        gap: 16,
    },
    requestCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    applicantInfo: {
        flex: 1,
    },
    applicantName: {
        fontSize: 16,
        fontWeight: '800',
    },
    requestDate: {
        fontSize: 11,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    reasonPreview: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    viewMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalScroll: {
        paddingBottom: 40,
    },
    detailSection: {
        marginBottom: 24,
        gap: 12,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    detailText: {
        fontSize: 15,
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 10,
        borderRadius: 12,
    },
    statIconSmall: {
        fontSize: 18,
    },
    gridLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    gridValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    commitmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    commitmentText: {
        fontSize: 14,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingBottom: 10,
        borderTopWidth: 1,
        gap: 12,
    },
    statusBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
    },
    statusBtnText: {
        fontSize: 16,
        fontWeight: '800',
    },
    finalStatus: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    finalStatusText: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    }
});
