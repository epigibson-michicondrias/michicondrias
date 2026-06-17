import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { usePetDetail } from '@/src/hooks/mascotas';
import { formatAge, formatWeight } from '@/src/utils/formatters';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import BackButton from '@/src/components/BackButton';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { Settings, Award, ShieldCheck, Activity, Calendar, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PetProfileScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pet, isLoading, error, goBack, goToCarnet, handleSubscribeMichiTracker, isSubscribing } = usePetDetail();

    if (isLoading) return (
        <ScreenContainer style={styles.center}>
            <LoadingOverlay message="Sincronizando con el chip..." />
        </ScreenContainer>
    );

    if (error || !pet) return (
        <ScreenContainer style={styles.center}>
            <Text style={{ color: theme.error }}>Error al cargar la mascota</Text>
            <TouchableOpacity onPress={goBack} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
                <Text style={{ color: theme.text }}>Regresar</Text>
            </TouchableOpacity>
        </ScreenContainer>
    );

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: pet.photo_url || 'https://via.placeholder.com/800' }} style={styles.mainImage} />
                    <View style={styles.headerButtons}>
                        <BackButton onPress={goBack} color="#fff" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }} />
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(`/mascotas/editar/${pet.id}`)}>
                            <Settings size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.titleSection}>
                        <View>
                            <Text style={[styles.name, { color: theme.text }]}>{pet.name}</Text>
                            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                                {pet.breed || pet.species} • {pet.gender === 'macho' ? 'Niño ♂️' : 'Niña ♀️'}
                            </Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={20} color="#22c55e" />
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        <PetStat icon={<Calendar size={20} color="#6366f1" />} label="Edad" value={formatAge(pet.age_months)} theme={theme} />
                        <PetStat icon={<Activity size={20} color="#ec4899" />} label="Peso" value={formatWeight(pet.weight_kg)} theme={theme} />
                        <PetStat icon={<Award size={20} color="#facc15" />} label="Salud" value="Al Día" theme={theme} />
                    </View>

                    {/* Carnet Digital */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Carnet Digital</Text>
                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]} onPress={goToCarnet}>
                            <View style={styles.actionIcon}>
                                <Text style={{ fontSize: 24 }}>💉</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Vacunas y Desparasitaciones</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>Consulta el historial y próximas vacunas</Text>
                            </View>
                            <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={handleSubscribeMichiTracker}
                            disabled={isSubscribing}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                <Text style={{ fontSize: 24 }}>🛰️</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Michi-Tracker Pro</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                                    {isSubscribing ? 'Abriendo...' : 'Activar seguimiento GPS en tiempo real'}
                                </Text>
                            </View>
                            <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {/* Servicios y Recuerdo */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Adicionales</Text>
                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={() => router.push({ pathname: '/funeraria/memorial/[petId]', params: { petId: pet.id } } as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Text style={{ fontSize: 24 }}>🕯️</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Memorial y Recuerdo</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>Crear o ver el espacio de homenaje</Text>
                            </View>
                            <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            onPress={() => router.push({ pathname: '/grooming/historial/[petId]', params: { petId: pet.id } } as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                <Text style={{ fontSize: 24 }}>✂️</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionTitle, { color: theme.text }]}>Historial de Estética</Text>
                                <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>Consultar visitas y fotos de grooming</Text>
                            </View>
                            <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {/* Notas Médicas */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notas Médicas</Text>
                        <View style={[styles.notesBox, { borderColor: theme.cardBorder }]}>
                            <Text style={[styles.notesText, { color: theme.textMuted }]}>
                                {pet.description || "No hay notas clínicas recientes. Asegúrate de mantener el carnet actualizado para prevenir enfermedades."}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

function PetStat({ icon, label, value, theme }: { icon: any; label: string; value: string; theme: any }) {
    return (
        <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {icon}
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
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
    },
    subtitle: {
        fontSize: 16,
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
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        gap: 16,
        borderWidth: 1,
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
    },
    actionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    notesBox: {
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
    },
    notesText: {
        fontSize: 14,
        lineHeight: 22,
    },
    backBtn: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
});
