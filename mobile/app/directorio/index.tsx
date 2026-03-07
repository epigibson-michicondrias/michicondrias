import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getClinics, getVets, Clinic, Vet } from '../../src/services/directorio';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, MapPin, Phone, Star, ChevronRight, Stethoscope, Hospital, ShieldCheck, Plus, Building } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DirectorioIndexScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'clinics' | 'vets'>('clinics');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterService, setFilterService] = useState('all');
    const [isVet, setIsVet] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [canRegister, setCanRegister] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Check roles
        const vetRole = user?.role_name === 'veterinario';
        const adminRole = user?.role_name === 'admin';
        setIsVet(vetRole);
        setIsAdmin(adminRole);
        setCanRegister(vetRole || adminRole);
    }, [user]);

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['directorio-clinics'],
        queryFn: getClinics,
    });

    const { data: vets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['directorio-vets'],
        queryFn: () => getVets(),
    });

    const filteredClinics = clinics.filter(c => {
        const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesService = filterService === "all"
            || (filterService === "24h" && c.is_24_hours)
            || (filterService === "emergencia" && c.has_emergency);
        return matchesQuery && matchesService;
    });

    const filteredVets = vets.filter(v => {
        const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
        const matchesQuery = fullName.includes(searchQuery.toLowerCase()) ||
            (v.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesQuery;
    });

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/directorio/clinica/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                            {item.city || "Ciudad no disp."}, {item.state || "MX"}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.tagsRow}>
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
                    {!item.is_24_hours && !item.has_emergency && (
                        <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <Text style={[styles.tagText, { color: theme.textMuted }]}>🕐 Horario Regular</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.description, { color: theme.textMuted }]}>
                    {item.description
                        ? (item.description.length > 95 ? item.description.substring(0, 95) + "..." : item.description)
                        : "Clínica veterinaria inscrita en la red Michicondrias."}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                {item.phone && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => {/* Handle phone call */ }}
                    >
                        <Phone size={16} color={theme.text} />
                        <Text style={[styles.actionBtnText, { color: theme.text }]}>Llamar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push(`/directorio/clinica/${item.id}` as any)}
                >
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Ver Perfil</Text>
                    <ChevronRight size={16} color="#fff" />
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
                <View style={[styles.avatarPlaceholder, { borderRadius: 14, backgroundColor: '#10b98120', borderColor: '#10b98130' }]}>
                    <Text style={[styles.avatarText, { color: '#10b981' }]}>
                        {item.first_name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.first_name} {item.last_name}</Text>
                    <View style={styles.locationRow}>
                        <ShieldCheck size={14} color="#10b981" />
                        <Text style={[styles.cardSubtitle, { color: '#10b981', fontWeight: '700' }]}>
                            {item.specialty || "Médico Veterinario"}
                        </Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.cardBody}>
                <Text style={[styles.description, { color: theme.textMuted, marginBottom: 20 }]}>
                    {item.bio || "Profesional de la salud animal verificado en Michicondrias."}
                </Text>
                <View style={[styles.certificationBox, { backgroundColor: '#10b98110', borderColor: '#10b98120' }]}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={[styles.certificationText, { color: '#10b981' }]}>
                        <Text style={{ fontWeight: '700' }}>Cédula:</Text> {item.license_number ? "Verificada" : "En Validación"}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                {item.phone && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                        onPress={() => {/* Handle phone call */ }}
                    >
                        <Phone size={16} color="#fff" />
                        <Text style={[styles.actionBtnText, { color: '#fff' }]}>Contactar Profesional</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <Text style={[styles.title, { color: theme.text }]}>Directorio Médico</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Encuentra salud de calidad para tu mejor amigo en la red Michicondrias</Text>
                </View>
                
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'clinics' && styles.tabActive]}
                        onPress={() => setActiveTab('clinics')}
                    >
                        <Hospital size={18} color={activeTab === 'clinics' ? theme.text : theme.textMuted} />
                        <Text style={[styles.tabText, { color: activeTab === 'clinics' ? theme.text : theme.textMuted }]}>Clínicas y Hospitales</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'vets' && styles.tabActive]}
                        onPress={() => setActiveTab('vets')}
                    >
                        <Stethoscope size={18} color={activeTab === 'vets' ? theme.text : theme.textMuted} />
                        <Text style={[styles.tabText, { color: activeTab === 'vets' ? theme.text : theme.textMuted }]}>Especialistas Independientes</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.toolbar, { backgroundColor: theme.surface }]}>
                <View style={styles.searchContainer}>
                    <Search size={20} color={theme.textMuted} style={styles.searchIcon} />
                    <TextInput
                        placeholder={activeTab === 'clinics' ? "Buscar por nombre o ciudad..." : "Buscar por nombre o especialidad..."}
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text, backgroundColor: 'transparent', paddingLeft: 48 }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                
                {activeTab === 'clinics' && (
                    <View style={styles.filterContainer}>
                        <TouchableOpacity
                            style={[styles.filterButton, filterService === 'all' && styles.filterButtonActive, { backgroundColor: filterService === 'all' ? theme.primary : theme.surface }]}
                            onPress={() => setFilterService('all')}
                        >
                            <Text style={[styles.filterButtonText, { color: filterService === 'all' ? '#fff' : theme.text }]}>Todas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, filterService === '24h' && styles.filterButtonActive, { backgroundColor: filterService === '24h' ? theme.primary : theme.surface }]}
                            onPress={() => setFilterService('24h')}
                        >
                            <Text style={[styles.filterButtonText, { color: filterService === '24h' ? '#fff' : theme.text }]}>🕒 24 Horas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterButton, filterService === 'emergencia' && styles.filterButtonActive, { backgroundColor: filterService === 'emergencia' ? theme.primary : theme.surface }]}
                            onPress={() => setFilterService('emergencia')}
                        >
                            <Text style={[styles.filterButtonText, { color: filterService === 'emergencia' ? '#fff' : theme.text }]}>🚨 Urgencias</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Mi Clínica Banner for Vet/Admin */}
            {isMounted && canRegister && (
                <View style={[styles.miClinicaBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                    <View style={styles.miClinicaContent}>
                        <View style={styles.miClinicaIcon}>
                            <Building size={24} color={theme.primary} />
                        </View>
                        <View style={styles.miClinicaText}>
                            <Text style={[styles.miClinicaTitle, { color: theme.primary }]}>Panel de Mi Clínica</Text>
                            <Text style={[styles.miClinicaSubtitle, { color: theme.textMuted }]}>Edita tu información, gestiona especialistas y ve tus reseñas</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.miClinicaButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/mi-clinica' as any)}
                    >
                        <Text style={styles.miClinicaButtonText}>Administrar →</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Registrar Clínica Button */}
            {isMounted && canRegister && activeTab === 'clinics' && (
                <TouchableOpacity
                    style={[styles.registerButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/directorio/nuevo-lugar' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={styles.registerButtonText}>Registrar mi Clínica</Text>
                </TouchableOpacity>
            )}

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
        </ScrollView>
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
        position: 'relative',
        marginBottom: 0,
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
        paddingLeft: 48,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    tabActive: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    toolbar: {
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    filterButtonActive: {
        borderColor: 'transparent',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    miClinicaBanner: {
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    miClinicaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    miClinicaIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miClinicaText: {
        flex: 1,
    },
    miClinicaTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    miClinicaSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    miClinicaButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    miClinicaButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    registerButton: {
        marginHorizontal: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
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
        gap: 12,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '800',
    },
    cardBody: {
        marginTop: 16,
        marginBottom: 16,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
        flex: 1,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    titleSection: {
        marginBottom: 20,
    },
    certificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    certificationText: {
        fontSize: 13,
        fontWeight: '600',
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
