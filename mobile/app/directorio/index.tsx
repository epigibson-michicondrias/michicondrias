import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Linking, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicsAndVets } from '@/src/hooks/directorio/useClinicsAndVets';
import type { Clinic, Vet } from '@/src/types/directorio';
import { Search, MapPin, Phone, ChevronRight, Stethoscope, Hospital, ShieldCheck, Plus, Building, Clock, Navigation, Star } from 'lucide-react-native';
import DataList from '@/src/components/data/DataList';
import FilterChip from '@/src/components/FilterChip';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { showAlert } from '@/src/components/AppAlert';
import { font, spacing, layout } from '@/constants/design';

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
        filterSpecialty,
        setFilterSpecialty,
        filterCity,
        setFilterCity,
        specialties,
        cities,
        hasActiveFilters,
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
                                {[item.city, item.state].filter(Boolean).join(', ') || 'Ubicación no indicada'}
                            </Text>
                        </View>
                        <View style={styles.ratingRowInline}>
                            {item.total_reviews ? (
                                <>
                                    <Star size={13} color={theme.warning} fill={theme.warning} />
                                    <Text style={[styles.ratingTextInline, { color: theme.text }]}>
                                        {Number(item.average_rating || 0).toFixed(1)}
                                    </Text>
                                    <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>
                                        ({item.total_reviews})
                                    </Text>
                                </>
                            ) : (
                                <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>Sin reseñas</Text>
                            )}
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
                {!!item.description && (
                    <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                {!!item.phone && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Llamar a ${item.name}`}
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
                    <Text style={[styles.actionBtnText, { color: theme.onPrimary }]}>Ver Perfil</Text>
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
                            {item.total_reviews ? (
                                <>
                                    <Star size={13} color={theme.warning} fill={theme.warning} />
                                    <Text style={[styles.ratingTextInline, { color: theme.text }]}>
                                        {Number(item.average_rating || 0).toFixed(1)}
                                    </Text>
                                    <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>
                                        ({item.total_reviews})
                                    </Text>
                                </>
                            ) : (
                                <Text style={[styles.ratingCountInline, { color: theme.textMuted }]}>Sin reseñas</Text>
                            )}
                        </View>
                    </View>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>

            {!!item.bio && (
                <Text style={[styles.description, { color: theme.textMuted, marginTop: spacing.md }]} numberOfLines={2}>
                    {item.bio}
                </Text>
            )}

            <View style={[styles.certificationBox, { backgroundColor: theme.successLight, borderColor: theme.success + '20' }]}>
                <ShieldCheck size={14} color={theme.success} />
                <Text style={[styles.certificationText, { color: theme.success }]}>
                    {item.license_number ? 'Cédula registrada' : 'Cédula sin registrar'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const listHeaderComponent = (
        <>
            {/* Header */}

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

            {/* Filters — Doctoralia style: scrollable chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
                {activeTab === 'clinics' ? (
                    <>
                        {[
                            { key: 'all', label: 'Todas' },
                            { key: '24h', label: '24 Horas' },
                            { key: 'emergencia', label: 'Urgencias' },
                        ].map(f => (
                            <FilterChip
                                key={f.key}
                                label={f.label}
                                active={filterService === f.key}
                                onPress={() => setFilterService(f.key)}
                            />
                        ))}
                        {cities.length > 1 && (
                            <FilterChip
                                label={filterCity === 'all' ? 'Ciudad' : filterCity}
                                active={filterCity !== 'all'}
                                icon={<MapPin size={layout.icon.sm} color={filterCity !== 'all' ? theme.onPrimary : theme.textMuted} />}
                                onPress={() => {
                                    const idx = cities.indexOf(filterCity);
                                    setFilterCity(cities[(idx + 1) % cities.length]);
                                }}
                            />
                        )}
                    </>
                ) : (
                    specialties.map(s => (
                        <FilterChip
                            key={s}
                            label={s === 'all' ? 'Todas las especialidades' : s}
                            active={filterSpecialty === s}
                            onPress={() => setFilterSpecialty(s)}
                        />
                    ))
                )}
            </ScrollView>

            {/* Result count */}
            <Text style={[styles.resultCount, { color: theme.textMuted }]}>
                {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
                {hasActiveFilters ? ' · filtros activos' : ''}
            </Text>

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
                    <Plus size={18} color={theme.onPrimary} />
                    <Text style={styles.registerButtonText}>Registrar mi Clínica</Text>
                </TouchableOpacity>
            )}
        </>
    );

    const emptyTitle = hasActiveFilters ? 'Sin resultados' : (activeTab === 'clinics' ? 'Aún no hay clínicas registradas' : 'Aún no hay especialistas registrados');
    const emptySubtitle = hasActiveFilters ? 'No encontramos lo que buscas. Intenta con otros términos.' : 'Cuando se registren aparecerán aquí.';

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Directorio médico" subtitle="Encuentra salud de calidad para tu mejor amigo" />

            {activeTab === 'clinics' ? (
                <DataList<Clinic>
                    data={filteredClinics}
                    keyExtractor={(item) => item.id}
                    renderItem={renderClinicItem}
                    contentStyle={styles.list}
                    header={listHeaderComponent}
                    isLoading={isLoading}
                    emptyTitle={emptyTitle}
                    emptySubtitle={emptySubtitle}
                />
            ) : (
                <DataList<Vet>
                    data={filteredVets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVetItem}
                    contentStyle={styles.list}
                    header={listHeaderComponent}
                    isLoading={isLoading}
                    emptyTitle={emptyTitle}
                    emptySubtitle={emptySubtitle}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    filterScroll: { flexGrow: 0, marginBottom: spacing.sm },
    resultCount: { fontSize: font.md, fontWeight: '600', marginBottom: spacing.sm },
    container: { flex: 1 },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 14,
        gap: spacing.sm,
        borderWidth: 1.5,
    },
    tabText: { fontSize: font.base, fontWeight: '800' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        height: 50,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: spacing.md,
    },
    searchInput: { flex: 1, fontSize: font.lg, fontWeight: '500' },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    miClinicaBanner: {
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 18,
        borderWidth: 1,
    },
    miClinicaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    miClinicaIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miClinicaTitle: { fontSize: font.lg, fontWeight: '800' },
    miClinicaSubtitle: { fontSize: font.md, fontWeight: '500', marginTop: spacing.xxs },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginHorizontal: layout.screenPadding,
        marginBottom: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: 14,
    },
    registerButtonText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
    list: { paddingHorizontal: layout.screenPadding, paddingBottom: 100 },
    card: {
        borderRadius: 20,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    avatarText: { fontSize: font.h2, fontWeight: '800' },
    cardMainInfo: { flex: 1 },
    cardTitle: { fontSize: font.xl, fontWeight: '800' },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    cardSubtitle: { fontSize: font.base, fontWeight: '500' },
    cardBody: { marginTop: spacing.lg },
    tagsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        justifyContent: 'center',
    },
    tagText: { fontSize: font.sm, fontWeight: '700' },
    description: { fontSize: font.base, lineHeight: 18, marginTop: spacing.md },
    cardFooter: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
        borderWidth: 1,
    },
    actionBtnText: { fontSize: font.base, fontWeight: '700' },
    certificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: spacing.md,
    },
    certificationText: { fontSize: font.md, fontWeight: '700' },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: spacing.huge,
    },
    emptyTitle: { fontSize: font.xxl, fontWeight: '800', marginTop: spacing.lg, marginBottom: spacing.sm },
    emptyText: { fontSize: font.base, textAlign: 'center', lineHeight: 20 },
    cardInfoSubrows: {
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    ratingRowInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ratingTextInline: {
        fontSize: font.md,
        fontWeight: '700',
    },
    ratingCountInline: {
        fontSize: font.sm,
        fontWeight: '600',
    },
    cardServicesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        backgroundColor: 'rgba(128,128,128,0.08)',
        padding: spacing.sm,
        borderRadius: 10,
    },
    servicesLabel: {
        fontSize: font.md,
        fontWeight: '800',
    },
    servicesListText: {
        fontSize: font.md,
        fontWeight: '600',
        flex: 1,
    },
});
