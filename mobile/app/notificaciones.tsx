import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Heart, Package, ShieldCheck, MapPin, Bone } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width } = Dimensions.get('window');

const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: '¡Mascota encontrada!',
        description: 'Alguien ha visto una mascota que coincide con tu reporte de "Luna".',
        type: 'lost',
        icon: MapPin,
        color: '#ef4444',
        time: 'Hace 5 min',
        read: false,
    },
    {
        id: '2',
        title: 'Solicitud de Adopción',
        description: 'Has recibido una nueva solicitud para adoptar a "Michi".',
        type: 'adoption',
        icon: Heart,
        color: '#ec4899',
        time: 'Hace 1 hora',
        read: false,
    },
    {
        id: '3',
        title: 'Pedido en camino',
        description: 'Tu pedido de "Croquetas Premium" ha salido del almacén.',
        type: 'store',
        icon: Package,
        color: '#f59e0b',
        time: 'Hace 3 horas',
        read: true,
    },
    {
        id: '4',
        title: 'Perfil Verificado',
        description: '¡Felicidades! Tu cuenta ha sido verificada con éxito.',
        type: 'system',
        icon: ShieldCheck,
        color: '#10b981',
        time: 'Ayer',
        read: true,
    },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
        <TouchableOpacity
            style={[styles.notifCard, { backgroundColor: theme.surface }]}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={22} color={item.color} />
            </View>
            <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, { color: theme.text }]}>{item.title}</Text>
                    {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                </View>
                <Text style={[styles.notifDesc, { color: theme.textMuted }]}>{item.description}</Text>
                <Text style={[styles.notifTime, { color: theme.textMuted }]}>{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

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
                data={MOCK_NOTIFICATIONS}
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
        borderColor: 'rgba(255,255,255,0.05)',
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
