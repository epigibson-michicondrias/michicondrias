import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Package, Clock, ShoppingBag } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const MOCK_COMPRAS = [
    {
        id: 'ORD-5542',
        item_name: 'Pack Croquetas Premium (10kg)',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400',
        total: '$850.00',
        status: 'delivered',
        status_label: 'Entregado',
        date: '02 Mar 2026',
        color: '#10b981',
    },
    {
        id: 'ORD-5210',
        item_name: 'Juguete Interactivo Michi-Zap',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=400',
        total: '$320.00',
        status: 'shipped',
        status_label: 'En Camino',
        date: '05 Mar 2026',
        color: '#3b82f6',
    },
];

export default function ComprasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const renderItem = ({ item }: { item: typeof MOCK_COMPRAS[0] }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface }]}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.orderId, { color: theme.textMuted }]}>{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.color + '15' }]}>
                        <Text style={[styles.statusText, { color: item.color }]}>{item.status_label}</Text>
                    </View>
                </View>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.item_name}</Text>
                <View style={styles.footerRow}>
                    <Text style={[styles.price, { color: theme.text }]}>{item.total}</Text>
                    <View style={[styles.dot, { backgroundColor: theme.border }]} />
                    <Text style={[styles.date, { color: theme.textMuted }]}>{item.date}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Mis Compras</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={MOCK_COMPRAS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ShoppingBag size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aún no has realizado compras</Text>
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
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 11,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '800',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '900',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
