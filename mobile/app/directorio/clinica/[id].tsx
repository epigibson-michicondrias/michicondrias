import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClinic, getClinicServices, getClinicReviews, getClinicRating } from '@/src/services/directorio';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, MapPin, Phone, Globe, Clock, Star, Info, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ClinicDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: clinic, isLoading } = useQuery({
        queryKey: ['clinic', id],
        queryFn: () => getClinic(id as string),
    });

    const { data: services = [] } = useQuery({
        queryKey: ['clinic-services', id],
        queryFn: () => getClinicServices(id as string),
    });

    const { data: rating } = useQuery({
        queryKey: ['clinic-rating', id],
        queryFn: () => getClinicRating(id as string),
    });

    if (isLoading) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textMuted }}>Cargando clínica...</Text></View>;
    if (!clinic) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.text }}>Clínica no encontrada</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: clinic.logo_url || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000' }}
                        style={styles.coverImage}
                    />
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>{clinic.name}</Text>
                            <View style={styles.locationContainer}>
                                <MapPin size={14} color={theme.textMuted} />
                                <Text style={[styles.location, { color: theme.textMuted }]}>{clinic.address}, {clinic.city}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Star size={16} color="#facc15" fill="#facc15" />
                            <Text style={styles.ratingText}>{rating?.average_rating?.toFixed(1) || '5.0'}</Text>
                        </View>
                    </View>

                    <View style={styles.quickActions}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                            <Phone size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Llamar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                            <Globe size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Sitio Web</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface }]}>
                            <MapPin size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>
                        <Text style={[styles.description, { color: theme.textMuted }]}>{clinic.description || 'Sin descripción disponible.'}</Text>

                        <View style={styles.features}>
                            {clinic.is_24_hours && (
                                <View style={styles.featureItem}>
                                    <Clock size={16} color="#60a5fa" />
                                    <Text style={[styles.featureText, { color: '#60a5fa' }]}>Abierto 24 Horas</Text>
                                </View>
                            )}
                            {clinic.has_emergency && (
                                <View style={styles.featureItem}>
                                    <Info size={16} color="#f87171" />
                                    <Text style={[styles.featureText, { color: '#f87171' }]}>Servicio de Emergencias</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Disponibles</Text>
                    </View>

                    {services.length === 0 ? (
                        <Text style={{ color: theme.textMuted, marginLeft: 8 }}>No hay servicios listados actualmente.</Text>
                    ) : (
                        services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[styles.serviceItem, { backgroundColor: theme.surface }]}
                                onPress={() => Alert.alert("Agendar", `¿Deseas agendar ${service.name}?`)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                                    <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>{service.duration_minutes} min</Text>
                                </View>
                                <View style={styles.serviceRight}>
                                    <Text style={[styles.servicePrice, { color: theme.primary }]}>
                                        {service.price ? `$${service.price}` : 'Consultar'}
                                    </Text>
                                    <Calendar size={18} color={theme.primary} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.primary }]}>
                    <Text style={styles.bookBtnText}>Agendar Cita General</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 300,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        marginTop: -30,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    location: {
        fontSize: 14,
        fontWeight: '600',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#facc1520',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
    },
    ratingText: {
        color: '#facc15',
        fontWeight: '800',
        fontSize: 16,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        padding: 16,
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
    infoCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff05',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '700',
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
    },
    serviceDuration: {
        fontSize: 12,
        marginTop: 2,
    },
    serviceRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    bookBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
