import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useListingDetail } from '@/src/hooks/adopciones';
import { formatAge, formatWeight } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { Share2, Heart, Bone, Info, PawPrint, Calendar, Ruler, Scale, MapPin } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { shareContent } from '@/src/utils/share';

const { width, height } = Dimensions.get('window');

const STATUS_LABELS: Record<string, string> = { abierto: 'En adopción', en_proceso: 'En proceso', adoptado: 'Adoptado' };

export default function AdopcionDetalleScreen() {
    const { theme } = useTheme();
    const { listing, isLoading, error, refetch, goBack, goToSolicitar, goToMyRequests, myRequest, isOwner } = useListingDetail();

    if (!isLoading && (error || !listing)) {
        return (
            <ScreenContainer style={styles.center}>
                <Text style={{ color: theme.text, fontWeight: '700', marginBottom: 6 }}>No pudimos cargar la mascota</Text>
                <Text style={{ color: theme.textMuted, marginBottom: 16, textAlign: 'center' }}>Puede que ya no esté disponible o que no tengas conexión.</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={goBack} accessibilityRole="button" style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
                        <Text style={{ color: theme.text, fontWeight: '700' }}>Volver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" style={{ backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    if (isLoading || !listing) {
        return (
            <ScreenContainer style={styles.center}>
                <LoadingOverlay message="Cargando..." />
            </ScreenContainer>
        );
    }

    const getSpeciesColor = (species: string) => {
        switch (species.toLowerCase()) {
            case 'perro': return theme.warning;
            case 'gato': return theme.accent;
            case 'ave': return theme.info;
            default: return theme.success;
        }
    };

    const speciesColor = getSpeciesColor(listing.species);

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
                {/* Hero Section */}
                <View style={[styles.visualHeader, { backgroundColor: speciesColor + '15' }]}>
                    <View style={styles.headerNav}>
                        <BackButton
                            onPress={goBack}
                            color="#fff"
                            style={styles.glassBtn}
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Compartir" style={styles.glassBtn} onPress={() => shareContent('Adopción', `Conoce a ${listing.name}, está en adopción en Michicondrias 🐾`)}>
                                <Share2 size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {listing.photo_url ? (
                        <Image source={{ uri: listing.photo_url }} style={styles.heroImage} />
                    ) : (
                        <View style={styles.placeholderHero}>
                            <PawPrint size={72} color={speciesColor} strokeWidth={1.5} />
                        </View>
                    )}
                    <View style={styles.heroOverlay} />

                    <View style={styles.heroTags}>
                        <View style={[styles.statusBadge, { borderColor: speciesColor + '40', backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                            <Text style={[styles.statusText, { color: speciesColor }]}>{(STATUS_LABELS[listing.status?.toLowerCase()] || listing.status || '').toUpperCase()}</Text>
                        </View>
                        {listing.is_emergency && (
                            <View style={styles.emergencyBadge}>
                                <Text style={styles.emergencyBadgeText}>URGENTE</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Body Content */}
                <View style={styles.body}>
                    <View style={styles.titleSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name, { color: theme.text }]}>{listing.name}</Text>
                            <Text style={[styles.breed, { color: speciesColor }]}>
                                {[listing.breed || 'Mestizo', listing.gender].filter(Boolean).join(' • ')}
                            </Text>
                        </View>
                        <View style={[styles.speciesIconContainer, { backgroundColor: speciesColor + '20' }]}>
                            <PawPrint size={24} color={speciesColor} />
                        </View>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.quickStats}>
                        <StatCard label="Edad" value={formatAge(listing.age_months)} icon={<Calendar size={18} color={theme.primary} />} theme={theme} />
                        <StatCard label="Tamaño" value={listing.size || 'No indicado'} icon={<Ruler size={18} color={theme.primary} />} theme={theme} />
                        <StatCard label="Peso" value={formatWeight(listing.weight_kg)} icon={<Scale size={18} color={theme.primary} />} theme={theme} />
                        <StatCard label="Ubicación" value={listing.location || 'No indicada'} icon={<MapPin size={18} color={theme.primary} />} theme={theme} />
                    </View>

                    {/* Description */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Su Historia</Text>
                    <View style={[styles.descriptionContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.description, { color: theme.text }]}>
                            {listing.description?.trim() || 'Aún no hay una historia escrita para esta mascota.'}
                        </Text>
                    </View>

                    {/* Health & Socialization */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Bone size={20} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Salud y Socialización</Text>
                        </View>
                        <View style={styles.featureGrid}>
                            <FeatureItem label="Vacunas" ok={listing.is_vaccinated} theme={theme} />
                            <FeatureItem label="Desparasitado" ok={listing.is_dewormed} theme={theme} />
                            <FeatureItem label="Esterilizado" ok={listing.is_sterilized} theme={theme} />
                            <FeatureItem label="Compañeros Perros" ok={listing.social_dogs} theme={theme} />
                            <FeatureItem label="Apto para Gatos" ok={listing.social_cats} theme={theme} />
                            <FeatureItem label="Apto para Niños" ok={listing.social_children} theme={theme} />
                        </View>
                    </View>

                    {/* Temperament Traits */}
                    {listing.temperament && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Info size={20} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Rasgos</Text>
                            </View>
                            <View style={styles.traitsContainer}>
                                {listing.temperament.split(',').map((trait, i) => (
                                    <View key={i} style={[styles.traitTag, { backgroundColor: theme.primary + '15' }]}>
                                        <Text style={[styles.traitText, { color: theme.primary }]}>{trait.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Footer CTA */}
            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                {isOwner ? (
                    <Text style={{ color: theme.textMuted, textAlign: 'center', fontWeight: '600' }}>Esta es tu publicación. Gestiona las solicitudes desde "Solicitudes recibidas".</Text>
                ) : listing.status?.toLowerCase() !== 'abierto' ? (
                    <Text style={{ color: theme.textMuted, textAlign: 'center', fontWeight: '600' }}>Esta mascota ya no está disponible para adopción.</Text>
                ) : myRequest ? (
                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.primary }]} onPress={goToMyRequests} accessibilityRole="button">
                        <Text style={[styles.applyBtnText, { color: theme.primary }]}>Ya postulaste: ver mi solicitud</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.primary }]} onPress={goToSolicitar} accessibilityRole="button">
                        <Heart size={20} color="#fff" />
                        <Text style={styles.applyBtnText}>¡Quiero Adoptar!</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScreenContainer>
    );
}

function StatCard({ label, value, icon, theme }: { label: string; value: string; icon: React.ReactNode; theme: any }) {
    return (
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View>{icon}</View>
            <View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label.toUpperCase()}</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

function FeatureItem({ label, ok, theme }: { label: string; ok?: boolean; theme: any }) {
    return (
        <View style={[styles.featureItem, { borderColor: theme.cardBorder }]}>
            <View style={[styles.dot, { backgroundColor: ok ? theme.success : theme.textMuted }]} />
            <Text style={[styles.featureText, { color: theme.text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualHeader: {
        height: height * 0.45,
        position: 'relative',
        overflow: 'hidden',
    },
    headerNav: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    glassBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderHero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiPlaceholder: {
        fontSize: 80,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    heroTags: {
        position: 'absolute',
        bottom: 25,
        left: 24,
        flexDirection: 'row',
        gap: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    emergencyBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.6)',
    },
    emergencyBadgeText: {
        color: '#ff4d4f',
        fontSize: 12,
        fontWeight: '800',
    },
    body: {
        padding: 24,
        paddingBottom: 120,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 38,
    },
    breed: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    speciesIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (width - 60) / 2,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
    },
    statIcon: {
        fontSize: 20,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    section: {
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    descriptionContainer: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    rescatistaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        gap: 16,
        borderWidth: 1,
    },
    rescatistaIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(128,128,128,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rescatistaName: {
        fontSize: 16,
        fontWeight: '800',
    },
    rescatistaMeta: {
        fontSize: 12,
    },
    contactBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(128,128,128,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
    },
    traitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    traitTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    traitText: {
        fontSize: 13,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    applyBtn: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
