import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getListing, Listing } from '../../src/services/adopciones';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Share2, Heart, MapPin, Bone, User, Info, MessageCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function AdopcionDetalleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: listing, isLoading } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
    });

    if (isLoading || !listing) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const handleApply = () => {
        router.push(`/adopciones/solicitar/${id}` as any);
    };

    const getSpeciesColor = (species: string) => {
        switch (species.toLowerCase()) {
            case 'perro': return '#f59e0b';
            case 'gato': return '#ec4899';
            case 'ave': return '#3b82f6';
            default: return '#10b981';
        }
    };

    const speciesColor = getSpeciesColor(listing.species);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
                <View style={[styles.visualHeader, { backgroundColor: speciesColor + '15' }]}>
                    <View style={styles.headerNav}>
                        <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={styles.glassBtn}>
                                <Share2 size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {listing.photo_url ? (
                        <Image source={{ uri: listing.photo_url }} style={styles.heroImage} />
                    ) : (
                        <View style={styles.placeholderHero}>
                            <Text style={styles.emojiPlaceholder}>
                                {listing.species === 'perro' ? '🐕' : listing.species === 'gato' ? '🐈' : '🐾'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.heroOverlay} />

                    <View style={styles.heroTags}>
                        <View style={[styles.statusBadge, { borderColor: speciesColor + '40', backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                            <Text style={[styles.statusText, { color: speciesColor }]}>{listing.status.toUpperCase()}</Text>
                        </View>
                        {listing.is_emergency && (
                            <View style={styles.emergencyBadge}>
                                <Text style={styles.emergencyBadgeText}>🚨 URGENTE</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.titleSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.name, { color: theme.text }]}>{listing.name}</Text>
                            <Text style={[styles.breed, { color: speciesColor }]}>
                                {listing.breed || 'Mestizo'} • {listing.gender}
                            </Text>
                        </View>
                        <View style={[styles.speciesIconContainer, { backgroundColor: speciesColor + '20' }]}>
                            <Text style={{ fontSize: 24 }}>{listing.species === 'perro' ? '🐶' : '🐱'}</Text>
                        </View>
                    </View>

                    <View style={styles.quickStats}>
                        <StatCard label="Edad" value={listing.age_months ? `${listing.age_months} meses` : 'N/A'} icon="📅" theme={theme} />
                        <StatCard label="Tamaño" value={listing.size || 'Mediano'} icon="📏" theme={theme} />
                        <StatCard label="Peso" value={listing.weight_kg ? `${listing.weight_kg} kg` : 'N/A'} icon="⚖️" theme={theme} />
                        <StatCard label="Ubicación" value={listing.location || 'CDMX'} icon="📍" theme={theme} />
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 32 }]}>Su Historia</Text>
                    <View style={[styles.descriptionContainer, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.description, { color: theme.text }]}>
                            {listing.description || "Este pequeño busca una familia que le dé mucho amor. Es muy juguetón, sociable con otros animales y está esperando por ti."}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <User size={20} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Rescatista</Text>
                        </View>
                        <View style={[styles.rescatistaCard, { backgroundColor: theme.surface }]}>
                            <View style={styles.rescatistaIcon}>
                                <Text style={{ fontSize: 24 }}>🏠</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.rescatistaName, { color: theme.text }]}>Resguardo Michicondrias</Text>
                                <Text style={[styles.rescatistaMeta, { color: theme.textMuted }]}>Protección animal verificada</Text>
                            </View>
                            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.primary + '20' }]}>
                                <MessageCircle size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

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

            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: theme.primary }]} onPress={handleApply}>
                    <Heart size={20} color="#fff" />
                    <Text style={[styles.applyBtnText]}>¡Quiero Adoptar!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function StatCard({ label, value, icon, theme }: { label: string, value: string, icon: string, theme: any }) {
    return (
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <View>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label.toUpperCase()}</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

function FeatureItem({ label, ok, theme }: { label: string, ok?: boolean, theme: any }) {
    return (
        <View style={styles.featureItem}>
            <View style={[styles.dot, { backgroundColor: ok ? '#10b981' : theme.textMuted }]} />
            <Text style={[styles.featureText, { color: theme.text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
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
        // In React Native we use linear gradient usually, but for a simple fade we can use absolute positioning with shadow or just rely on the design.
        // We'll simulate the "inset box-shadow" with a darker bottom overlay.
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rescatistaIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
