import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getIncomingWalkRequests, updateWalkRequestStatus, WalkRequest } from '../../src/services/paseadores';
import { getIncomingSitRequests, updateSitRequestStatus, SitRequest } from '../../src/services/cuidadores';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Calendar, Clock, MapPin, Bone, User, CheckCircle2, XCircle, MoreHorizontal, Settings, Activity, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type AnyRequest = (WalkRequest | SitRequest) & { type: 'walk' | 'sit' };

export default function ProfessionalGestionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuth();

    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const isWalker = user?.role_name === 'walker';
    const isSitter = user?.role_name === 'sitter';

    const { data: walkRequests = [], isLoading: loadingWalks, refetch: refetchWalks } = useQuery({
        queryKey: ['incoming-walks'],
        queryFn: getIncomingWalkRequests,
        enabled: isWalker,
    });

    const { data: sitRequests = [], isLoading: loadingSits, refetch: refetchSits } = useQuery({
        queryKey: ['incoming-sits'],
        queryFn: getIncomingSitRequests,
        enabled: isSitter,
    });

    const allRequests: AnyRequest[] = [
        ...walkRequests.map(r => ({ ...r, type: 'walk' as const })),
        ...sitRequests.map(r => ({ ...r, type: 'sit' as const })),
    ];

    const filtered = allRequests.filter(r => filter === 'all' ? true : r.status === filter);

    const handleStatusUpdate = async (id: string, type: 'walk' | 'sit', newStatus: string) => {
        setActionLoading(id);
        try {
            if (type === 'walk') {
                await updateWalkRequestStatus(id, newStatus);
                refetchWalks();
            } else {
                await updateSitRequestStatus(id, newStatus);
                refetchSits();
            }
            Alert.alert("Éxito", `Solicitud ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'} correctamente`);
        } catch (e) {
            Alert.alert("Error", "No se pudo actualizar el estatus");
        } finally {
            setActionLoading(null);
        }
    };

    const renderItem = ({ item }: { item: AnyRequest }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'walk' ? '#6366f120' : '#8b5cf620' }]}>
                    <Text style={[styles.typeText, { color: item.type === 'walk' ? '#6366f1' : '#8b5cf6' }]}>
                        {item.type === 'walk' ? '🚶 Paseo' : '🏠 Cuidado'}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.textMuted }]}>
                    {item.type === 'walk' ? (item as any).requested_date : `${(item as any).start_date} - ${(item as any).end_date}`}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <User size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.text }]}>Cliente ID: {item.client_user_id.substring(0, 8)}...</Text>
                </View>
                <View style={styles.infoRow}>
                    <Bone size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.text }]}>Mascota ID: {item.pet_id.substring(0, 8)}...</Text>
                </View>
                {item.type === 'walk' && (item as any).pickup_address && (
                    <View style={styles.infoRow}>
                        <MapPin size={16} color={theme.textMuted} />
                        <Text style={[styles.infoLabel, { color: theme.text }]} numberOfLines={1}>{(item as any).pickup_address}</Text>
                    </View>
                )}
                {item.notes && (
                    <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                        <Text style={[styles.notesText, { color: theme.textMuted }]}>"{item.notes}"</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={[styles.priceText, { color: theme.primary }]}>${item.total_price || 0}</Text>

                {item.status === 'pending' ? (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                            onPress={() => handleStatusUpdate(item.id, item.type, 'rejected')}
                            disabled={!!actionLoading}
                        >
                            <XCircle size={18} color="#fff" />
                            <Text style={styles.btnText}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                            onPress={() => handleStatusUpdate(item.id, item.type, 'accepted')}
                            disabled={!!actionLoading}
                        >
                            <CheckCircle2 size={18} color="#fff" />
                            <Text style={styles.btnText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'accepted' ? '#10b98120' : '#ef444420' }]}>
                        <Text style={[styles.statusLabel, { color: item.status === 'accepted' ? '#10b981' : '#ef4444' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Panel Profesional</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Gestiona tus solicitudes</Text>
                </View>
                <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/servicios-pro/perfil' as any)}>
                    <Settings size={22} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
                    <Activity size={20} color={theme.primary} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{allRequests.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Totales</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
                    <Clock size={20} color="#f59e0b" />
                    <Text style={[styles.statValue, { color: theme.text }]}>{allRequests.filter(r => r.status === 'pending').length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pendientes</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
                    <Heart size={20} color="#ec4899" />
                    <Text style={[styles.statValue, { color: theme.text }]}>{allRequests.filter(r => r.status === 'accepted').length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activas</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {[
                        { key: 'pending', label: '⏳ Pendientes' },
                        { key: 'accepted', label: '✅ Aceptadas' },
                        { key: 'completed', label: '🎉 Finalizadas' },
                        { key: 'rejected', label: '❌ Rechazadas' },
                        { key: 'all', label: '🔍 Todas' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setFilter(tab.key)}
                            style={[
                                styles.tab,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                filter === tab.key && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                            ]}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: theme.textMuted },
                                filter === tab.key && { color: theme.primary, fontWeight: '800' }
                            ]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {(loadingWalks || loadingSits) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Bone size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay solicitudes en esta categoría</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600' },
    settingsBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
    statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '700' },
    tabsRow: { marginBottom: 16 },
    tabsScroll: { paddingHorizontal: 24, gap: 8 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 24, paddingBottom: 100 },
    card: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: '900' },
    dateText: { fontSize: 12, fontWeight: '600' },
    cardBody: { gap: 12, marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 14, fontWeight: '600' },
    notesBox: { padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
    notesText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    priceText: { fontSize: 18, fontWeight: '900' },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    btnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusLabel: { fontSize: 10, fontWeight: '900' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' }
});
