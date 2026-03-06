import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPendingVerifications, User as KYCUser, verifyUser } from '../../src/lib/auth';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, ShieldCheck, User, Clock, CheckCircle2, XCircle } from 'lucide-react-native';

export default function AdminVerificacionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: pendings = [], isLoading } = useQuery({
        queryKey: ['admin-kyc-pendientes'],
        queryFn: getPendingVerifications,
    });

    const renderItem = ({ item }: { item: KYCUser }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/admin/verificacion/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: '#f59e0b20' }]}>
                    <Clock size={12} color="#f59e0b" />
                    <Text style={[styles.statusText, { color: "#f59e0b" }]}>PENDIENTE</Text>
                </View>
                <Text style={[styles.date, { color: theme.textMuted }]}>{new Date(item.created_at || '').toLocaleDateString()}</Text>
            </View>

            <View style={styles.userInfo}>
                <View style={[styles.userIcon, { backgroundColor: theme.primary + '15' }]}>
                    <User size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: theme.text }]}>ID: {item.id.substring(0, 12)}...</Text>
                    <Text style={[styles.userMeta, { color: theme.textMuted }]}>Tipo Doc: {item.document_type || 'ID Oficial'}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#10b98120' }]}
                    onPress={() => verifyUser(item.id, 'VERIFIED')}
                >
                    <CheckCircle2 size={16} color="#10b981" />
                    <Text style={[styles.btnText, { color: '#10b981' }]}>Aprobar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#ef444420' }]}
                    onPress={() => verifyUser(item.id, 'REJECTED')}
                >
                    <XCircle size={16} color="#ef4444" />
                    <Text style={[styles.btnText, { color: '#ef4444' }]}>Rechazar</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Verificaciones KYC</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Validación de identidades para servicios Pro</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={pendings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <ShieldCheck size={60} color={theme.textMuted} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay pendientes</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                                Todo está al día por aquí. El equipo de seguridad ha procesado todo.
                            </Text>
                        </View>
                    }
                />
            )}
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
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 13,
    },
    list: {
        padding: 24,
        gap: 20,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    userIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    userMeta: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 16,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 44,
        borderRadius: 12,
    },
    btnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    empty: {
        paddingTop: 80,
        alignItems: 'center',
        gap: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    }
});
