import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics } from '../../src/services/directorio';
import { getCriticalPatients } from '../../src/services/patients';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Users, AlertTriangle, Activity, Search, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyboardScreen from '@/src/components/KeyboardScreen';

export default function PacientesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<'all' | 'critical'>('critical');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: criticalPatients = [], isLoading: loadingPatients } = useQuery({
        queryKey: ['critical-patients', clinic?.id],
        queryFn: () => getCriticalPatients(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    if (loadingClinics) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const filteredPatients = criticalPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        patient.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Premium Header */}
            <LinearGradient
                colors={['#f43f5e', '#e11d48', '#be123c']}
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
                        <Text style={styles.title}>Pacientes</Text>
                        <Text style={styles.subtitle}>{clinic?.name}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => setShowSearch(!showSearch)}
                    >
                        {showSearch ? <X size={20} color="#fff" /> : <Search size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>
                
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                            placeholder="Buscar por mascota o dueño..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                )}

                {/* Glassmorphic Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'critical' && styles.activeTab]}
                        onPress={() => setFilter('critical')}
                    >
                        <AlertTriangle size={16} color={filter === 'critical' ? '#e11d48' : '#fff'} />
                        <Text style={[styles.tabText, { color: filter === 'critical' ? '#e11d48' : '#fff' }]}>Críticos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'all' && styles.activeTab]}
                        onPress={() => setFilter('all')}
                    >
                        <Users size={16} color={filter === 'all' ? '#e11d48' : '#fff'} />
                        <Text style={[styles.tabText, { color: filter === 'all' ? '#e11d48' : '#fff' }]}>Todos</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingPatients ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : filter === 'critical' && filteredPatients.length === 0 ? (
                        <View style={[styles.emptyRecent, { backgroundColor: theme.surface }]}>
                            <Activity size={40} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, fontWeight: '600', marginTop: 12 }}>
                                {searchQuery ? "No hay pacientes que coincidan con la búsqueda" : "No hay pacientes críticos"}
                            </Text>
                        </View>
                    ) : (
                        filteredPatients.map(patient => (
                            <TouchableOpacity key={patient.id} style={[styles.patientCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.patientHeader}>
                                    <View style={[styles.patientIcon, { backgroundColor: patient.alertLevel === 'red' ? '#f43f5e15' : '#f59e0b15' }]}>
                                        <AlertTriangle size={24} color={patient.alertLevel === 'red' ? '#f43f5e' : '#f59e0b'} />
                                    </View>
                                    <View style={styles.patientInfo}>
                                        <Text style={[styles.patientName, { color: theme.text }]}>{patient.name}</Text>
                                        <Text style={[styles.ownerName, { color: theme.textMuted }]}>Dueño: {patient.owner}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: patient.alertLevel === 'red' ? '#f43f5e20' : '#f59e0b20' }]}>
                                        <Text style={[styles.statusText, { color: patient.alertLevel === 'red' ? '#f43f5e' : '#f59e0b' }]}>
                                            {patient.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.medicalInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Condición</Text>
                                        <Text style={[styles.infoValue, { color: theme.text }]}>{patient.condition}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Próximo Chequeo</Text>
                                        <Text style={[styles.infoValue, { color: theme.text }]}>
                                            {patient.nextCheckup ? new Date(patient.nextCheckup).toLocaleDateString() : 'Por definir'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={[styles.treatmentBox, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                                    <Text style={[styles.treatmentLabel, { color: theme.textMuted }]}>Tratamiento Activo:</Text>
                                    <Text style={[styles.treatmentText, { color: theme.text }]}>{patient.treatment}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    premiumHeader: { 
        paddingHorizontal: 24, 
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20
    },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: { backgroundColor: '#fff' },
    tabText: { fontSize: 13, fontWeight: '800' },
    contentScroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 100 },
    emptyRecent: {
        padding: 40, borderRadius: 24, alignItems: 'center',
        borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 20
    },
    patientCard: {
        padding: 16, borderRadius: 20, borderWidth: 1,
        marginBottom: 16
    },
    patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    patientIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    patientInfo: { flex: 1 },
    patientName: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    ownerName: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    medicalInfo: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16, paddingBottom: 12 },
    infoRow: { flex: 1 },
    infoLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#888' },
    infoValue: { fontSize: 14, fontWeight: '800', marginTop: 4 },
    treatmentBox: { padding: 12, borderRadius: 12 },
    treatmentLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
    treatmentText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
    searchContainer: { paddingHorizontal: 24, paddingBottom: 16, marginTop: -4 },
    searchInput: { height: 44, borderRadius: 12, paddingHorizontal: 16, color: '#fff', fontWeight: '600' }
});
