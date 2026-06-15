import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Bell, Heart, Package, ShieldCheck, MapPin, Bone } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getMyNotifications, Notification } from '@/src/services/notifications';

const { width } = Dimensions.get('window');

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
    lost: { icon: MapPin, color: '#ef4444' },
    adoption: { icon: Heart, color: '#ec4899' },
    store: { icon: Package, color: '#f59e0b' },
    system: { icon: ShieldCheck, color: '#10b981' },
    general: { icon: Bell, color: '#3b82f6' },
};

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: getMyNotifications,
    });

    const renderItem = ({ item }: { item: Notification }) => {
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;
        const Icon = config.icon;
        return (
            <TouchableOpacity
                style={[styles.notifCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, { backgroundColor: config.color + '15' }]}>
                    <Icon size={22} color={config.color} />
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                        <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                    </View>
                    <Text style={[styles.notifDesc, { color: theme.textMuted }]}>{item.message}</Text>
                    <Text style={[styles.notifTime, { color: theme.textMuted }]}>{formatTimeAgo(item.created_at)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Notificaciones</Text>
                <TouchableOpacity style={styles.clearBtn}>
                    <Bell size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Bell size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay notificaciones por ahora</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    clearBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    notifCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    notifDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    notifTime: {
        fontSize: 11,
        fontWeight: '600',
    },
    empty: {
        flex: 1,
        paddingTop: 100,
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
