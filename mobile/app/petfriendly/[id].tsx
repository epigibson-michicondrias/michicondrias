import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPlaceById, PetfriendlyPlace } from '../../src/services/petfriendly';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, MapPin, Phone, Globe, Star, Check, Bone, Info, Share2, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PetfriendlyDetalleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: place, isLoading } = useQuery({
        queryKey: ['petfriendly-place', id],
        queryFn: () => getPlaceById(id as string),
    });

    if (isLoading || !place) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const openMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
        Linking.openURL(url);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800' }}
                        style={styles.image}
                    />
                    <View style={styles.topOverlay}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleBtn}>
                            <Share2 size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.placeHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.placeName, { color: theme.text }]}>{place.name}</Text>
                            <Text style={[styles.category, { color: theme.primary }]}>{place.category}</Text>
                        </View>
                        <View style={[styles.ratingCard, { backgroundColor: theme.surface }]}>
                            <Star size={20} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingValue, { color: theme.text }]}>{place.rating?.toFixed(1) || '4.8'}</Text>
                        </View>
                    </View>

                    <View style={styles.actionGrid}>
                        <ActionBtn icon={<Phone size={20} color={theme.primary} />} label="Llamar" onPress={() => place.phone && Linking.openURL(`tel:${place.phone}`)} theme={theme} disabled={!place.phone} />
                        <ActionBtn icon={<MapPin size={20} color={theme.primary} />} label="Mapa" onPress={openMap} theme={theme} />
                        <ActionBtn icon={<Globe size={20} color={theme.primary} />} label="Web" onPress={() => place.website && Linking.openURL(place.website)} theme={theme} disabled={!place.website} />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Info size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>
                        </View>
                        <Text style={[styles.description, { color: theme.textMuted }]}>
                            {place.description || "Un lugar increíble para disfrutar con tu mejor amigo. Cuentan con áreas designadas y un ambiente totalmente acogedor para mascotas."}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Bone size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios para Michis</Text>
                        </View>
                        <View style={styles.servicesGrid}>
                            <ServiceItem label="Agua disponible" active={place.has_water_bowls === 'yes'} theme={theme} />
                            <ServiceItem label="Menú para mascotas" active={place.has_pet_menu === 'yes'} theme={theme} />
                            <ServiceItem label={`Tamaño: ${place.pet_sizes_allowed || 'Todos'}`} active theme={theme} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Clock size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios de Atención</Text>
                        </View>
                        <View style={[styles.hoursCard, { backgroundColor: theme.surface }]}>
                            <HourRow day="Lunes - Viernes" hours="09:00 - 22:00" theme={theme} />
                            <HourRow day="Sábado" hours="10:00 - 23:00" theme={theme} />
                            <HourRow day="Domingo" hours="10:00 - 20:00" theme={theme} isLast />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={[styles.addressCard, { backgroundColor: theme.surface }]}>
                            <MapPin size={20} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addressTitle, { color: theme.text }]}>Ubicación</Text>
                                <Text style={[styles.addressText, { color: theme.textMuted }]}>{place.address}, {place.city}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Star size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Puntos Michi (Reseñas)</Text>
                        </View>
                        <Text style={[styles.description, { color: theme.textMuted, fontSize: 13, fontStyle: 'italic' }]}>
                            "¡Excelente lugar! A mi gato le encantó el área de juegos y el personal es súper amable con los animales." - @michilover99
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function HourRow({ day, hours, theme, isLast }: any) {
    return (
        <View style={[styles.hourRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <Text style={[styles.hourDay, { color: theme.text }]}>{day}</Text>
            <Text style={[styles.hourVal, { color: theme.textMuted }]}>{hours}</Text>
        </View>
    );
}

function ActionBtn({ icon, label, onPress, theme, disabled }: { icon: any, label: string, onPress: any, theme: any, disabled?: boolean }) {
    return (
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surface, opacity: disabled ? 0.4 : 1 }]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon}
            <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function ServiceItem({ label, active, theme }: { label: string, active: boolean, theme: any }) {
    return (
        <View style={[styles.serviceItem, { backgroundColor: active ? theme.primary + '15' : theme.surface }]}>
            <Check size={16} color={active ? theme.primary : theme.textMuted} />
            <Text style={[styles.serviceText, { color: active ? theme.text : theme.textMuted }]}>{label}</Text>
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
    scroll: {
        paddingBottom: 40,
    },
    imageContainer: {
        height: 320,
        width: width,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    circleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginTop: -30,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        gap: 32,
    },
    placeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    placeName: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    ratingCard: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    serviceText: {
        fontSize: 13,
        fontWeight: '700',
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 13,
        lineHeight: 18,
    },
    hoursCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
    },
    hourDay: {
        fontSize: 13,
        fontWeight: '700',
    },
    hourVal: {
        fontSize: 13,
    }
});
