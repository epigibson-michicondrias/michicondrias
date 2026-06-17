import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { usePetCarnet } from '@/src/hooks/carnet/usePetCarnet';
import type { MedicalRecord, Vaccine } from '@/src/services/carnet';
import type { ReminderWithDetails } from '@/src/services/reminders';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { Syringe, ClipboardList, Weight, Thermometer, Calendar, User, ShoppingBag, Plus, Activity, Clock, ShieldCheck, AlertCircle, Bell, Pill, Check, ChevronDown, ChevronUp, FlaskConical, Info } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import WeightSparkline from '../../src/components/WeightSparkline';

const { width, height } = Dimensions.get('window');

export default function PetCarnetDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    const {
        petId,
        pet,
        loadingPet,
        records,
        loadingRecords,
        vaccines,
        loadingVaccines,
        reminders,
        loadingReminders,
        labHistory,
        loadingLabHistory,
        activeTab,
        setActiveTab,
        isVet,
        handleAddRecord,
        handleAddVaccine,
        handleCheck,
    } = usePetCarnet();

    const isLoadingTab = useMemo(() => {
        if (activeTab === 'records') return loadingRecords;
        if (activeTab === 'vaccines') return loadingVaccines;
        if (activeTab === 'reminders') return loadingReminders;
        if (activeTab === 'laboratorio') return loadingLabHistory;
        return false;
    }, [activeTab, loadingRecords, loadingVaccines, loadingReminders, loadingLabHistory]);

    const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({});

    const toggleExpandRecord = (id: string) => {
        setExpandedRecords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const sortedRecords = useMemo(() => {
        return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [records]);

    if (loadingPet) {
        return (
            <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenContainer>
        );
    }

    const renderRecordItem = ({ item }: { item: MedicalRecord }) => {
        const isExpanded = !!expandedRecords[item.id];
        return (
            <View style={[styles.recordCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.recordTimelineLine, { backgroundColor: theme.borderLight }]} />
                <View style={[styles.timelineDot, { backgroundColor: theme.primary, borderColor: theme.background }]} />

                <View style={[styles.recordContent, { backgroundColor: theme.overlay, borderColor: theme.borderLight }]}>
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={() => toggleExpandRecord(item.id)}
                        style={styles.recordHeaderTrigger}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.dateBox, { backgroundColor: theme.primary + '10' }]}>
                                <Calendar size={12} color={theme.primary} />
                                <Text style={[styles.dateText, { color: theme.primary }]}>
                                    {new Date(item.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.headerRightActions}>
                                <View style={[styles.consultTypeTag, { backgroundColor: theme.overlay }]}>
                                    <Text style={[styles.consultTypeText, { color: theme.textMuted }]}>CONSULTA</Text>
                                </View>
                                {isExpanded ? (
                                    <ChevronUp size={14} color={theme.textMuted} style={{ marginLeft: 8 }} />
                                ) : (
                                    <ChevronDown size={14} color={theme.textMuted} style={{ marginLeft: 8 }} />
                                )}
                            </View>
                        </View>

                        <Text style={[styles.reason, { color: theme.text }]} numberOfLines={isExpanded ? undefined : 2}>
                            {item.reason_for_visit}
                        </Text>

                        {!isExpanded && (
                            <View style={styles.summaryPillsRow}>
                                {item.weight_kg && (
                                    <View style={[styles.summaryPill, { backgroundColor: '#0891b210' }]}>
                                        <Text style={[styles.summaryPillText, { color: '#0891b2' }]}>⚖️ {item.weight_kg} kg</Text>
                                    </View>
                                )}
                                {item.temperature_c && (
                                    <View style={[styles.summaryPill, { backgroundColor: '#ef444410' }]}>
                                        <Text style={[styles.summaryPillText, { color: '#ef4444' }]}>🌡️ {item.temperature_c}°C</Text>
                                    </View>
                                )}
                                {item.prescriptions && item.prescriptions.length > 0 && (
                                    <View style={[styles.summaryPill, { backgroundColor: '#10b98110' }]}>
                                        <Text style={[styles.summaryPillText, { color: '#10b981' }]}>💊 Receta</Text>
                                    </View>
                                )}
                                {!item.weight_kg && !item.temperature_c && (!item.prescriptions || item.prescriptions.length === 0) && (
                                    <View style={[styles.summaryPill, { backgroundColor: theme.borderLight + '40' }]}>
                                        <Text style={[styles.summaryPillText, { color: theme.textMuted }]}>📄 Visita</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>

                    {isExpanded && (
                        <View style={styles.expandedDetails}>
                            <View style={[styles.metricsRow, { borderTopColor: theme.borderLight, borderTopWidth: 1, paddingTop: 12, marginTop: 8 }]}>
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
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => router.push({ pathname: `/carnet/receta/${item.id}`, params: { petId: pet?.id } } as any)}
                                    style={[styles.prescriptionBox, { borderColor: '#10b98140' }]}
                                >
                                    <View style={styles.prescriptionHeader}>
                                        <ShoppingBag size={14} color="#10b981" />
                                        <Text style={styles.prescriptionTitle}>RECETA DIGITAL (Tocar para ver)</Text>
                                    </View>
                                    <View style={styles.prescriptionsList}>
                                        {item.prescriptions.map((p, idx) => (
                                            <View key={idx} style={[styles.prescriptionItem, { backgroundColor: theme.inputBg }]}>
                                                <Text style={[styles.medName, { color: theme.text }]}>{p.medication_name}</Text>
                                                <Text style={[styles.medDose, { color: theme.textMuted }]}>{p.dosage} · Cada {p.frequency_hours}h por {p.duration_days}d</Text>
                                                {p.instructions && (
                                                    <View style={[styles.instructionsContainer, { borderTopColor: theme.borderLight }]}>
                                                        <Text style={[styles.medInstructions, { color: theme.textMuted }]}>
                                                            📋 Instrucciones: {p.instructions}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderVaccineItem = ({ item }: { item: Vaccine }) => {
        const isNextDue = item.next_due_date && new Date(item.next_due_date) < new Date();
        return (
            <View style={[styles.vaccineCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
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

    const renderReminderItem = ({ item }: { item: ReminderWithDetails }) => {
        const overdue = !item.sent && new Date(item.remind_at).getTime() < Date.now();
        const statusColor = item.sent ? '#10b981' : overdue ? '#ef4444' : theme.primary;
        const date = new Date(item.remind_at);
        const diffMs = date.getTime() - Date.now();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        let timeLabel = '';
        if (item.sent) timeLabel = 'Completado';
        else if (diffMs < 0) timeLabel = 'Atrasado';
        else if (diffHours < 1) timeLabel = 'En <1h';
        else if (diffHours < 24) timeLabel = `En ${diffHours}h`;
        else if (diffDays === 1) timeLabel = 'Mañana';
        else timeLabel = `En ${diffDays}d`;

        return (
            <View style={[styles.reminderCard, { backgroundColor: theme.surface, borderColor: overdue ? '#ef444430' : theme.borderLight }]}>
                <View style={[styles.reminderIcon, { backgroundColor: statusColor + '15' }]}>
                    <Pill size={22} color={statusColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.vaccineHeader}>
                        <Text style={[styles.vaccineName, { color: theme.text }]}>{item.medication_name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: item.sent ? '#10b98120' : overdue ? '#ef444420' : '#f59e0b20' }]}>
                            <Text style={{ color: item.sent ? '#10b981' : overdue ? '#ef4444' : '#f59e0b', fontSize: 9, fontWeight: '900' }}>
                                {item.sent ? 'COMPLETADO' : overdue ? 'ATRASADO' : 'PENDIENTE'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.medDose, { color: theme.textMuted, marginBottom: 6 }]}>
                        {item.dosage} · Cada {item.frequency_hours}h · {item.duration_days}d
                    </Text>
                    <View style={styles.vaccineMeta}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={statusColor} />
                            <Text style={[styles.metaText, { color: statusColor, fontWeight: '700' }]}>
                                {timeLabel}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                    {!item.sent && (
                        <TouchableOpacity
                            style={[styles.checkBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => handleCheck(item.id)}
                        >
                            <Check size={16} color={theme.primary} />
                            <Text style={[styles.checkBtnText, { color: theme.primary }]}>Marcar como Tomado</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderLabItem = ({ item }: { item: any }) => {
        const isAnomaly = item.is_anomaly;
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'Sin fecha';

        return (
            <View style={[styles.labResultCard, { backgroundColor: theme.surface, borderColor: isAnomaly ? '#ef444430' : theme.borderLight }]}>
                <View style={[styles.labResultIconBox, { backgroundColor: isAnomaly ? '#ef444415' : theme.primary + '15' }]}>
                    <FlaskConical size={22} color={isAnomaly ? '#ef4444' : theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.labResultHeader}>
                        <Text style={[styles.labResultName, { color: theme.text }]}>{item.parameter_name}</Text>
                        {isAnomaly && (
                            <View style={[styles.anomalyBadge, { backgroundColor: '#ef444420' }]}>
                                <AlertCircle size={10} color="#ef4444" />
                                <Text style={styles.anomalyBadgeText}>FUERA DE RANGO</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.labResultMeta}>
                        <View style={styles.metaItem}>
                            <Activity size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.text, fontWeight: '700' }]}>
                                Valor: {item.measured_value} {item.unit || ''}
                            </Text>
                        </View>
                        {item.reference_range && (
                            <View style={styles.metaItem}>
                                <Info size={12} color={theme.textMuted} />
                                <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                    Rango ref: {item.reference_range} {item.unit || ''}
                                </Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Calendar size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>
                                Fecha: {dateStr}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
                <View style={[styles.hero, { backgroundColor: theme.primary + '08' }]}>
                    <View style={styles.headerTop}>
                        <BackButton onPress={() => router.back()} />
                        <View style={styles.medicalIdTag}>
                            <Text style={styles.medicalIdText}>PATIENT_ID: {pet?.id.substring(0, 12)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.backBtn, { backgroundColor: theme.borderLight, borderColor: theme.borderLight }]}
                            onPress={() => router.push({ pathname: '/mascotas/diagnostico-ia', params: { petId: pet?.id } } as any)}
                        >
                            <Activity size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.avatarWrapper}>
                            <View style={[styles.avatarBorder, { backgroundColor: theme.border, borderColor: theme.border }]}>
                                {pet?.photo_url ? (
                                    <Image source={{ uri: pet.photo_url }} style={styles.heroPetImage} />
                                ) : (
                                    <View style={[styles.initials, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.initialsText}>{pet?.name?.[0]}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={[styles.speciesBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                                <Text style={{ fontSize: 16 }}>{pet?.species === 'perro' ? '🐶' : '🐱'}</Text>
                            </View>
                        </View>

                        <Text style={[styles.heroPetName, { color: theme.text }]}>{pet?.name}</Text>
                        <Text style={[styles.heroPetBreed, { color: theme.textMuted }]}>
                            {pet?.breed || pet?.species} · {pet?.gender} · {pet?.age_months ? `${Math.floor(pet.age_months / 12)}a ${pet.age_months % 12}m` : 'N/A'}
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.quickClinicalSummary}
                            style={styles.summaryScroll}
                        >
                            <View style={[styles.clinicalBadge, { backgroundColor: pet?.is_vaccinated ? '#10b98115' : '#ef444415' }]}>
                                <ShieldCheck size={14} color={pet?.is_vaccinated ? '#10b981' : '#ef4444'} />
                                <Text style={{ color: pet?.is_vaccinated ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: '800' }}>VACUNACIÓN OK</Text>
                            </View>
                            {pet?.is_sterilized && (
                                <View style={[styles.clinicalBadge, { backgroundColor: '#8b5cf615' }]}>
                                    <Text style={{ color: '#8b5cf6', fontSize: 11, fontWeight: '800' }}>✨ ESTERILIZADO</Text>
                                </View>
                            )}
                            {pet?.is_dewormed && (
                                <View style={[styles.clinicalBadge, { backgroundColor: '#0ea5e915' }]}>
                                    <Text style={{ color: '#0ea5e9', fontSize: 11, fontWeight: '800' }}>🐛 DESPARASITADO</Text>
                                </View>
                            )}
                            <View style={[styles.clinicalBadge, { backgroundColor: theme.primary + '15' }]}>
                                <Activity size={14} color={theme.primary} />
                                <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800' }}>{records.length} VISITAS</Text>
                            </View>
                        </ScrollView>

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

                    <View style={[styles.tabsWrapper, { backgroundColor: theme.background, borderTopColor: theme.borderLight }]}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                    >
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
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'reminders' && { borderBottomColor: theme.primary }]}
                            onPress={() => setActiveTab('reminders')}
                        >
                            <Bell size={18} color={activeTab === 'reminders' ? theme.primary : theme.textMuted} />
                            <Text style={[styles.tabText, { color: activeTab === 'reminders' ? theme.primary : theme.textMuted }]}>Recordatorios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'laboratorio' && { borderBottomColor: theme.primary }]}
                            onPress={() => setActiveTab('laboratorio')}
                        >
                            <FlaskConical size={18} color={activeTab === 'laboratorio' ? theme.primary : theme.textMuted} />
                            <Text style={[styles.tabText, { color: activeTab === 'laboratorio' ? theme.primary : theme.textMuted }]}>Laboratorios</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <FlatList
                    scrollEnabled={false}
                    data={activeTab === 'records' ? sortedRecords : activeTab === 'vaccines' ? vaccines : activeTab === 'reminders' ? reminders : labHistory}
                    keyExtractor={(item: any) => item.id}
                    renderItem={activeTab === 'records' ? (renderRecordItem as any) : activeTab === 'vaccines' ? (renderVaccineItem as any) : activeTab === 'reminders' ? (renderReminderItem as any) : (renderLabItem as any)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        isLoadingTab ? (
                            <View style={[styles.emptyState, { minHeight: 200, justifyContent: 'center' }]}>
                                <ActivityIndicator size="large" color={theme.primary} />
                                <Text style={[styles.emptyTitle, { color: theme.textMuted, marginTop: 16 }]}>
                                    Cargando información...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={{ fontSize: 50, marginBottom: 20 }}>
                                    {activeTab === 'records' ? '📝' : activeTab === 'vaccines' ? '💉' : activeTab === 'reminders' ? '🔔' : '🔬'}
                                </Text>
                                <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin registros aún</Text>
                                <Text style={{ color: theme.textMuted, textAlign: 'center', paddingHorizontal: 40 }}>
                                    {activeTab === 'reminders'
                                        ? 'Los recordatorios de medicamentos se generan automáticamente cuando se crea una consulta con receta.'
                                        : activeTab === 'laboratorio'
                                        ? 'No hay resultados de laboratorio registrados para esta mascota.'
                                        : 'No hay información médica registrada para esta mascota en esta sección.'}
                                </Text>
                            </View>
                        )
                    }
                />
            </ScrollView>

            {isVet && activeTab !== 'reminders' && activeTab !== 'laboratorio' && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: activeTab === 'records' ? theme.primary : '#0891b2' }]}
                    onPress={activeTab === 'records' ? handleAddRecord : handleAddVaccine}
                >
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>
            )}
        </ScreenContainer>
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
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
        borderWidth: 1,
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
        paddingHorizontal: 24,
    },
    summaryScroll: {
        width: '100%',
        marginTop: 20,
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
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
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
    },
    timelineDot: {
        position: 'absolute',
        left: -4,
        top: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
    },
    recordContent: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
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
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    reminderIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vaccineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        marginBottom: 16,
        borderWidth: 1,
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
        flex: 1,
        marginRight: 8,
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
    },
    checkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 12,
    },
    checkBtnText: {
        fontSize: 13,
        fontWeight: '800',
    },
    instructionsContainer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
    },
    medInstructions: {
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    recordHeaderTrigger: {
        padding: 2,
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryPillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 10,
    },
    summaryPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    summaryPillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    expandedDetails: {
        marginTop: 4,
    },
    labResultCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
        gap: 14,
    },
    labResultIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labResultName: {
        fontSize: 15,
        fontWeight: '800',
        flex: 1,
        marginRight: 8,
    },
    anomalyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    anomalyBadgeText: {
        color: '#ef4444',
        fontSize: 9,
        fontWeight: '900',
    },
    labResultMeta: {
        gap: 4,
    },
});
