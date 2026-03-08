import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getClinic } from '@/src/services/directorio';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { 
    ChevronLeft, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Clock, 
    ShieldCheck, 
    Info,
    Calendar,
    Star
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ClinicDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: clinic, isLoading, error } = useQuery({
        queryKey: ['admin-clinic', id],
        queryFn: () => getClinic(id),
    });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (error || !clinic) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textMuted }}>No se pudo cargar la información de la clínica.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={[theme.primary, theme.primary + 'CC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detalles de Clínica</Text>
                    <View style={{ width: 44 }} />
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Clinic Main Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.logoRow}>
                        {clinic.logo_url ? (
                            <Image source={{ uri: clinic.logo_url }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary + '15' }]}>
                                <ShieldCheck size={40} color={theme.primary} />
                            </View>
                        )}
                        <View style={styles.mainMeta}>
                            <Text style={[styles.name, { color: theme.text }]}>{clinic.name}</Text>
                            <View style={styles.statusBadgeRow}>
                                <View style={[styles.statusBadge, { backgroundColor: '#10b98120' }]}>
                                    <Text style={[styles.statusText, { color: '#10b981' }]}>ACTIVA</Text>
                                </View>
                                {clinic.is_24_hours && (
                                    <View style={[styles.statusBadge, { backgroundColor: '#3b82f620' }]}>
                                        <Text style={[styles.statusText, { color: '#3b82f6' }]}>24 HORAS</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.contactSection}>
                        <DetailItem icon={MapPin} label="Dirección" value={clinic.address || 'No proporcionada'} theme={theme} />
                        <DetailItem icon={Phone} label="Teléfono" value={clinic.phone || 'No proporcionado'} theme={theme} />
                        <DetailItem icon={Mail} label="Email" value={clinic.email || 'No proporcionado'} theme={theme} />
                        <DetailItem icon={Globe} label="Sitio Web" value={clinic.website || 'No proporcionado'} theme={theme} />
                        <DetailItem icon={Clock} label="Emergencias" value={clinic.has_emergency ? 'Disponible' : 'No disponible'} theme={theme} />
                    </View>
                </View>

                {/* Description Section */}
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Info size={18} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Acerca de la clínica</Text>
                    </View>
                    <Text style={[styles.description, { color: theme.textMuted }]}>
                        {clinic.description || "Esta clínica no ha proporcionado una descripción detallada de sus servicios."}
                    </Text>
                </View>

                {/* ID and Internal Info */}
                <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <Star size={18} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Administrativa</Text>
                    </View>
                    <View style={styles.adminData}>
                        <Text style={[styles.adminLabel, { color: theme.textMuted }]}>ID de Sistema:</Text>
                        <Text style={[styles.adminValue, { color: theme.text }]}>{clinic.id}</Text>
                    </View>
                    <View style={styles.adminData}>
                        <Text style={[styles.adminLabel, { color: theme.textMuted }]}>ID del Propietario:</Text>
                        <Text style={[styles.adminValue, { color: theme.text }]}>{clinic.owner_user_id || 'N/A'}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={[styles.btnAction, { backgroundColor: theme.primary }]}
                        onPress={() => Alert.alert("Editar", "Módulo de edición próximamente.")}
                    >
                        <Text style={styles.btnActionText}>Editar Información</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.btnAction, { backgroundColor: '#ef4444' }]}
                        onPress={() => Alert.alert("Suspender", "¿Estás seguro de suspender esta clínica?")}
                    >
                        <Text style={styles.btnActionText}>Suspender Clínica</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailItem({ icon: Icon, label, value, theme }: any) {
    return (
        <View style={styles.detailItem}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
                <Icon size={16} color={theme.primary} />
            </View>
            <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    infoCard: {
        margin: 20,
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 24,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainMeta: { flex: 1 },
    name: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusBadgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        marginVertical: 24,
    },
    contactSection: {
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailInfo: { flex: 1 },
    detailLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 24,
        borderRadius: 28,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    adminData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    adminLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    adminValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    actionRow: {
        paddingHorizontal: 20,
        marginTop: 8,
        gap: 12,
    },
    btnAction: {
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    btnActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    }
});
