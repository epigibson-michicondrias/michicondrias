import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getIncomingWalkRequests, updateWalkRequestStatus, WalkRequest } from '../../src/services/paseadores';
import { getIncomingSitRequests, updateSitRequestStatus, SitRequest } from '../../src/services/cuidadores';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Calendar, Clock, MapPin, Bone, User, CheckCircle2, XCircle, MoreHorizontal, Settings, Activity, Heart, Star, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type AnyRequest = (WalkRequest | SitRequest) & { type: 'walk' | 'sit' };

export default function ProfessionalGestionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

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
            {/* Header Premium */}
            <LinearGradient
                colors={['#6366f1', '#4338ca', '#3730a3']}
                style={[styles.premiumHeader, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Servicios Pro</Text>
                        <View style={styles.badgeContainer}>
                            <View style={[styles.liveDot, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.subtitle}>Gestión de Solicitudes</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.push('/servicios-pro/perfil' as any)}
                    >
                        <User size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>

                {/* Stats Summary Refined */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Activity size={18} color="#6366f1" />
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{allRequests.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Totales</Text>
                        </View>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Clock size={18} color="#f59e0b" />
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{allRequests.filter(r => r.status === 'pending').length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pendientes</Text>
                        </View>
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
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color="#6366f1" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Bone size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay solicitudes en esta categoría</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {filtered.map(item => renderItem({ item }))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    premiumHeader: { 
        paddingHorizontal: 24, 
        paddingBottom: 18,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
    },
    subtitle: { 
        fontSize: 11, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
    },
    contentScroll: {
        flex: 1,
    },
    statsRow: { 
        flexDirection: 'row', 
        paddingHorizontal: 24, 
        gap: 12, 
        marginTop: 24,
        marginBottom: 16 
    },
    statBox: { 
        flex: 1, 
        flexDirection: 'row',
        padding: 16, 
        borderRadius: 20, 
        alignItems: 'center', 
        gap: 12, 
        borderWidth: 1, 
    },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    tabsRow: { marginBottom: 16 },
    tabsScroll: { paddingHorizontal: 24, gap: 8 },
    tab: { 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 14, 
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.03)'
    },
    tabText: { fontSize: 13, fontWeight: '700' },
    list: { padding: 24, paddingBottom: 100 },
    card: { 
        borderRadius: 24, 
        padding: 18, 
        marginBottom: 16, 
        borderWidth: 1, 
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeText: { fontSize: 10, fontWeight: '900' },
    dateText: { fontSize: 11, fontWeight: '700' },
    cardBody: { gap: 10, marginBottom: 14 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoLabel: { fontSize: 13, fontWeight: '600' },
    notesBox: { padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#6366f1' },
    notesText: { fontSize: 12, fontWeight: '500', fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    priceText: { fontSize: 18, fontWeight: '900' },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    btnText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusLabel: { fontSize: 10, fontWeight: '900' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    empty: { paddingTop: 60, alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 14, fontWeight: '700', textAlign: 'center' }
});
