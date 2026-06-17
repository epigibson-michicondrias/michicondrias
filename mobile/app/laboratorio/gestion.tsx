import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabProvider } from '@/src/hooks/laboratorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { FlaskConical, Clock, AlertTriangle, Calendar, CheckCircle, ChevronRight } from 'lucide-react-native';

type ProviderTab = 'pendientes' | 'citas' | 'anomalias';

const TABS: { key: ProviderTab; label: string; icon: typeof Clock }[] = [
    { key: 'pendientes', label: 'Pendientes', icon: Clock },
    { key: 'citas', label: 'Citas', icon: Calendar },
    { key: 'anomalias', label: 'Anomalías', icon: AlertTriangle },
];

export default function LaboratorioGestionScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<ProviderTab>('pendientes');
    const {
        pendingOrders,
        appointments,
        anomalies,
        isLoadingOrders,
        isLoadingAppointments,
        isLoadingAnomalies,
        updateOrderStatus,
        isUpdatingStatus,
        refetchOrders,
        refetchAppointments,
    } = useLabProvider();

    const activeData = (() => {
        switch (activeTab) {
            case 'pendientes': return pendingOrders;
            case 'citas': return appointments;
            case 'anomalias': return anomalies;
        }
    })();

    const isLoading = (() => {
        switch (activeTab) {
            case 'pendientes': return isLoadingOrders;
            case 'citas': return isLoadingAppointments;
            case 'anomalias': return isLoadingAnomalies;
        }
    })();

    const handleRefresh = () => {
        if (activeTab === 'pendientes') refetchOrders();
        else if (activeTab === 'citas') refetchAppointments();
    };

    const renderTab = (tab: typeof TABS[0]) => {
        const isActive = activeTab === tab.key;
        const TabIcon = tab.icon;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[styles.tab, {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderColor: isActive ? theme.primary : theme.borderLight,
                }]}
                onPress={() => setActiveTab(tab.key)}
            >
                <TabIcon size={16} color={isActive ? '#fff' : theme.textMuted} />
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : theme.text }]}>
                    {tab.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: theme.primary + '15' }]}>
                    <FlaskConical size={20} color={theme.primary} />
                </View>
                <View style={styles.cardHeaderContent}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.test_name || item.title || `Orden #${item.id?.slice(0, 8) || '—'}`}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                        {item.patient_name || item.pet_name || 'Paciente'}
                    </Text>
                </View>
            </View>

            {item.created_at && (
                <View style={styles.cardMeta}>
                    <Calendar size={14} color={theme.textMuted} />
                    <Text style={[styles.cardMetaText, { color: theme.textMuted }]}>
                        {item.created_at}
                    </Text>
                </View>
            )}

            {activeTab === 'pendientes' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b98115', borderColor: '#10b981' }]}
                        onPress={() => updateOrderStatus({ orderId: item.id, status: 'in_progress' })}
                        disabled={isUpdatingStatus}
                    >
                        <CheckCircle size={16} color="#10b981" />
                        <Text style={[styles.actionButtonText, { color: '#10b981' }]}>
                            Procesar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {activeTab === 'anomalias' && (
                <View style={[styles.alertBanner, { backgroundColor: '#ef444410' }]}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <Text style={[styles.alertText, { color: '#ef4444' }]}>
                        {item.message || 'Resultado fuera de rango'}
                    </Text>
                </View>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <FlaskConical size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Sin datos
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                {activeTab === 'pendientes'
                    ? 'No hay órdenes pendientes por procesar.'
                    : activeTab === 'citas'
                    ? 'No hay citas programadas.'
                    : 'No hay anomalías detectadas.'}
            </Text>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión Lab"
                subtitle="Panel de proveedor"
            />

            {/* Tabs */}
            <View style={styles.tabsRow}>
                {TABS.map(renderTab)}
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeData}
                    renderItem={renderOrderItem}
                    keyExtractor={(item, index) => item.id || String(index)}
                    contentContainerStyle={[
                        styles.listContent,
                        activeData.length === 0 && styles.emptyList,
                    ]}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    refreshing={false}
                    onRefresh={handleRefresh}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 8,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeaderContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    cardMetaText: {
        fontSize: 13,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 8,
        marginTop: 4,
    },
    alertText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
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
