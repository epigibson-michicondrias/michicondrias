import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Info, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const MOCK_SOLICITUDES = [
    {
        id: '1',
        pet_name: 'Luna',
        pet_image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=400',
        status: 'pending',
        status_label: 'En Revisión',
        date: '15 Mar 2026',
        color: '#f59e0b',
    },
    {
        id: '2',
        pet_name: 'Simba',
        pet_image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400',
        status: 'approved',
        status_label: 'Aprobada',
        date: '10 Mar 2026',
        color: '#10b981',
    },
];

export default function MisSolicitudesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const renderItem = ({ item }: { item: typeof MOCK_SOLICITUDES[0] }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface }]}>
            <Image source={{ uri: item.pet_image }} style={styles.petImage} />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.petName, { color: theme.text }]}>{item.pet_name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.color + '15' }]}>
                        <Text style={[styles.statusText, { color: item.color }]}>{item.status_label}</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.date, { color: theme.textMuted }]}>Solicitado el {item.date}</Text>
                </View>
                <TouchableOpacity style={[styles.detailsBtn, { backgroundColor: theme.primary + '10' }]}>
                    <Text style={[styles.detailsBtnText, { color: theme.primary }]}>Ver seguimiento</Text>
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
                <Text style={[styles.title, { color: theme.text }]}>Mis Solicitudes</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={MOCK_SOLICITUDES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
                        <Info size={20} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.text }]}>
                            El proceso de revisión puede tomar de 3 a 5 días hábiles. Te notificaremos cualquier cambio.
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <CheckCircle2 size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aún no has solicitado ninguna adopción</Text>
                        <TouchableOpacity
                            style={[styles.browseBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/adopciones')}
                        >
                            <Text style={styles.browseBtnText}>Explorar mascotas</Text>
                        </TouchableOpacity>
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
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
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
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 18,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    petName: {
        fontSize: 18,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsBtn: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    detailsBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    empty: {
        paddingTop: 80,
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    browseBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: '800',
    }
});
