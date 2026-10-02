import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import FilterChip from '@/src/components/FilterChip';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { getMyClinics } from '@/src/services/directorio';
import { getClinicPatients, ClinicPatient } from '@/src/services/patients';
import { formatDateMx } from '@/src/features/salud/format';
import { Users, PawPrint, AlertTriangle } from 'lucide-react-native';

type Filter = 'all' | 'upcoming' | 'critical';

export default function PacientesScreen() {
    const { theme } = useTheme();
    const [filter, setFilter] = useState<Filter>('all');
    const [q, setQ] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({ queryKey: ['my-clinics'], queryFn: getMyClinics });
    const clinic = clinics[0];
    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['clinic-patients', clinic?.id],
        queryFn: () => getClinicPatients(clinic!.id),
        enabled: !!clinic?.id,
    });

    const list = patients
        .filter((p) => (filter === 'upcoming' ? !!p.next_visit : filter === 'critical' ? p.alert_level === 'red' || p.alert_level === 'yellow' : true))
        .filter((p) => `${p.name} ${p.owner}`.toLowerCase().includes(q.trim().toLowerCase()));

    const count = (f: Filter) =>
        f === 'all' ? patients.length : f === 'upcoming' ? patients.filter((p) => p.next_visit).length : patients.filter((p) => p.alert_level === 'red' || p.alert_level === 'yellow').length;

    const renderItem = ({ item }: { item: ClinicPatient }) => {
        const critical = item.alert_level === 'red' || item.alert_level === 'yellow';
        const tone = item.alert_level === 'red' ? theme.error : theme.warning;
        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.head}>
                    <View style={[styles.icon, { backgroundColor: critical ? theme.errorLight : theme.primary + '15' }]}>
                        {critical ? <AlertTriangle size={22} color={tone} /> : <PawPrint size={22} color={theme.primary} />}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.sub, { color: theme.textMuted }]} numberOfLines={1}>
                            {[item.species, item.breed].filter(Boolean).join(' · ') || 'Mascota'} · Dueño: {item.owner}
                        </Text>
                    </View>
                    {critical && (
                        <View style={[styles.badge, { backgroundColor: theme.errorLight }]}>
                            <Text style={{ color: tone, fontWeight: '800', fontSize: 11 }}>{item.alert_level === 'red' ? 'URGENTE' : 'EN OBSERVACIÓN'}</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.stats, { borderTopColor: theme.border }]}>
                    <View style={styles.stat}><Text style={[styles.statLabel, { color: theme.textMuted }]}>Visitas</Text><Text style={[styles.statValue, { color: theme.text }]}>{item.visits}</Text></View>
                    <View style={styles.stat}><Text style={[styles.statLabel, { color: theme.textMuted }]}>Última</Text><Text style={[styles.statValue, { color: theme.text }]}>{formatDateMx(item.last_visit) || '—'}</Text></View>
                    <View style={styles.stat}><Text style={[styles.statLabel, { color: theme.textMuted }]}>Próxima</Text><Text style={[styles.statValue, { color: theme.text }]}>{formatDateMx(item.next_visit) || 'Sin cita'}</Text></View>
                </View>
            </View>
        );
    };

    if (loadingClinics) {
        return (
            <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Pacientes" subtitle="Mascotas que atiendes" />
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
                <TextInput
                    style={[styles.search, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                    placeholder="Buscar por mascota o dueño..."
                    placeholderTextColor={theme.textMuted}
                    value={q}
                    onChangeText={setQ}
                    accessibilityLabel="Buscar paciente"
                />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.chips}>
                <FilterChip label={`Todos (${count('all')})`} active={filter === 'all'} onPress={() => setFilter('all')} />
                <FilterChip label={`Con cita próxima (${count('upcoming')})`} active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
                <FilterChip label={`Críticos (${count('critical')})`} active={filter === 'critical'} onPress={() => setFilter('critical')} />
            </ScrollView>

            {isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(p) => p.id}
                    renderItem={renderItem}
                    refreshControl={<AppRefreshControl />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Users size={32} color={theme.textMuted} />}
                            title={q || filter !== 'all' ? 'Sin coincidencias' : 'Aún no tienes pacientes'}
                            subtitle={q || filter !== 'all' ? 'Prueba con otro filtro o búsqueda.' : 'Aparecen aquí cuando una mascota agenda una cita en tu clínica.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    search: { height: 46, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14 },
    chips: { paddingHorizontal: 24, gap: 8, marginBottom: 12 },
    list: { paddingHorizontal: 24, paddingBottom: 100 },
    card: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
    head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    icon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: '800' },
    sub: { fontSize: 12, marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    stats: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
    stat: { flex: 1 },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    statValue: { fontSize: 13, fontWeight: '700', marginTop: 3 },
});
