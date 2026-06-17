import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { usePatients } from '@/src/hooks/clinica/usePatients';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Users, AlertTriangle, Activity, Search, X } from 'lucide-react-native';

export default function PacientesScreen() {
    const { theme } = useTheme();
    const {
        filter, setFilter, showSearch, searchQuery, setSearchQuery,
        loadingClinics, loadingPatients, filteredPatients, filterTabs, toggleSearch,
    } = usePatients();

    if (loadingClinics) {
        return (
            <ScreenContainer style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Pacientes"
                gradient={['#f43f5e', '#e11d48', '#be123c']}
                rightElement={
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={toggleSearch}
                    >
                        {showSearch ? <X size={20} color="#fff" /> : <Search size={20} color="#fff" />}
                    </TouchableOpacity>
                }
            />
                
            {showSearch && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
                        placeholder="Buscar por mascota o dueño..."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                </View>
            )}

            {/* Severity Filter Tabs */}
            <View style={styles.tabsWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                    {filterTabs.map(tab => (
                        <TouchableOpacity 
                            key={tab.id}
                            style={[styles.tab, filter === tab.id && styles.activeTab]}
                            onPress={() => setFilter(tab.id)}
                        >
                            <Text style={[styles.tabText, { color: filter === tab.id ? '#e11d48' : '#666' }]}>
                                {tab.label} ({tab.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingPatients ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : filteredPatients.length === 0 ? (
                        <View style={[styles.emptyRecent, { backgroundColor: theme.surface }]}>
                            <Activity size={40} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, fontWeight: '600', marginTop: 12 }}>
                                {searchQuery ? "No hay pacientes que coincidan con la búsqueda" : `No hay pacientes en categoría "${filterTabs.find(t => t.id === filter)?.label}"`}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center', alignItems: 'center' },
    tabsWrapper: { paddingHorizontal: 24, paddingVertical: 16 },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
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
    searchContainer: { paddingHorizontal: 24, paddingBottom: 8 },
    searchInput: { height: 44, borderRadius: 12, paddingHorizontal: 16, fontWeight: '600' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});
