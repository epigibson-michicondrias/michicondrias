import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getClinics, getVets, Clinic, Vet } from '../../src/services/directorio';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, MapPin, Phone, Star, ChevronRight, Stethoscope, Hospital, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DirectorioIndexScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [activeTab, setActiveTab] = useState<'clinics' | 'vets'>('clinics');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['directorio-clinics'],
        queryFn: getClinics,
    });

    const { data: vets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['directorio-vets'],
        queryFn: () => getVets(),
    });

    const filteredClinics = clinics.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredVets = vets.filter(v =>
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/directorio/clinica/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                    <Hospital size={24} color={theme.primary} />
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>{item.city || 'Ubicación no disponible'}</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.tagRow}>
                    {item.is_24_hours && (
                        <View style={[styles.tag, { backgroundColor: '#3b82f620' }]}>
                            <Text style={[styles.tagText, { color: '#60a5fa' }]}>🕒 24 Horas</Text>
                        </View>
                    )}
                    {item.has_emergency && (
                        <View style={[styles.tag, { backgroundColor: '#ef444420' }]}>
                            <Text style={[styles.tagText, { color: '#f87171' }]}>🚨 Urgencias</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {/* Handle phone call */ }}
                >
                    <Phone size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderVetItem = ({ item }: { item: Vet }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/directorio/especialista/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.logoPlaceholder, { borderRadius: 30, backgroundColor: theme.secondary + '20' }]}>
                    <Stethoscope size={24} color={theme.secondary} />
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.first_name} {item.last_name}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.secondary }]}>{item.specialty || 'Médico Veterinario'}</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>

            <View style={[styles.cardFooter, { justifyContent: 'flex-start', gap: 12 }]}>
                <View style={styles.certificationBox}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={styles.certificationText}>Cédula Verificada</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Directorio Médico</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Salud de calidad para tu mejor amigo</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder="Buscar por nombre, especialidad o ciudad..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'clinics' && { borderBottomColor: theme.primary }]}
                    onPress={() => setActiveTab('clinics')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'clinics' ? theme.text : theme.textMuted }]}>Clínicas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'vets' && { borderBottomColor: theme.primary }]}
                    onPress={() => setActiveTab('vets')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'vets' ? theme.text : theme.textMuted }]}>Especialistas</Text>
                </TouchableOpacity>
            </View>

            {(activeTab === 'clinics' ? loadingClinics : loadingVets) ? (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.textMuted }}>Buscando profesionales...</Text>
                </View>
            ) : (
                <FlatList
                    data={(activeTab === 'clinics' ? filteredClinics : filteredVets) as any}
                    keyExtractor={(item) => item.id}
                    renderItem={activeTab === 'clinics' ? renderClinicItem as any : renderVetItem as any}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No encontramos resultados para tu búsqueda.</Text>
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
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardMainInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    cardSubtitle: {
        fontSize: 13,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    callBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    certificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10b98110',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    certificationText: {
        fontSize: 11,
        color: '#10b981',
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        paddingTop: 40,
    }
});
