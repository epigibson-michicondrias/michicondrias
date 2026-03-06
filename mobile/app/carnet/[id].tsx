import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPetById, Pet } from '../../src/services/mascotas';
import { getRecordsByPet, getVaccinesByPet, MedicalRecord, Vaccine } from '../../src/services/carnet';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Syringe, ClipboardList, Weight, Thermometer, Calendar, User, ShoppingBag, Plus, Activity, Clock, ShieldCheck, AlertCircle } from 'lucide-react-native';
import WeightSparkline from '../../src/components/WeightSparkline';

const { width, height } = Dimensions.get('window');

export default function PetCarnetDetailScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [activeTab, setActiveTab] = useState<'records' | 'vaccines'>('records');

    const isVet = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const { data: pet, isLoading: loadingPet } = useQuery({
        queryKey: ['pet', id],
        queryFn: () => getPetById(id as string),
    });

    const { data: records = [], isLoading: loadingRecords } = useQuery({
        queryKey: ['pet-records', id],
        queryFn: () => getRecordsByPet(id as string),
    });

    const { data: vaccines = [], isLoading: loadingVaccines } = useQuery({
        queryKey: ['pet-vaccines', id],
        queryFn: () => getVaccinesByPet(id as string),
    });

    if (loadingPet) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const renderRecordItem = ({ item }: { item: MedicalRecord }) => (
        <View style={[styles.recordCard, { backgroundColor: theme.surface }]}>
            <View style={styles.recordTimelineLine} />
            <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />

            <View style={styles.recordContent}>
                <View style={styles.cardHeader}>
                    <View style={[styles.dateBox, { backgroundColor: theme.primary + '10' }]}>
                        <Calendar size={12} color={theme.primary} />
                        <Text style={[styles.dateText, { color: theme.primary }]}>
                            {new Date(item.date).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.consultTypeTag}>
                        <Text style={[styles.consultTypeText, { color: theme.textMuted }]}>CONSULTA</Text>
                    </View>
                </View>

                <Text style={[styles.reason, { color: theme.text }]}>{item.reason_for_visit}</Text>

                <View style={styles.metricsRow}>
                    {item.weight_kg && (
                        <View style={[styles.metricItem, { backgroundColor: '#0891b215' }]}>
                            <Weight size={12} color="#0891b2" />
                            <Text style={[styles.metricValue, { color: '#0891b2' }]}>{item.weight_kg} kg</Text>
                        </View>
                    )}
                    {item.temperature_c && (
                        <View style={[styles.metricItem, { backgroundColor: '#ef444415' }]}>
                            <Thermometer size={12} color="#ef4444" />
                            <Text style={[styles.metricValue, { color: '#ef4444' }]}>{item.temperature_c}°C</Text>
                        </View>
                    )}
                </View>

                {item.diagnosis && (
                    <View style={[styles.diagnosisBox, { backgroundColor: theme.background + '80' }]}>
                        <Text style={[styles.detailLabel, { color: theme.primary }]}>DIAGNÓSTICO CLÍNICO</Text>
                        <Text style={[styles.detailText, { color: theme.text }]}>{item.diagnosis}</Text>
                    </View>
                )}

                {item.treatment && (
                    <View style={[styles.treatmentBox, { backgroundColor: theme.background + '80' }]}>
                        <Text style={[styles.detailLabel, { color: '#0891b2' }]}>TRATAMIENTO</Text>
                        <Text style={[styles.detailText, { color: theme.text }]}>{item.treatment}</Text>
                    </View>
                )}

                {item.notes && (
                    <View style={styles.notesBox}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>NOTAS ADICIONALES</Text>
                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{item.notes}</Text>
                    </View>
                )}

                {item.prescriptions && item.prescriptions.length > 0 && (
                    <View style={[styles.prescriptionBox, { borderColor: '#10b98140' }]}>
                        <View style={styles.prescriptionHeader}>
                            <ShoppingBag size={14} color="#10b981" />
                            <Text style={styles.prescriptionTitle}>RECETA DIGITAL</Text>
                        </View>
                        <View style={styles.prescriptionsList}>
                            {item.prescriptions.map((p, idx) => (
                                <View key={idx} style={styles.prescriptionItem}>
                                    <Text style={[styles.medName, { color: theme.text }]}>{p.medication_name}</Text>
                                    <Text style={[styles.medDose, { color: theme.textMuted }]}>{p.dosage} · Cada {p.frequency_hours}h por {p.duration_days}d</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );

    const renderVaccineItem = ({ item }: { item: Vaccine }) => {
        const isNextDue = item.next_due_date && new Date(item.next_due_date) < new Date();
        return (
            <View style={[styles.vaccineCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.vaccineIconBox, { backgroundColor: isNextDue ? '#ef4444' : theme.primary }]}>
                    <Syringe size={22} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.vaccineHeader}>
                        <Text style={[styles.vaccineName, { color: theme.text }]}>{item.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: isNextDue ? '#ef444420' : '#10b98120' }]}>
                            <Text style={{ color: isNextDue ? '#ef4444' : '#10b981', fontSize: 9, fontWeight: '900' }}>
                                {isNextDue ? 'EXPIRADA' : 'ACTIVA'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.vaccineMeta}>
                        <View style={styles.metaItem}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>Aplicada: {new Date(item.date_administered).toLocaleDateString()}</Text>
                        </View>
                        {item.next_due_date && (
                            <View style={styles.metaItem}>
                                <Clock size={12} color={isNextDue ? '#ef4444' : theme.primary} />
                                <Text style={[styles.metaText, { color: isNextDue ? '#ef4444' : theme.primary, fontWeight: '700' }]}>
                                    Refuerzo: {new Date(item.next_due_date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
                <View style={[styles.hero, { backgroundColor: theme.primary + '08' }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.medicalIdTag}>
                            <Text style={styles.medicalIdText}>PATIENT_ID: {pet?.id.substring(0, 12)}</Text>
                        </View>
                        <TouchableOpacity style={styles.backBtn}>
                            <Activity size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarBorder}>
                                {pet?.photo_url ? (
                                    <Image source={{ uri: pet.photo_url }} style={styles.heroPetImage} />
                                ) : (
                                    <View style={[styles.initials, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.initialsText}>{pet?.name?.[0]}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={[styles.speciesBadge, { backgroundColor: theme.primary }]}>
                                <Text style={{ fontSize: 16 }}>{pet?.species === 'perro' ? '🐶' : '🐱'}</Text>
                            </View>
                        </View>

                        <Text style={[styles.heroPetName, { color: theme.text }]}>{pet?.name}</Text>
                        <Text style={[styles.heroPetBreed, { color: theme.textMuted }]}>
                            {pet?.breed || pet?.species} · {pet?.gender} · {pet?.age_months ? `${Math.floor(pet.age_months / 12)}a ${pet.age_months % 12}m` : 'N/A'}
                        </Text>

                        <View style={styles.quickClinicalSummary}>
                            <View style={[styles.clinicalBadge, { backgroundColor: pet?.is_vaccinated ? '#10b98115' : '#ef444415' }]}>
                                <ShieldCheck size={14} color={pet?.is_vaccinated ? '#10b981' : '#ef4444'} />
                                <Text style={{ color: pet?.is_vaccinated ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: '800' }}>VACUNACIÓN OK</Text>
                            </View>
                            <View style={[styles.clinicalBadge, { backgroundColor: theme.primary + '15' }]}>
                                <Activity size={14} color={theme.primary} />
                                <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800' }}>{records.length} VISITAS</Text>
                            </View>
                        </View>

                        {/* Weight Evolution Sparkline */}
                        {records.filter(r => r.weight_kg).length >= 2 && (
                            <WeightSparkline
                                data={records
                                    .filter(r => r.weight_kg)
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                    .map(r => ({ date: r.date, weight: r.weight_kg! }))
                                }
                                color={theme.primary}
                            />
                        )}
                    </View>
                </View>

                <View style={[styles.tabsWrapper, { backgroundColor: theme.background }]}>
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'records' && { borderBottomColor: theme.primary }]}
                            onPress={() => setActiveTab('records')}
                        >
                            <ClipboardList size={18} color={activeTab === 'records' ? theme.primary : theme.textMuted} />
                            <Text style={[styles.tabText, { color: activeTab === 'records' ? theme.primary : theme.textMuted }]}>Historial</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'vaccines' && { borderBottomColor: theme.primary }]}
                            onPress={() => setActiveTab('vaccines')}
                        >
                            <Syringe size={18} color={activeTab === 'vaccines' ? theme.primary : theme.textMuted} />
                            <Text style={[styles.tabText, { color: activeTab === 'vaccines' ? theme.primary : theme.textMuted }]}>Vacunas</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    scrollEnabled={false}
                    data={activeTab === 'records' ? records : vaccines}
                    keyExtractor={(item: any) => item.id}
                    renderItem={activeTab === 'records' ? (renderRecordItem as any) : (renderVaccineItem as any)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ fontSize: 50, marginBottom: 20 }}>{activeTab === 'records' ? '📝' : '💉'}</Text>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin registros aún</Text>
                            <Text style={{ color: theme.textMuted, textAlign: 'center', paddingHorizontal: 40 }}>
                                No hay información médica registrada para esta mascota en esta sección.
                            </Text>
                        </View>
                    }
                />
            </ScrollView>

            {isVet && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: activeTab === 'records' ? theme.primary : '#0891b2' }]}
                    onPress={() => router.push(activeTab === 'records' ? `/carnet/nueva-consulta?pet_id=${id}` : `/carnet/nueva-vacuna?pet_id=${id}` as any)}
                >
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            )}
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
    hero: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
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
    medicalIdTag: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    medicalIdText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        fontFamily: 'SpaceMono',
    },
    heroContent: {
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 20,
    },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 36,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    heroPetImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    initials: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
    },
    initialsText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '900',
    },
    speciesBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0f0f1a', // Assuming dark bg
    },
    heroPetName: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    heroPetBreed: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
    },
    quickClinicalSummary: {
        flexDirection: 'row',
        gap: 12,
    },
    clinicalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    tabsWrapper: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        gap: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '900',
    },
    list: {
        padding: 24,
        paddingBottom: 100,
    },
    recordCard: {
        marginBottom: 30,
        position: 'relative',
        paddingLeft: 30,
    },
    recordTimelineLine: {
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: -40,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    timelineDot: {
        position: 'absolute',
        left: -4,
        top: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#0f0f1a',
    },
    recordContent: {
        borderRadius: 24,
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '900',
    },
    consultTypeTag: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    consultTypeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    reason: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 16,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    diagnosisBox: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    treatmentBox: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    notesBox: {
        marginTop: 4,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    notesText: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        fontStyle: 'italic',
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    prescriptionBox: {
        marginTop: 4,
        padding: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    prescriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    prescriptionTitle: {
        color: '#10b981',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    prescriptionsList: {
        gap: 10,
    },
    prescriptionItem: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 10,
        borderRadius: 10,
    },
    medName: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    medDose: {
        fontSize: 12,
        fontWeight: '600',
    },
    vaccineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    vaccineIconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vaccineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    vaccineName: {
        fontSize: 16,
        fontWeight: '900',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    vaccineMeta: {
        gap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyState: {
        paddingTop: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    }
});
