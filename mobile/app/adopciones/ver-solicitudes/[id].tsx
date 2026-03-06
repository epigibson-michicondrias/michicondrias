import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListingRequests, updateRequestStatus, AdoptionRequest, getListing } from '../../../src/services/adopciones';
import Colors from '../../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, User, Home, Heart, Check, X, Info, Phone, Mail, Clock } from 'lucide-react-native';

export default function VerSolicitudesScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['listing-requests', id],
        queryFn: () => getListingRequests(id as string),
    });

    const { data: listing } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
    });

    const mutation = useMutation({
        mutationFn: ({ requestId, status }: { requestId: string, status: string }) =>
            updateRequestStatus(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listing-requests', id] });
            setSelectedRequest(null);
            Alert.alert("Éxito", "Estado de la solicitud actualizado.");
        },
        onError: () => {
            Alert.alert("Error", "No se pudo actualizar la solicitud.");
        }
    });

    const handleStatusUpdate = (requestId: string, status: string) => {
        const action = status === 'aprobado' ? 'aprobar' : 'rechazar';
        Alert.alert(
            "Confirmar Acción",
            `¿Estás seguro de que deseas ${action} esta solicitud?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: () => mutation.mutate({ requestId, status }) }
            ]
        );
    };

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprobado': return '#10b981';
            case 'rechazado': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Solicitudes Recibidas</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Mascota: {listing?.name || 'Cargando...'}</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequestItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Heart size={60} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Aún no hay interesados</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                                Las solicitudes que recibas para {listing?.name} aparecerán aquí.
                            </Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={!!selectedRequest}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedRequest(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Detalle de la Solicitud</Text>
                            <TouchableOpacity onPress={() => setSelectedRequest(null)} style={styles.closeBtn}>
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
        </View>
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
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 15,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 12,
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
    empty: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
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
        width: '45%', // Increased for better layout with icons
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
