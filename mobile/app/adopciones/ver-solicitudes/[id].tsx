import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { useViewApplications } from '@/src/hooks/adopciones/useViewApplications';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { AdoptionRequest } from '@/src/services/adopciones';
import { User, Home, Heart, Check, X, ChevronLeft, Trees, Key, Baby, Clock, PawPrint } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

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
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, theme) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={[styles.reasonPreview, { color: theme.text }]} numberOfLines={2}>
                «{item.reason}»
            </Text>
            <View style={styles.viewMoreRow}>
                <Text style={{ color: theme.primary, fontSize: font.md, fontWeight: '700' }}>Ver detalles completos</Text>
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
            refreshControl={<AppRefreshControl />}
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
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={closeModal} style={styles.closeBtn}>
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
                                        <Text style={{ fontWeight: '400', fontStyle: 'italic' }}>«{selectedRequest.reason}»</Text>
                                    </Text>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailHeader}>
                                        <Home size={20} color={theme.primary} />
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>Hogar y Estilo de Vida</Text>
                                    </View>
                                    <View style={styles.grid}>
                                        <GridItem label="VIVIENDA" value={selectedRequest.house_type} theme={theme} icon={<Home size={16} color={theme.primary} />} />
                                        <GridItem label="PATIO" value={selectedRequest.has_yard ? 'Sí' : 'No'} theme={theme} icon={<Trees size={16} color={theme.primary} />} />
                                        <GridItem label="SITUACIÓN" value={selectedRequest.own_or_rent} theme={theme} icon={<Key size={16} color={theme.primary} />} />
                                        <GridItem label="NIÑOS" value={selectedRequest.has_children ? 'Sí' : 'No'} theme={theme} icon={<Baby size={16} color={theme.primary} />} />
                                        <GridItem label="SOLO" value={`${selectedRequest.hours_alone}h`} theme={theme} icon={<Clock size={16} color={theme.primary} />} />
                                        <GridItem label="OTRAS MASCOTAS" value={selectedRequest.other_pets ? 'Sí' : 'No'} theme={theme} icon={<PawPrint size={16} color={theme.primary} />} />
                                    </View>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailHeader}>
                                        <Heart size={20} color={theme.primary} />
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>Compromisos</Text>
                                    </View>
                                    <View style={styles.commitmentRow}>
                                        <Check size={16} color={theme.success} />
                                        <Text style={[styles.commitmentText, { color: theme.text }]}>Acepta compromiso financiero</Text>
                                    </View>
                                    {selectedRequest.own_or_rent === 'Renta' && (
                                        <View style={styles.commitmentRow}>
                                            <Check size={16} color={selectedRequest.landlord_permission ? theme.success : theme.error} />
                                            <Text style={[styles.commitmentText, { color: theme.text }]}>
                                                {selectedRequest.landlord_permission ? 'Tiene permiso del casero' : 'No tiene permiso del casero'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}

                        <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                            {selectedRequest?.status === 'PENDING' ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.statusBtn, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
                                        onPress={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}
                                    >
                                        <X size={20} color={theme.error} />
                                        <Text style={[styles.statusBtnText, { color: theme.error }]}>Rechazar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.statusBtn, { backgroundColor: theme.success + '20', borderColor: theme.success }]}
                                        onPress={() => handleStatusUpdate(selectedRequest.id, 'APPROVED')}
                                    >
                                        <Check size={20} color={theme.success} />
                                        <Text style={[styles.statusBtnText, { color: theme.success }]}>Aprobar</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={[styles.finalStatus, { backgroundColor: getStatusColor(selectedRequest?.status || '', theme) + '20' }]}>
                                    <Text style={[styles.finalStatusText, { color: getStatusColor(selectedRequest?.status || '', theme) }]}>
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

function GridItem({ label, value, theme, icon }: { label: string, value: string, theme: any, icon: React.ReactNode }) {
    return (
        <View style={styles.gridItem}>
            <View>{icon}</View>
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
        padding: spacing.xl,
        gap: spacing.lg,
    },
    requestCard: {
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    applicantInfo: {
        flex: 1,
    },
    applicantName: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    requestDate: {
        fontSize: font.sm,
        marginTop: spacing.xxs,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: font.xs,
        fontWeight: '900',
    },
    reasonPreview: {
        fontSize: font.base,
        lineHeight: 20,
        opacity: 0.8,
    },
    viewMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: spacing.md,
        gap: spacing.xs,
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
        padding: spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    modalTitle: {
        fontSize: font.h3,
        fontWeight: '900',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(128,128,128,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalScroll: {
        paddingBottom: spacing.huge,
    },
    detailSection: {
        marginBottom: spacing.xxl,
        gap: spacing.md,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    detailTitle: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    detailText: {
        fontSize: font.lg,
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    gridItem: {
        width: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: 'rgba(128,128,128,0.08)',
        padding: spacing.md,
        borderRadius: 12,
    },
    statIconSmall: {
        fontSize: font.xxl,
    },
    gridLabel: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    gridValue: {
        fontSize: font.base,
        fontWeight: '800',
    },
    commitmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    commitmentText: {
        fontSize: font.base,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    statusBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
    },
    statusBtnText: {
        fontSize: font.xl,
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
        fontSize: font.xl,
        fontWeight: '900',
        textTransform: 'uppercase',
    }
});
