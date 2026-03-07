import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getSitter, Sitter } from '../../src/services/cuidadores';
import { useColorScheme } from '@/components/useColorScheme';
import { 
    MapPin, Star, Clock, Home, Users, Phone, MessageCircle, Calendar, 
    Shield, ChevronLeft, Heart, Share2, Dog, Cat, CheckCircle, Sun, Moon
} from 'lucide-react-native';

export default function SitterDetailScreen() {
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

    const { data: sitter, isLoading, error } = useQuery<Sitter>({
        queryKey: ['sitter', id],
        queryFn: () => getSitter(id as string),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Cuidador</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </View>
        );
    }

    if (error || !sitter) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Cuidador</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del cuidador.
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
            "Contactar Cuidador",
            "¿Cómo deseas contactar a este cuidador?",
            [
                {
                    text: "Mensaje",
                    onPress: () => {
                        Alert.alert("Mensaje", "Abriendro chat con el cuidador...");
                    }
                },
                {
                    text: "Visitar",
                    onPress: () => {
                        Alert.alert("Visita", "Mostrando información de contacto para visita...");
                    }
                },
                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        );
    };

    const handleBook = (serviceType: string) => {
        Alert.alert(
            "Reservar Servicio",
            `¿Para cuándo necesitas el servicio de ${serviceType}?`,
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

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'daycare': return <Sun size={20} color={theme.primary} />;
            case 'boarding': return <Moon size={20} color={theme.primary} />;
            default: return <Home size={20} color={theme.primary} />;
        }
    };

    const getServiceName = (type: string) => {
        switch (type) {
            case 'daycare': return 'Guardería Diaria';
            case 'boarding': return 'Hospedaje Nocturno';
            default: return 'Cuidado Completo';
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Perfil del Cuidador</Text>
                <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
                    <Heart size={24} color={isFavorite ? '#ef4444' : theme.textMuted} fill={isFavorite ? '#ef4444' : 'none'} />
                </TouchableOpacity>
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.secondary + '20' }]}>
                    {sitter.photo_url ? (
                        <Image source={{ uri: sitter.photo_url }} style={styles.avatar} />
                    ) : (
                        <Text style={[styles.avatarText, { color: theme.secondary }]}>
                            {sitter.display_name.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>
                
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: theme.text }]}>{sitter.display_name}</Text>
                    <View style={styles.ratingRow}>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <Text style={[styles.ratingText, { color: theme.text }]}>
                            {sitter.rating ? sitter.rating.toFixed(1) : '5.0'} ({sitter.total_sits} cuidados)
                        </Text>
                    </View>
                    
                    {sitter.is_verified && (
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
                    <Home size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.total_sits}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cuidados</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Clock size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.experience_years || 1}+</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Users size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.max_pets}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                </View>
            </View>

            {/* Bio */}
            {sitter.bio && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                    <Text style={[styles.bioText, { color: theme.textMuted }]}>{sitter.bio}</Text>
                </View>
            )}

            {/* Services */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Ofrecidos</Text>
                <View style={styles.servicesContainer}>
                    <View style={[styles.serviceCard, { backgroundColor: theme.primary + '10' }]}>
                        {getServiceIcon(sitter.service_type)}
                        <View style={styles.serviceInfo}>
                            <Text style={[styles.serviceName, { color: theme.primary }]}>
                                {getServiceName(sitter.service_type)}
                            </Text>
                            <Text style={[styles.serviceDesc, { color: theme.textMuted }]}>
                                {sitter.service_type === 'daycare' ? 
                                    'Cuidado durante el día, perfecto para dueños ocupados' :
                                    'Cuidado nocturno, ideal para viajes y fines de semana'
                                }
                            </Text>
                        </View>
                        <CheckCircle size={20} color="#10b981" />
                    </View>
                </View>
            </View>

            {/* Pet Types */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipos de Mascotas</Text>
                <View style={styles.petTypesContainer}>
                    <View style={[styles.petTypeCard, { backgroundColor: sitter.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                        <Dog size={24} color={sitter.accepts_dogs ? theme.primary : theme.textMuted} />
                        <Text style={[styles.petTypeName, { color: sitter.accepts_dogs ? theme.primary : theme.textMuted }]}>
                            Perros
                        </Text>
                        <CheckCircle size={16} color={sitter.accepts_dogs ? '#10b981' : theme.textMuted} />
                    </View>
                    <View style={[styles.petTypeCard, { backgroundColor: sitter.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                        <Cat size={24} color={sitter.accepts_cats ? theme.primary : theme.textMuted} />
                        <Text style={[styles.petTypeName, { color: sitter.accepts_cats ? theme.primary : theme.textMuted }]}>
                            Gatos
                        </Text>
                        <CheckCircle size={16} color={sitter.accepts_cats ? '#10b981' : theme.textMuted} />
                    </View>
                </View>
            </View>

            {/* Home Features */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Características del Hogar</Text>
                <View style={styles.featuresGrid}>
                    <View style={styles.featureItem}>
                        <Home size={20} color={theme.primary} />
                        <Text style={[styles.featureText, { color: theme.textMuted }]}>Hogar seguro</Text>
                    </View>
                    {sitter.has_yard && (
                        <View style={styles.featureItem}>
                            <Sun size={20} color={theme.secondary} />
                            <Text style={[styles.featureText, { color: theme.textMuted }]}>Patio privado</Text>
                        </View>
                    )}
                    <View style={styles.featureItem}>
                        <Shield size={20} color={theme.primary} />
                        <Text style={[styles.featureText, { color: theme.textMuted }]}>Supervisión 24/7</Text>
                    </View>
                </View>
            </View>

            {/* Location */}
            {sitter.location && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={20} color={theme.primary} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]}>
                            {sitter.location}
                        </Text>
                    </View>
                </View>
            )}

            {/* Pricing */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                <View style={styles.pricingCard}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Cuidado por día</Text>
                    <Text style={[styles.priceAmount, { color: theme.primary }]}>
                        ${sitter.price_per_day || 30}
                    </Text>
                </View>
                {sitter.price_per_visit && (
                    <View style={styles.pricingCard}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Visita individual</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            ${sitter.price_per_visit}
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
                    onPress={() => handleBook(getServiceName(sitter.service_type))}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar</Text>
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
    servicesContainer: {
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
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    serviceDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    petTypesContainer: {
        gap: 12,
    },
    petTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    petTypeName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    featuresGrid: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        fontSize: 14,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
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
