import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabOrders } from '@/src/hooks/laboratorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { FlaskConical, Calendar, Clock, ChevronRight } from 'lucide-react-native';

export default function LaboratorioScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        appointments,
        tests,
        isLoadingAppointments,
        isLoadingTests,
        refetchAppointments,
    } = useLabOrders();

    const renderAppointmentItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
        >
            <View style={[styles.cardIcon, { backgroundColor: theme.primary + '15' }]}>
                <FlaskConical size={24} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.test_name || 'Prueba de laboratorio'}
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
                            : item.status || 'En proceso'}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color={theme.textMuted} />
        </TouchableOpacity>
    );

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
});
