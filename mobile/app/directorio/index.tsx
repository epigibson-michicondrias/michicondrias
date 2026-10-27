import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicsAndVets } from '@/src/hooks/directorio/useClinicsAndVets';
import type { Clinic, Vet } from '@/src/types/directorio';
import {
    MapPin,
    ChevronRight,
    Stethoscope,
    Hospital,
    ShieldCheck,
    Clock,
    Navigation,
    Star,
    SlidersHorizontal,
    RotateCcw,
    Sparkles,
    Check,
    X,
} from 'lucide-react-native';
import DataList from '@/src/components/data/DataList';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SegmentedControl from '@/src/components/SegmentedControl';
import SearchBar from '@/src/components/SearchBar';
import BottomSheet from '@/src/components/BottomSheet';
import Button from '@/src/components/Button';
import { families, font, layout, spacing, radius, type, shadow, press } from '@/constants/design';

export default function DirectorioIndexScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [showFilterSheet, setShowFilterSheet] = useState(false);

    const {
        clinics,
        vets,
        filteredClinics,
        filteredVets,
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
        clearFilters,
        resultsCount,
    } = useClinicsAndVets();

    const activeFilterCount =
        (filterService !== 'all' ? 1 : 0) +
        (filterCity !== 'all' ? 1 : 0) +
        (filterSpecialty !== 'all' ? 1 : 0);

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <TouchableOpacity
            style={[styles.card, shadow.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
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
        </TouchableOpacity>
    );

    const renderVetItem = ({ item }: { item: Vet }) => (
        <TouchableOpacity
            style={[styles.card, shadow.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
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
                            <Stethoscope size={13} color={theme.primary} />
                            <Text style={[styles.cardSubtitle, { color: theme.primary, fontFamily: families.bold }]}>
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

            {item.license_number ? (
                <View style={[styles.certificationBox, { backgroundColor: theme.successLight, borderColor: theme.success + '20' }]}>
                    <ShieldCheck size={14} color={theme.success} />
                    <Text style={[styles.certificationText, { color: theme.success }]}>Cédula registrada</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );

    const listHeaderComponent = (
        <View style={styles.headerWrapper}>
            {/* Pestañas: Clínicas / Especialistas en diseño segmentado elegante */}
            <View style={styles.tabsSection}>
                <SegmentedControl
                    value={activeTab}
                    onChange={(val) => {
                        setActiveTab(val);
                    }}
                    options={[
                        { value: 'clinics', label: 'Clínicas', icon: Hospital },
                        { value: 'vets', label: 'Especialistas', icon: Stethoscope },
                    ]}
                    accessibilityLabel="Tipo de directorio"
                />
            </View>

            {/* Fila compacta de Búsqueda + Botón de Filtros */}
            <View style={styles.searchRow}>
                <View style={styles.searchFlex}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={
                            activeTab === 'clinics'
                                ? 'Buscar clínica o ciudad...'
                                : 'Buscar por nombre o especialidad...'
                        }
                    />
                </View>

                {/* Botón de Filtros con contador */}
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        shadow.card,
                        {
                            backgroundColor: activeFilterCount > 0 ? theme.primaryLight : theme.surface,
                            borderColor: activeFilterCount > 0 ? theme.primary : theme.borderLight,
                        },
                    ]}
                    onPress={() => setShowFilterSheet(true)}
                    activeOpacity={press.subtle}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir filtros"
                >
                    <SlidersHorizontal
                        size={18}
                        color={activeFilterCount > 0 ? theme.primary : theme.text}
                    />
                    {activeFilterCount > 0 && (
                        <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
                            <Text style={[styles.filterBadgeText, { color: theme.onPrimary }]}>
                                {activeFilterCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Fila única y ligera de chips de acceso rápido (sin estorbar la pantalla) */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickChipsScroll}
            >
                {activeTab === 'clinics' ? (
                    <>
                        <TouchableOpacity
                            onPress={() => setFilterService(filterService === '24h' ? 'all' : '24h')}
                            activeOpacity={press.subtle}
                            style={[
                                styles.quickChip,
                                filterService === '24h'
                                    ? { backgroundColor: theme.infoLight, borderColor: theme.info }
                                    : { backgroundColor: theme.surface, borderColor: theme.borderLight },
                            ]}
                        >
                            <Clock
                                size={13}
                                color={filterService === '24h' ? theme.info : theme.textMuted}
                            />
                            <Text
                                style={[
                                    type.caption,
                                    {
                                        color: filterService === '24h' ? theme.info : theme.text,
                                        fontFamily: filterService === '24h' ? families.semibold : families.medium,
                                    },
                                ]}
                            >
                                24 Horas
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                setFilterService(filterService === 'emergencia' ? 'all' : 'emergencia')
                            }
                            activeOpacity={press.subtle}
                            style={[
                                styles.quickChip,
                                filterService === 'emergencia'
                                    ? { backgroundColor: theme.errorLight, borderColor: theme.error }
                                    : { backgroundColor: theme.surface, borderColor: theme.borderLight },
                            ]}
                        >
                            <Navigation
                                size={13}
                                color={filterService === 'emergencia' ? theme.error : theme.textMuted}
                            />
                            <Text
                                style={[
                                    type.caption,
                                    {
                                        color: filterService === 'emergencia' ? theme.error : theme.text,
                                        fontFamily:
                                            filterService === 'emergencia' ? families.semibold : families.medium,
                                    },
                                ]}
                            >
                                Urgencias
                            </Text>
                        </TouchableOpacity>

                        {cities.length > 1 && (
                            <TouchableOpacity
                                onPress={() => setShowFilterSheet(true)}
                                activeOpacity={press.subtle}
                                style={[
                                    styles.quickChip,
                                    filterCity !== 'all'
                                        ? { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                                        : { backgroundColor: theme.surface, borderColor: theme.borderLight },
                                ]}
                            >
                                <MapPin
                                    size={13}
                                    color={filterCity !== 'all' ? theme.primary : theme.textMuted}
                                />
                                <Text
                                    style={[
                                        type.caption,
                                        {
                                            color: filterCity !== 'all' ? theme.primary : theme.text,
                                            fontFamily: filterCity !== 'all' ? families.semibold : families.medium,
                                        },
                                    ]}
                                >
                                    {filterCity === 'all' ? 'Ciudad' : filterCity}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    specialties.slice(0, 5).map((s) => {
                        const active = filterSpecialty === s;
                        const label = s === 'all' ? 'Todas' : s;
                        return (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setFilterSpecialty(s)}
                                activeOpacity={press.subtle}
                                style={[
                                    styles.quickChip,
                                    active
                                        ? { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                                        : { backgroundColor: theme.surface, borderColor: theme.borderLight },
                                ]}
                            >
                                <Sparkles
                                    size={12}
                                    color={active ? theme.primary : theme.textMuted}
                                />
                                <Text
                                    style={[
                                        type.caption,
                                        {
                                            color: active ? theme.primary : theme.text,
                                            fontFamily: active ? families.semibold : families.medium,
                                        },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}

                {hasActiveFilters && (
                    <TouchableOpacity
                        onPress={clearFilters}
                        activeOpacity={press.subtle}
                        style={[styles.quickChip, styles.clearChip, { borderColor: theme.error + '40' }]}
                    >
                        <RotateCcw size={12} color={theme.error} />
                        <Text style={[type.caption, { color: theme.error, fontFamily: families.semibold }]}>
                            Limpiar
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Contador sutil que no roba protagonismo */}
            <View style={styles.resultsBar}>
                <Text style={[type.caption, { color: theme.textMuted }]}>
                    {resultsCount} {resultsCount === 1 ? (activeTab === 'clinics' ? 'clínica' : 'especialista') : (activeTab === 'clinics' ? 'clínicas' : 'especialistas')} disponible{resultsCount !== 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    );

    const emptyTitle = hasActiveFilters
        ? 'Sin resultados'
        : activeTab === 'clinics'
          ? 'Aún no hay clínicas registradas'
          : 'Aún no hay especialistas registrados';
    const emptySubtitle = hasActiveFilters
        ? 'No encontramos coincidencias con los filtros seleccionados.'
        : 'Cuando se registren aparecerán aquí.';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Directorio médico"
                subtitle="Encuentra salud de calidad para tu mejor amigo"
            />

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

            {/* Hoja modal inferior premium de filtros completos */}
            <BottomSheet
                visible={showFilterSheet}
                onClose={() => setShowFilterSheet(false)}
                title={`Filtros de ${activeTab === 'clinics' ? 'Clínicas' : 'Especialistas'}`}
                subtitle="Ajusta tus preferencias de búsqueda"
                footer={
                    <View style={styles.sheetFooter}>
                        <Button
                            label="Restablecer"
                            variant="ghost"
                            icon={<RotateCcw size={14} color={theme.text} />}
                            onPress={clearFilters}
                            disabled={!hasActiveFilters}
                            style={styles.sheetFooterBtn}
                        />
                        <Button
                            label={`Ver ${resultsCount} ${resultsCount === 1 ? (activeTab === 'clinics' ? 'clínica' : 'especialista') : (activeTab === 'clinics' ? 'clínicas' : 'especialistas')}`}
                            icon={<Check size={16} color={theme.onPrimary} />}
                            onPress={() => setShowFilterSheet(false)}
                            style={styles.sheetFooterBtn}
                        />
                    </View>
                }
            >
                <View style={styles.sheetContent}>
                    {activeTab === 'clinics' ? (
                        <>
                            {/* Filtro: Servicios */}
                            <View style={styles.sheetSection}>
                                <View style={styles.sectionHeaderWrap}>
                                    <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
                                        <Clock size={16} color={theme.primary} />
                                    </View>
                                    <View style={styles.flex}>
                                        <Text style={[type.title, { color: theme.text }]}>Horario y urgencias</Text>
                                        <Text style={[type.caption, { color: theme.textMuted }]}>
                                            Filtra clínicas con guardia 24h o atención de emergencias
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.sheetOptionsList}>
                                    {[
                                        {
                                            key: 'all',
                                            label: 'Todas las clínicas',
                                            subtitle: 'Ver el catálogo completo sin restricciones de horario',
                                            icon: Hospital,
                                        },
                                        {
                                            key: '24h',
                                            label: 'Abierto 24 Horas',
                                            subtitle: 'Atención médica veterinaria continua día y noche',
                                            icon: Clock,
                                        },
                                        {
                                            key: 'emergencia',
                                            label: 'Atención de Urgencias',
                                            subtitle: 'Equipadas para estabilización crítica, quirófano y urgencias',
                                            icon: Navigation,
                                        },
                                    ].map((opt) => {
                                        const selected = filterService === opt.key;
                                        const Icon = opt.icon;
                                        return (
                                            <TouchableOpacity
                                                key={opt.key}
                                                style={[
                                                    styles.optionCard,
                                                    selected
                                                        ? {
                                                              backgroundColor: theme.primaryLight,
                                                              borderColor: theme.primary,
                                                          }
                                                        : {
                                                              backgroundColor: theme.backgroundSecondary,
                                                              borderColor: theme.borderLight,
                                                          },
                                                ]}
                                                onPress={() => setFilterService(opt.key)}
                                                activeOpacity={press.subtle}
                                            >
                                                <View
                                                    style={[
                                                        styles.radioCircle,
                                                        selected
                                                            ? { borderColor: theme.primary, backgroundColor: theme.primary }
                                                            : { borderColor: theme.borderLight, backgroundColor: 'transparent' },
                                                    ]}
                                                >
                                                    {selected && (
                                                        <View
                                                            style={[
                                                                styles.radioDot,
                                                                { backgroundColor: theme.onPrimary },
                                                            ]}
                                                        />
                                                    )}
                                                </View>

                                                <View
                                                    style={[
                                                        styles.optionIconBox,
                                                        { backgroundColor: theme.surface },
                                                    ]}
                                                >
                                                    <Icon
                                                        size={18}
                                                        color={selected ? theme.primary : theme.textMuted}
                                                    />
                                                </View>

                                                <View style={styles.optionTextContainer}>
                                                    <Text
                                                        style={[
                                                            type.bodyStrong,
                                                            { color: selected ? theme.primary : theme.text },
                                                        ]}
                                                    >
                                                        {opt.label}
                                                    </Text>
                                                    <Text style={[type.caption, { color: theme.textMuted }]}>
                                                        {opt.subtitle}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Filtro: Ciudades */}
                            {cities.length > 1 && (
                                <View style={styles.sheetSection}>
                                    <View style={styles.sectionHeaderWrap}>
                                        <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
                                            <MapPin size={16} color={theme.primary} />
                                        </View>
                                        <View style={styles.flex}>
                                            <Text style={[type.title, { color: theme.text }]}>Ciudad o zona</Text>
                                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                                Filtra clínicas en tu área geográfica
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.sheetOptionsList}>
                                        {cities.map((city) => {
                                            const selected = filterCity === city;
                                            const label = city === 'all' ? 'Todas las ciudades' : city;
                                            return (
                                                <TouchableOpacity
                                                    key={city}
                                                    style={[
                                                        styles.optionCard,
                                                        selected
                                                            ? {
                                                                  backgroundColor: theme.primaryLight,
                                                                  borderColor: theme.primary,
                                                              }
                                                            : {
                                                                  backgroundColor: theme.backgroundSecondary,
                                                                  borderColor: theme.borderLight,
                                                              },
                                                    ]}
                                                    onPress={() => setFilterCity(city)}
                                                    activeOpacity={press.subtle}
                                                >
                                                    <View
                                                        style={[
                                                            styles.radioCircle,
                                                            selected
                                                                ? { borderColor: theme.primary, backgroundColor: theme.primary }
                                                                : { borderColor: theme.borderLight, backgroundColor: 'transparent' },
                                                        ]}
                                                    >
                                                        {selected && (
                                                            <View
                                                                style={[
                                                                    styles.radioDot,
                                                                    { backgroundColor: theme.onPrimary },
                                                                ]}
                                                            />
                                                        )}
                                                    </View>

                                                    <View
                                                        style={[
                                                            styles.optionIconBox,
                                                            { backgroundColor: theme.surface },
                                                        ]}
                                                    >
                                                        <MapPin
                                                            size={18}
                                                            color={selected ? theme.primary : theme.textMuted}
                                                        />
                                                    </View>

                                                    <View style={styles.optionTextContainer}>
                                                        <Text
                                                            style={[
                                                                type.bodyStrong,
                                                                { color: selected ? theme.primary : theme.text },
                                                            ]}
                                                        >
                                                            {label}
                                                        </Text>
                                                        <Text style={[type.caption, { color: theme.textMuted }]}>
                                                            {city === 'all'
                                                                ? 'Ver clínicas de cualquier ubicación'
                                                                : `Ubicadas en ${city}`}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        /* Filtro: Especialidades */
                        <View style={styles.sheetSection}>
                            <View style={styles.sectionHeaderWrap}>
                                <View style={[styles.sectionBadge, { backgroundColor: theme.primaryLight }]}>
                                    <Stethoscope size={16} color={theme.primary} />
                                </View>
                                <View style={styles.flex}>
                                    <Text style={[type.title, { color: theme.text }]}>Especialidad médica</Text>
                                    <Text style={[type.caption, { color: theme.textMuted }]}>
                                        Encuentra profesionales certificados según el área médica
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.sheetOptionsList}>
                                {specialties.map((s) => {
                                    const selected = filterSpecialty === s;
                                    const label = s === 'all' ? 'Todas las especialidades' : s;
                                    return (
                                        <TouchableOpacity
                                            key={s}
                                            style={[
                                                styles.optionCard,
                                                selected
                                                    ? {
                                                          backgroundColor: theme.primaryLight,
                                                          borderColor: theme.primary,
                                                      }
                                                    : {
                                                          backgroundColor: theme.backgroundSecondary,
                                                          borderColor: theme.borderLight,
                                                      },
                                            ]}
                                            onPress={() => setFilterSpecialty(s)}
                                            activeOpacity={press.subtle}
                                        >
                                            <View
                                                style={[
                                                    styles.radioCircle,
                                                    selected
                                                        ? { borderColor: theme.primary, backgroundColor: theme.primary }
                                                        : { borderColor: theme.borderLight, backgroundColor: 'transparent' },
                                                ]}
                                            >
                                                {selected && (
                                                    <View
                                                        style={[
                                                            styles.radioDot,
                                                            { backgroundColor: theme.onPrimary },
                                                        ]}
                                                    />
                                                )}
                                            </View>

                                            <View
                                                style={[
                                                    styles.optionIconBox,
                                                    { backgroundColor: theme.surface },
                                                ]}
                                            >
                                                <Stethoscope
                                                    size={18}
                                                    color={selected ? theme.primary : theme.textMuted}
                                                />
                                            </View>

                                            <View style={styles.optionTextContainer}>
                                                <Text
                                                    style={[
                                                        type.bodyStrong,
                                                        { color: selected ? theme.primary : theme.text },
                                                    ]}
                                                >
                                                    {label}
                                                </Text>
                                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                                    {s === 'all'
                                                        ? 'Cualquier especialidad o medicina general'
                                                        : `Especialista en ${s}`}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    headerWrapper: {
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    tabsSection: {
        marginBottom: spacing.xs,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    searchFlex: {
        flex: 1,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        fontSize: 10,
        fontFamily: families.bold,
    },
    quickChipsScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.xs,
    },
    quickChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 1,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    clearChip: {
        backgroundColor: 'transparent',
    },
    resultsBar: {
        paddingTop: spacing.xs,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: layout.listClearance,
    },
    card: {
        borderRadius: radius.xl,
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
    avatarText: { fontSize: font.h2, fontFamily: families.extrabold },
    cardMainInfo: { flex: 1 },
    cardTitle: { fontSize: font.xl, fontFamily: families.extrabold },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    cardSubtitle: { fontSize: font.base, fontFamily: families.medium },
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
    tagText: { fontSize: font.sm, fontFamily: families.bold },
    description: { fontSize: font.base, lineHeight: 18, marginTop: spacing.md },
    certificationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: spacing.md,
    },
    certificationText: { fontSize: font.md, fontFamily: families.bold },
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
        fontFamily: families.bold,
    },
    ratingCountInline: {
        fontSize: font.sm,
        fontFamily: families.semibold,
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
        fontFamily: families.extrabold,
    },
    servicesListText: {
        fontSize: font.md,
        fontFamily: families.semibold,
        flex: 1,
    },
    sheetContent: {
        gap: spacing.xl,
        paddingVertical: spacing.xs,
    },
    sheetSection: {
        gap: spacing.md,
    },
    sectionHeaderWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xs,
    },
    sectionBadge: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetOptionsList: {
        gap: spacing.sm,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        gap: spacing.md,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: radius.pill,
    },
    optionIconBox: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextContainer: {
        flex: 1,
        gap: 2,
    },
    sheetFooter: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
    },
    sheetFooterBtn: {
        flex: 1,
    },
});