import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicsAndVets } from '@/src/hooks/directorio';
import type { Clinic, Vet } from '@/src/types/directorio';
import { Search, MapPin, Phone, ChevronRight, Stethoscope, Hospital, ShieldCheck, Plus, Building, Clock, Navigation, Star } from 'lucide-react-native';
import DataList from '@/src/components/data/DataList';
import BackButton from '@/src/components/BackButton';
import { showAlert } from '@/src/components/AppAlert';
import { StatusBar } from 'expo-status-bar';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DirectorioIndexScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const {
        filteredClinics,
        filteredVets,
        loadingClinics,
        loadingVets,
        isLoading,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filterService,
        setFilterService,
        canRegister,
        isMounted,
        resultsCount,
    } = useClinicsAndVets();

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push(`/directorio/clinica/${item.id}` as any)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.cardInfoSubrows}>
                        <View style={styles.locationRow}>
                            <MapPin size={13} color={theme.textMuted} />
                            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]} numberOfLines={1}>
                                {item.city || "Ciudad"}, {item.state || "MX"}
                            </Text>
                        </View>
                        <View style={styles.ratingRowInline}>
                            <Star size={13} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingTextInline, { color: theme.text }]}>
                                {item.average_rating ? item.average_rating.toFixed(1) : '5.0'}
                            </Text>
                            <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>
                                ({item.total_reviews || 0})
                            </Text>
                        </View>
                    </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.tagsRow}>
                    {item.is_24_hours && (
                        <View style={[styles.tag, { backgroundColor: theme.infoLight }]}>
                            <Clock size={12} color={theme.info} />
                            <Text style={[styles.tagText, { color: theme.info }]}>24 Horas</Text>
                        </View>
                    )}
                    {item.has_emergency && (
                        <View style={[styles.tag, { backgroundColor: theme.errorLight }]}>
                            <Navigation size={12} color={theme.error} />
                            <Text style={[styles.tagText, { color: theme.error }]}>Urgencias</Text>
                        </View>
                    )}
                    {!item.is_24_hours && !item.has_emergency && (
                        <View style={[styles.tag, { backgroundColor: theme.overlay }]}>
                            <Clock size={12} color={theme.textMuted} />
                            <Text style={[styles.tagText, { color: theme.textMuted }]}>Horario Regular</Text>
                        </View>
                    )}
                </View>
                {item.services && item.services.length > 0 && (
                    <View style={styles.cardServicesRow}>
                        <Text style={[styles.servicesLabel, { color: theme.primary }]}>Servicios: </Text>
                        <Text style={[styles.servicesListText, { color: theme.textMuted }]} numberOfLines={1}>
                            {item.services.join(', ')}
                        </Text>
                    </View>
                )}
                {item.description && (
                    <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                {item.phone && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.overlay, borderColor: theme.border }]}
                        onPress={() => {
                            Linking.openURL(`tel:${item.phone}`).catch(() => {
                                showAlert({
                                    type: 'error',
                                    title: 'Error',
                                    message: 'No se pudo abrir la aplicación de teléfono.'
                                });
                            });
                        }}
                    >
                        <Phone size={15} color={theme.text} />
                        <Text style={[styles.actionBtnText, { color: theme.text }]}>Llamar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push(`/directorio/clinica/${item.id}` as any)}
                >
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Ver Perfil</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderVetItem = ({ item }: { item: Vet }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push(`/directorio/especialista/${item.id}` as any)}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.successLight, borderColor: theme.success + '30' }]}>
                    <Text style={[styles.avatarText, { color: theme.success }]}>
                        {item.first_name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardMainInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.first_name} {item.last_name}
                    </Text>
                    <View style={styles.cardInfoSubrows}>
                        <View style={styles.locationRow}>
                            <ShieldCheck size={13} color={theme.success} />
                            <Text style={[styles.cardSubtitle, { color: theme.success, fontWeight: '700' }]}>
                                {item.specialty || "Médico Veterinario"}
                            </Text>
                        </View>
                        <View style={styles.ratingRowInline}>
                            <Star size={13} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingTextInline, { color: theme.text }]}>
                                {item.average_rating ? item.average_rating.toFixed(1) : '5.0'}
                            </Text>
                            <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>
                                ({item.total_reviews || 0})
                            </Text>
                        </View>
                    </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>

            {item.bio && (
                <Text style={[styles.description, { color: theme.textMuted, marginTop: 12 }]} numberOfLines={2}>
                    {item.bio}
                </Text>
            )}

            <View style={[styles.certificationBox, { backgroundColor: theme.successLight, borderColor: theme.success + '20' }]}>
                <ShieldCheck size={14} color={theme.success} />
                <Text style={[styles.certificationText, { color: theme.success }]}>
                    Cédula: {item.license_number ? "Verificada" : "En Validación"}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const listHeaderComponent = (
        <>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <BackButton onPress={() => router.back()} />
                    <Text style={[styles.title, { color: isDark ? '#fff' : '#0c4a6e' }]}>Directorio Médico</Text>
                </View>
                <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#0369a1' }]}>
                    Encuentra salud de calidad para tu mejor amigo
                </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, {
                        backgroundColor: activeTab === 'clinics' ? theme.primary : theme.surface,
                        borderColor: activeTab === 'clinics' ? theme.primary : theme.border,
                    }]}
                    onPress={() => setActiveTab('clinics')}
                >
                    <Hospital size={18} color={activeTab === 'clinics' ? '#fff' : theme.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'clinics' ? '#fff' : theme.text }]}>
                        Clínicas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, {
                        backgroundColor: activeTab === 'vets' ? theme.primary : theme.surface,
                        borderColor: activeTab === 'vets' ? theme.primary : theme.border,
                    }]}
                    onPress={() => setActiveTab('vets')}
                >
                    <Stethoscope size={18} color={activeTab === 'vets' ? '#fff' : theme.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'vets' ? '#fff' : theme.text }]}>
                        Especialistas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={18} color={theme.textMuted} />
                <TextInput
                    placeholder={activeTab === 'clinics' ? "Buscar clínica o ciudad..." : "Buscar veterinario..."}
                    placeholderTextColor={theme.textMuted}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filters (clinics only) */}
            {activeTab === 'clinics' && (
                <View style={styles.filterRow}>
                    {[
                        { key: 'all', label: 'Todas' },
                        { key: '24h', label: '24 Horas' },
                        { key: 'emergencia', label: 'Urgencias' },
                    ].map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterChip, {
                                backgroundColor: filterService === f.key ? theme.primary : theme.surface,
                                borderColor: filterService === f.key ? theme.primary : theme.border,
                            }]}
                            onPress={() => setFilterService(f.key)}
                        >
                            <Text style={[styles.filterText, {
                                color: filterService === f.key ? '#fff' : theme.text,
                            }]}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Mi Clínica Banner */}
            {isMounted && canRegister && (
                <TouchableOpacity
                    style={[styles.miClinicaBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primary + '30' }]}
                    onPress={() => router.push('/mi-clinica' as any)}
                >
                    <View style={styles.miClinicaContent}>
                        <View style={[styles.miClinicaIcon, { backgroundColor: theme.primary + '20' }]}>
                            <Building size={22} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.miClinicaTitle, { color: theme.primary }]}>Mi Clínica</Text>
                            <Text style={[styles.miClinicaSubtitle, { color: theme.textMuted }]}>Gestiona tu información</Text>
                        </View>
                        <ChevronRight size={20} color={theme.primary} />
                    </View>
                </TouchableOpacity>
            )}

            {/* Register button */}
            {isMounted && canRegister && activeTab === 'clinics' && (
                <TouchableOpacity
                    style={[styles.registerButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/directorio/nuevo' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={styles.registerButtonText}>Registrar mi Clínica</Text>
                </TouchableOpacity>
            )}

            {/* Loading */}
            {isLoading && (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
            )}

            {/* Results count */}
            {!loadingClinics && !loadingVets && (
                <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
                    {resultsCount} resultados
                </Text>
            )}
        </>
    );

    const listEmptyComponent = !loadingClinics && !loadingVets ? (
        <View style={styles.emptyState}>
            <Search size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin resultados</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No encontramos lo que buscas. Intenta con otros términos.
            </Text>
        </View>
    ) : null;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark ? ['#0ea5e9', '#081a2e'] : ['#bae6fd', '#f0f9ff']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.4 }}
            />

            {activeTab === 'clinics' ? (
                <DataList<Clinic>
                    data={filteredClinics}
                    keyExtractor={(item) => item.id}
                    renderItem={renderClinicItem}
                    contentStyle={styles.list}
                    header={listHeaderComponent}
                    isLoading={isLoading}
                    emptyTitle="Sin resultados"
                    emptySubtitle="No encontramos lo que buscas. Intenta con otros términos."
                />
            ) : (
                <DataList<Vet>
                    data={filteredVets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVetItem}
                    contentStyle={styles.list}
                    header={listHeaderComponent}
                    isLoading={isLoading}
                    emptyTitle="Sin resultados"
                    emptySubtitle="No encontramos lo que buscas. Intenta con otros términos."
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginTop: 4, fontWeight: '500' },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 10,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
        borderWidth: 1.5,
    },
    tabText: { fontSize: 14, fontWeight: '800' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 12,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 12,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    filterText: { fontSize: 13, fontWeight: '700' },
    miClinicaBanner: {
        marginHorizontal: 24,
        marginBottom: 12,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
    },
    miClinicaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    miClinicaIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miClinicaTitle: { fontSize: 15, fontWeight: '800' },
    miClinicaSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 24,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 14,
    },
    registerButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    resultsCount: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    list: { paddingHorizontal: 24, paddingBottom: 100 },
    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    avatarText: { fontSize: 22, fontWeight: '800' },
    cardMainInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '800' },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    cardSubtitle: { fontSize: 13, fontWeight: '500' },
    cardBody: { marginTop: 14 },
    tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: { fontSize: 11, fontWeight: '700' },
    description: { fontSize: 13, lineHeight: 18, marginTop: 10 },
    cardFooter: {
        flexDirection: 'row',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
    },
    actionBtnText: { fontSize: 13, fontWeight: '700' },
    certificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 12,
    },
    certificationText: { fontSize: 12, fontWeight: '700' },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 6 },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    cardInfoSubrows: {
        marginTop: 4,
        gap: 4,
    },
    ratingRowInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingTextInline: {
        fontSize: 12,
        fontWeight: '700',
    },
    ratingCountInline: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardServicesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 8,
        borderRadius: 10,
    },
    servicesLabel: {
        fontSize: 12,
        fontWeight: '800',
    },
    servicesListText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
});
