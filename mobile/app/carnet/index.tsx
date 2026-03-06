import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserPets, Pet } from '../../src/services/mascotas';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, ClipboardList, Syringe, Scissors, Search, Activity, Stethoscope } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CarnetListScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const [searchId, setSearchId] = useState('');

    const isVetOrAdmin = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const { data: pets = [], isLoading } = useQuery({
        queryKey: ['my-pets-carnet', user?.id],
        queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
        enabled: !!user?.id,
    });

    const handleSearch = () => {
        if (searchId.trim()) {
            router.push(`/carnet/${searchId.trim()}` as any);
        }
    };

    const renderPetItem = ({ item }: { item: Pet }) => (
        <TouchableOpacity
            style={[styles.petCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/carnet/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.imageWrapper}>
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.petImage} />
                    ) : (
                        <View style={[styles.petInitial, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={styles.initialText}>
                                {item.species?.toLowerCase() === 'perro' ? '🐕' : '🐈'}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.petMainInfo}>
                    <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.petBreed, { color: theme.textMuted }]}>
                        {item.breed || item.species} {item.gender ? `· ${item.gender}` : ''}
                    </Text>
                    {item.age_months != null && (
                        <Text style={[styles.petAge, { color: theme.textMuted }]}>
                            {Math.floor(item.age_months / 12) > 0 ? `${Math.floor(item.age_months / 12)}a ` : ''}
                            {item.age_months % 12 > 0 ? `${item.age_months % 12}m` : ''}
                        </Text>
                    )}
                </View>
                <View style={[styles.chevronBox, { backgroundColor: theme.primary + '10' }]}>
                    <ChevronLeft size={18} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
            </View>

            <View style={styles.healthStatus}>
                <HealthChip
                    label="Vacunas"
                    ok={item.is_vaccinated}
                    icon={<Syringe size={12} color={item.is_vaccinated ? '#10b981' : '#f59e0b'} />}
                    color={item.is_vaccinated ? '#10b981' : '#f59e0b'}
                />
                <HealthChip
                    label="Esterilizado"
                    ok={item.is_sterilized}
                    icon={<Scissors size={12} color={item.is_sterilized ? '#3b82f6' : '#6b7280'} />}
                    color={item.is_sterilized ? '#3b82f6' : '#6b7280'}
                />
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.idBox}>
                    <Text style={[styles.idLabel, { color: theme.textMuted }]}>DIGITAL ID:</Text>
                    <Text style={[styles.idValue, { color: theme.text }]}>{item.id.substring(0, 12)}...</Text>
                </View>
                <TouchableOpacity
                    style={[styles.btnOpen, { backgroundColor: theme.primary + '15' }]}
                    onPress={() => router.push(`/carnet/${item.id}` as any)}
                >
                    <ClipboardList size={14} color={theme.primary} />
                    <Text style={[styles.btnOpenText, { color: theme.primary }]}>Expediente</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: theme.text }]}>Expedientes Digitales</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Historiales médicos digitales</Text>
                </View>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/mascotas/nuevo')}
                >
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={pets}
                keyExtractor={(item) => item.id}
                renderItem={renderPetItem}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <>
                        {isVetOrAdmin && (
                            <View style={[styles.medicalTerminal, { backgroundColor: '#0891b220', borderColor: '#0891b240' }]}>
                                <View style={styles.terminalHeader}>
                                    <View style={styles.terminalIconBox}>
                                        <Stethoscope size={20} color="#0891b2" />
                                    </View>
                                    <View>
                                        <Text style={styles.terminalTitle}>Modo Médico Habilitado</Text>
                                        <Text style={styles.terminalSubtitle}>Acceso global por ID de paciente</Text>
                                    </View>
                                </View>
                                <View style={styles.searchRow}>
                                    <TextInput
                                        style={[styles.terminalInput, { backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }]}
                                        placeholder="Introduce el ID del paciente..."
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        value={searchId}
                                        onChangeText={setSearchId}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        style={[styles.searchBtn, { backgroundColor: '#0891b2' }]}
                                        onPress={handleSearch}
                                        disabled={!searchId.trim()}
                                    >
                                        <Search size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <View style={styles.statsSummary}>
                            <Activity size={16} color={theme.textMuted} />
                            <Text style={[styles.statsText, { color: theme.textMuted }]}>
                                {pets.length} {pets.length === 1 ? 'Carnet activo' : 'Carnets activos'}
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🩺</Text>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin expedientes</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                            Registra a tu mascota para generar su carnet clínico digital.
                        </Text>
                        <TouchableOpacity
                            style={[styles.registerBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/mascotas/nuevo')}
                        >
                            <Plus size={20} color="#fff" />
                            <Text style={styles.registerBtnText}>Registrar Mascota</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

function HealthChip({ label, ok, icon, color }: { label: string, ok: boolean, icon: React.ReactNode, color: string }) {
    return (
        <View style={[styles.healthChip, { backgroundColor: color + '10', borderColor: color + '20' }]}>
            {icon}
            <Text style={[styles.chipText, { color: color }]}>
                {ok ? label : 'Pendiente'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        padding: 24,
        paddingTop: 8,
        gap: 20,
    },
    medicalTerminal: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
    },
    terminalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    terminalIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(8, 145, 178, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    terminalTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
    terminalSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    terminalInput: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    searchBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingLeft: 4,
    },
    statsText: {
        fontSize: 13,
        fontWeight: '700',
    },
    petCard: {
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    imageWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    petImage: {
        width: '100%',
        height: '100%',
    },
    petInitial: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialText: {
        fontSize: 28,
    },
    petMainInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 2,
    },
    petBreed: {
        fontSize: 12,
        fontWeight: '600',
    },
    petAge: {
        fontSize: 11,
        marginTop: 2,
    },
    chevronBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    healthStatus: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
    },
    healthChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    idBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    idLabel: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    idValue: {
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
    },
    btnOpen: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    btnOpenText: {
        fontSize: 12,
        fontWeight: '800',
    },
    emptyState: {
        flex: 1,
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 32,
    },
    registerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 20,
        gap: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    }
});
