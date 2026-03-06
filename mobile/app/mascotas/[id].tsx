import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPetById } from '../../src/services/mascotas';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Settings, Award, ShieldCheck, Activity, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PetProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: pet, isLoading, error } = useQuery({
        queryKey: ['pet-profile', id],
        queryFn: () => getPetById(id as string),
        enabled: !!id,
    });

    if (isLoading) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <Text style={{ color: theme.textMuted }}>Sincronizando con el chip...</Text>
        </View>
    );

    if (error || !pet) return (
        <View style={[styles.center, { backgroundColor: theme.background }]}>
            <Text style={{ color: theme.error }}>Error al cargar la mascota</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={{ color: '#fff' }}>Regresar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: pet.photo_url || 'https://via.placeholder.com/800' }} style={styles.mainImage} />
                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Settings size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <View>
                            <Text style={styles.name}>{pet.name}</Text>
                            <Text style={styles.subtitle}>{pet.breed || pet.species} • {pet.gender === 'macho' ? 'Niño ♂️' : 'Niña ♀️'}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={20} color="#22c55e" />
                        </View>
                    </View>

                    <View style={styles.grid}>
                        <PetStat icon={<Calendar size={20} color="#6366f1" />} label="Edad" value={pet.age_months ? `${pet.age_months}m` : 'Bebé'} theme={theme} />
                        <PetStat icon={<Activity size={20} color="#ec4899" />} label="Peso" value="4.5 kg" theme={theme} />
                        <PetStat icon={<Award size={20} color="#facc15" />} label="Salud" value="Al Día" theme={theme} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Carnet Digital</Text>
                        <View style={styles.actionCard}>
                            <View style={styles.actionIcon}>
                                <Text style={{ fontSize: 24 }}>💉</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actionTitle}>Vacunas y Desparasitaciones</Text>
                                <Text style={styles.actionSubtitle}>Próxima: Triple Felina en 15 días</Text>
                            </View>
                            <ChevronLeft size={20} color="#475569" style={{ transform: [{ rotate: '180deg' }] }} />
                        </View>

                        <View style={styles.actionCard}>
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                <Text style={{ fontSize: 24 }}>🛰️</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actionTitle}>Michi-Tracker Pro</Text>
                                <Text style={styles.actionSubtitle}>Suscripción activa hasta Sept 2026</Text>
                            </View>
                            <ChevronLeft size={20} color="#475569" style={{ transform: [{ rotate: '180deg' }] }} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notas Médicas</Text>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesText}>
                                {pet.description || "No hay notas clínicas recientes. Asegúrate de mantener el carnet actualizado para prevenir enfermedades."}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function PetStat({ icon, label, value, theme }: { icon: any, label: string, value: string, theme: any }) {
    return (
        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
            {icon}
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
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
    imageContainer: {
        width: width,
        height: 400,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    headerButtons: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#0f172a',
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
        color: '#f8fafc',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    verifiedBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statItem: {
        width: '30%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statLabel: {
        fontSize: 10,
        color: '#475569',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 14,
        color: '#cbd5e1',
        fontWeight: '800',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#f8fafc',
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        marginBottom: 12,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f8fafc',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    notesBox: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    notesText: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 22,
    },
    backBtn: {
        marginTop: 20,
        backgroundColor: '#1e293b',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    }
});
