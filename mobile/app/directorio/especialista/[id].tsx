import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getVets } from '@/src/services/directorio';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Phone, Mail, Award, ShieldCheck, Calendar, Briefcase, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SpecialistDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: specialists = [], isLoading } = useQuery({
        queryKey: ['vet', id],
        queryFn: () => getVets(),
    });

    const specialist = specialists.find(v => v.id === id);

    if (isLoading) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textMuted }}>Cargando especialista...</Text></View>;
    if (!specialist) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.text }}>Especialista no encontrado</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { backgroundColor: theme.secondary + '15' }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.profileSection}>
                        <View style={[styles.avatarContainer, { borderColor: theme.secondary }]}>
                            {specialist.photo_url ? (
                                <Image source={{ uri: specialist.photo_url }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={[styles.avatarInitial, { color: theme.secondary }]}>{specialist.first_name.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.name, { color: theme.text }]}>{specialist.first_name} {specialist.last_name}</Text>
                        <Text style={[styles.specialty, { color: theme.secondary }]}>{specialist.specialty || 'Médico Veterinario'}</Text>

                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={14} color="#10b981" />
                            <Text style={styles.verifiedText}>Cédula Verificada</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Award size={20} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>Exp.</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Verificada</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surface }]}>
                            <Briefcase size={20} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>Servicios</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Especialistas</Text>
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Biografía Profesional</Text>
                        <Text style={[styles.bio, { color: theme.textMuted }]}>
                            {specialist.bio || 'El Dr. es un especialista dedicado a la salud animal con años de experiencia en medicina veterinaria y cirugía.'}
                        </Text>
                    </View>

                    <View style={styles.contactSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contacto</Text>
                        <View style={styles.contactList}>
                            {specialist.phone && (
                                <TouchableOpacity style={[styles.contactItem, { backgroundColor: theme.surface }]}>
                                    <View style={[styles.contactIcon, { backgroundColor: theme.primary + '15' }]}>
                                        <Phone size={20} color={theme.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.contactLabel, { color: theme.textMuted }]}>Teléfono</Text>
                                        <Text style={[styles.contactValue, { color: theme.text }]}>{specialist.phone}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.contactItem, { backgroundColor: theme.surface }]}>
                                <View style={[styles.contactIcon, { backgroundColor: theme.secondary + '15' }]}>
                                    <Mail size={20} color={theme.secondary} />
                                </View>
                                <View>
                                    <Text style={[styles.contactLabel, { color: theme.textMuted }]}>Correo</Text>
                                    <Text style={[styles.contactValue, { color: theme.text }]}>{specialist.email || 'No disponible'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
                        <Info size={20} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Este profesional atiende previa cita. Los costos y disponibilidad pueden variar.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.primary }]}>
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookBtnText}>Agendar Consulta</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        padding: 4,
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 56,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 56,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 48,
        fontWeight: '900',
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    verifiedText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        marginTop: -50,
    },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        lineHeight: 22,
    },
    contactSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    contactList: {
        gap: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    bookBtn: {
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
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
