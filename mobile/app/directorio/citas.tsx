import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Calendar, Clock, MapPin, Stethoscope, Plus } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const MOCK_CITAS = [
    {
        id: '1',
        clinic_name: 'Clínica Veterinaria Del Bosque',
        service: 'Vacunación Anual',
        pet_name: 'Luna',
        date: '20 Mar 2026',
        time: '10:30 AM',
        status: 'upcoming',
    },
    {
        id: '2',
        clinic_name: 'Hospital Michis & Amigos',
        service: 'Chequeo General',
        pet_name: 'Simba',
        date: '25 Mar 2026',
        time: '04:00 PM',
        status: 'upcoming',
    },
];

export default function CitasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const renderItem = ({ item }: { item: typeof MOCK_CITAS[0] }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.dateBox, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.dateText, { color: theme.primary }]}>{item.date.split(' ')[0]}</Text>
                <Text style={[styles.monthText, { color: theme.primary }]}>{item.date.split(' ')[1]}</Text>
            </View>
            <View style={styles.content}>
                <Text style={[styles.clinicName, { color: theme.text }]} numberOfLines={1}>{item.clinic_name}</Text>
                <Text style={[styles.service, { color: theme.textMuted }]}>{item.service} · {item.pet_name}</Text>
                <View style={styles.footerRow}>
                    <View style={styles.infoTag}>
                        <Clock size={12} color={theme.textMuted} />
                        <Text style={[styles.infoTagText, { color: theme.textMuted }]}>{item.time}</Text>
                    </View>
                    <View style={styles.infoTag}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.infoTagText, { color: theme.textMuted }]}>Ver mapa</Text>
                    </View>
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
                <Text style={[styles.title, { color: theme.text }]}>Mis Citas Médicas</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/directorio')}>
                    <Plus size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_CITAS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Calendar size={64} color={theme.textMuted} strokeWidth={1} />
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tienes citas programadas</Text>
                        <TouchableOpacity
                            style={[styles.bookBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/directorio')}
                        >
                            <Text style={styles.bookBtnText}>Agendar ahora</Text>
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
        fontSize: 18,
        fontWeight: '900',
    },
    addBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    dateBox: {
        width: 60,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '900',
    },
    monthText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    clinicName: {
        fontSize: 16,
        fontWeight: '800',
    },
    service: {
        fontSize: 13,
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
    },
    infoTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoTagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    empty: {
        paddingTop: 100,
        alignItems: 'center',
        gap: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bookBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    bookBtnText: {
        color: '#fff',
        fontWeight: '800',
    }
});
