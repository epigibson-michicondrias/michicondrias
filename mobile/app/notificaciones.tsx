import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import {
    Bell, CheckCheck, Heart, Package, MapPin, Calendar, Pill, Shield, FlaskConical, Flower2, Car, ChevronRight,
    Stethoscope, ShieldCheck, Syringe,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useNotifications, formatTimeAgo } from '@/src/hooks/notifications/useNotifications';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { spacing, radius, type, layout } from '@/constants/design';
import type { Notification } from '@/src/types/notifications';

type ThemeColorKey = 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'info' | 'textMuted';

/** Ícono y color (del tema) por tipo de notificación que emite el backend. */
const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: ThemeColorKey }> = {
    general: { icon: Heart, color: 'secondary' },        // adopciones
    alert: { icon: MapPin, color: 'error' },             // mascotas perdidas
    citas: { icon: Calendar, color: 'primary' },
    cirugias: { icon: Stethoscope, color: 'primary' },
    recetas: { icon: Pill, color: 'success' },          // dosis de medicamento (F14)
    vacunas: { icon: Syringe, color: 'info' },           // refuerzos de vacuna (F14)
    kyc: { icon: ShieldCheck, color: 'success' },
    seguros: { icon: Shield, color: 'info' },
    laboratorio: { icon: FlaskConical, color: 'success' },
    funeraria: { icon: Flower2, color: 'textMuted' },
    transportistas: { icon: Car, color: 'primary' },
    store: { icon: Package, color: 'accent' },
};
const DEFAULT_CONFIG = { icon: Bell, color: 'accent' as ThemeColorKey };

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const { notifications, isLoading, isError, unreadCount, getRoute, openNotification, handleMarkAllAsRead, isMarkingAll } = useNotifications();

    const markAllButton = unreadCount > 0 ? (
        <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAll}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como leídas"
        >
            <CheckCheck size={layout.icon.md} color={theme.primary} />
        </TouchableOpacity>
    ) : (
        <View style={styles.headerBtn} />
    );

    const renderItem = ({ item }: { item: Notification }) => {
        const config = TYPE_CONFIG[item.type] || DEFAULT_CONFIG;
        const Icon = config.icon;
        const color = theme[config.color];
        const hasRoute = !!getRoute(item);
        const content = (
            <>
                <View style={[styles.iconBox, { backgroundColor: theme.overlayHover }]}>
                    <Icon size={layout.icon.md} color={color} />
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                        <Text style={[type.subtitle, styles.notifTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                    </View>
                    <Text style={[type.body, { color: theme.textMuted }]}>{item.message}</Text>
                    <Text style={[type.caption, styles.notifTime, { color: theme.textMuted }]}>{formatTimeAgo(item.created_at)}</Text>
                </View>
                {hasRoute && <ChevronRight size={layout.icon.sm} color={theme.textMuted} />}
            </>
        );
        const cardStyle = [
            styles.notifCard,
            { backgroundColor: item.is_read ? theme.background : theme.surface, borderColor: theme.borderLight },
        ];
        const label = `${item.is_read ? '' : 'No leída. '}${item.title}. ${item.message}`;

        // Solo es tocable si lleva a algún lado; si no, tocarla únicamente la marca como leída
        if (!hasRoute) {
            return (
                <TouchableOpacity
                    style={cardStyle}
                    activeOpacity={item.is_read ? 1 : 0.7}
                    disabled={item.is_read}
                    onPress={() => openNotification(item)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityHint={item.is_read ? undefined : 'Toca para marcarla como leída'}
                >
                    {content}
                </TouchableOpacity>
            );
        }
        return (
            <TouchableOpacity
                style={cardStyle}
                activeOpacity={0.7}
                onPress={() => openNotification(item)}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                {content}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Notificaciones" rightElement={markAllButton} />
            {isLoading ? (
                <SkeletonList count={4} />
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.list, notifications.length === 0 && styles.listEmpty]}
                    ListEmptyComponent={
                        // Si falló la carga, el aviso con "Reintentar" de ScreenContainer basta: "sin notificaciones" sería falso
                        isError ? null : <EmptyState
                            icon={<Bell size={layout.icon.xl} color={theme.textMuted} />}
                            title="Sin notificaciones"
                            subtitle="Aquí verás avisos de tus citas, adopciones, pedidos y más."
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerBtn: {
        width: layout.minTouch,
        height: layout.minTouch,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge,
        gap: spacing.md,
    },
    listEmpty: {
        flexGrow: 1,
    },
    notifCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: radius.lg,
        gap: spacing.md,
        borderWidth: 1,
    },
    iconBox: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifContent: {
        flex: 1,
        gap: spacing.xs,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },
    notifTitle: {
        flex: 1,
    },
    unreadDot: {
        width: spacing.sm,
        height: spacing.sm,
        borderRadius: radius.pill,
    },
    notifTime: {
        marginTop: spacing.xs,
    },
});
