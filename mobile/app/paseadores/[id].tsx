import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getWalker, Walker } from '../../src/services/paseadores';
import { useColorScheme } from '@/components/useColorScheme';
import { 
    MapPin, Star, Clock, Users, Phone, MessageCircle, Calendar, 
    Shield, ChevronLeft, Heart, Share2, Dog, Cat, CheckCircle 
} from 'lucide-react-native';

export default function WalkerDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? {
        background: '#000',
        text: '#fff',
        textMuted: '#999',
        surface: '#111',
        border: '#333',
        primary: '#7c3aed',
        secondary: '#10b981',
    } : {
        background: '#fff',
        text: '#000',
        textMuted: '#666',
        surface: '#f9f9f9',
        border: '#e5e5e5',
        primary: '#7c3aed',
        secondary: '#10b981',
    };

    const [isFavorite, setIsFavorite] = useState(false);

    const { data: walker, isLoading, error } = useQuery<Walker>({
        queryKey: ['walker', id],
        queryFn: () => getWalker(id as string),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Paseador</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </View>
        );
    }

    if (error || !walker) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Paseador</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del paseador.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleContact = () => {
        Alert.alert(
            "Contactar Paseador",
            "¿Cómo deseas contactar a este paseador?",
            [
                {
                    text: "Llamar",
                    onPress: () => {
                        // Implementar llamada telefónica
                        Alert.alert("Llamada", "Función de llamada no disponible en este momento");
                    }
                },
                {
                    text: "Mensaje",
                    onPress: () => {
                        // Implementar mensaje
                        Alert.alert("Mensaje", "Abriendro chat con el paseador...");
                    }
                },
                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        );
    };

    const handleBook = () => {
        Alert.alert(
            "Reservar Paseo",
            "¿Para cuándo necesitas el servicio de paseo?",
            [
                {
                    text: "Hoy",
                    onPress: () => Alert.alert("Reserva", "Redirigiendo a agenda...")
                },
                {
                    text: "Mañana", 
                    onPress: () => Alert.alert("Reserva", "Redirigiendo a agenda...")
                },
                {
                    text: "Otra fecha",
                    onPress: () => Alert.alert("Reserva", "Redirigiendo a calendario...")
                },
                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil del Paseador</Text>
                <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                    <Heart size={24} color={isFavorite ? '#ef4444' : theme.textMuted} fill={isFavorite ? '#ef4444' : 'none'} />
                </TouchableOpacity>
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
                    {walker.photo_url ? (
                        <Image source={{ uri: walker.photo_url }} style={styles.avatar} />
                    ) : (
                        <Text style={[styles.avatarText, { color: theme.primary }]}>
                            {walker.display_name.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>
                
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: theme.text }]}>{walker.display_name}</Text>
                    <View style={styles.ratingRow}>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <Text style={[styles.ratingText, { color: theme.text }]}>
                            {walker.rating ? walker.rating.toFixed(1) : '5.0'} ({walker.total_walks} paseos)
                        </Text>
                    </View>
                    
                    {walker.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <Shield size={14} color="#10b981" />
                            <Text style={styles.verifiedText}>Verificado</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                <View style={styles.statItem}>
                    <Users size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.total_walks}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Paseos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Clock size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.experience_years || 1}+</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Dog size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.max_pets_per_walk}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                </View>
            </View>

            {/* Bio */}
            {walker.bio && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                    <Text style={[styles.bioText, { color: theme.textMuted }]}>{walker.bio}</Text>
                </View>
            )}

            {/* Services */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios</Text>
                <View style={styles.servicesGrid}>
                    <View style={[styles.serviceCard, { backgroundColor: walker.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                        <Dog size={24} color={walker.accepts_dogs ? theme.primary : theme.textMuted} />
                        <Text style={[styles.serviceName, { color: walker.accepts_dogs ? theme.primary : theme.textMuted }]}>
                            Paseo de Perros
                        </Text>
                        <CheckCircle size={16} color={walker.accepts_dogs ? '#10b981' : theme.textMuted} />
                    </View>
                    <View style={[styles.serviceCard, { backgroundColor: walker.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                        <Cat size={24} color={walker.accepts_cats ? theme.primary : theme.textMuted} />
                        <Text style={[styles.serviceName, { color: walker.accepts_cats ? theme.primary : theme.textMuted }]}>
                            Paseo de Gatos
                        </Text>
                        <CheckCircle size={16} color={walker.accepts_cats ? '#10b981' : theme.textMuted} />
                    </View>
                </View>
            </View>

            {/* Location */}
            {walker.location && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={20} color={theme.primary} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]}>
                            {walker.location}
                        </Text>
                    </View>
                    {walker.service_radius_km && (
                        <Text style={[styles.radiusText, { color: theme.textMuted }]}>
                            Radio de servicio: {walker.service_radius_km} km
                        </Text>
                    )}
                </View>
            )}

            {/* Pricing */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                <View style={styles.pricingCard}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo por hora</Text>
                    <Text style={[styles.priceAmount, { color: theme.primary }]}>
                        ${walker.price_per_hour || 20}
                    </Text>
                </View>
                {walker.price_per_walk && (
                    <View style={styles.pricingCard}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo individual</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            ${walker.price_per_walk}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={handleContact}
                >
                    <MessageCircle size={20} color={theme.primary} />
                    <Text style={[styles.contactButtonText, { color: theme.primary }]}>Enviar Mensaje</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={handleBook}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar Paseo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    placeholder: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 16,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
    },
    shareButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 22,
    },
    servicesGrid: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    serviceName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
    },
    radiusText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    priceLabel: {
        fontSize: 15,
    },
    priceAmount: {
        fontSize: 20,
        fontWeight: '800',
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    contactButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    bookButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
});
