import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getVenue, Venue } from '../../src/services/venues';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Building2, MapPin, Tag, Star, Info } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

export default function VenueDetailScreen() {
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

    const { data: venue, isLoading, error } = useQuery<Venue>({
        queryKey: ['venue', id],
        queryFn: () => getVenue(id as string),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Establecimiento</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Establecimiento</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del establecimiento.
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
        showAlert({
            type: 'info',
            title: 'Contactar',
            message: '¿Cómo deseas contactar a este establecimiento?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Llamar',
            onButtonPress: () => showAlert({ type: 'info', title: 'Contacto', message: 'Abriendo marcador telefónico...' }),
        });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle del Establecimiento</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Venue Header */}
            <View style={styles.venueHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Building2 size={40} color={theme.primary} />
                </View>
                <Text style={[styles.venueName, { color: theme.text }]}>{venue.name}</Text>
            </View>

            {/* Location */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                <View style={styles.locationRow}>
                    <MapPin size={20} color={theme.primary} />
                    <Text style={[styles.locationText, { color: theme.textMuted }]}>{venue.address}</Text>
                </View>
            </View>

            {/* Amenities */}
            {venue.amenities && Object.keys(venue.amenities).length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios</Text>
                    <View style={styles.amenitiesGrid}>
                        {Object.entries(venue.amenities).map(([key, value], index) => (
                            <View key={index} style={[styles.amenityCard, { backgroundColor: theme.background }]}>
                                <Text style={[styles.amenityKey, { color: theme.primary }]}>{key}</Text>
                                <Text style={[styles.amenityValue, { color: theme.text }]}>{String(value)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Discount */}
            {venue.discount_coupon && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Descuento Disponible</Text>
                    <View style={[styles.discountCard, { backgroundColor: '#f59e0b15' }]}>
                        <Tag size={24} color="#f59e0b" />
                        <View style={styles.discountInfo}>
                            <Text style={[styles.discountCode, { color: '#f59e0b' }]}>{venue.discount_coupon}</Text>
                            {venue.discount_description && (
                                <Text style={[styles.discountDesc, { color: theme.textMuted }]}>{venue.discount_description}</Text>
                            )}
                        </View>
                    </View>
                </View>
            )}

            {/* Info */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <View style={styles.infoRow}>
                    <Info size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>ID del Establecimiento:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{venue.id.substring(0, 12)}...</Text>
                </View>
                <View style={styles.infoRow}>
                    <Info size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Propietario:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{venue.owner_id.substring(0, 12)}...</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: theme.primary }]}
                    onPress={handleContact}
                >
                    <Text style={styles.contactButtonText}>Contactar Establecimiento</Text>
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
    venueHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 16,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueName: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
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
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
        lineHeight: 22,
    },
    amenitiesGrid: {
        gap: 12,
    },
    amenityCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    amenityKey: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    amenityValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    discountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    discountInfo: {
        flex: 1,
    },
    discountCode: {
        fontSize: 18,
        fontWeight: '800',
    },
    discountDesc: {
        fontSize: 14,
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    infoLabel: {
        fontSize: 14,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
});
