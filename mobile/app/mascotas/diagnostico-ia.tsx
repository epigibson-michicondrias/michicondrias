import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/AuthContext';
import { getUserPets, aiSymptomCheck, aiDietPlan, SymptomCheckResponse, DietPlanResponse } from '../../src/services/mascotas';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Sparkles, AlertTriangle, ShieldAlert, Heart, Info, Clipboard, Activity } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import KeyboardScreen from '../../src/components/KeyboardScreen';

const { width } = Dimensions.get('window');

export default function DiagnosticoIAScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [activeTab, setActiveTab] = useState<'triage' | 'diet'>('triage');

    // Triage State
    const [symptoms, setSymptoms] = useState('');
    const [durationHours, setDurationHours] = useState('12');
    const [triageLoading, setTriageLoading] = useState(false);
    const [triageResult, setTriageResult] = useState<SymptomCheckResponse | null>(null);

    // Diet Plan State
    const [selectedPetId, setSelectedPetId] = useState('');
    const [activityLevel, setActivityLevel] = useState('medio');
    const [allergies, setAllergies] = useState('');
    const [targetWeight, setTargetWeight] = useState('');
    const [dietLoading, setDietLoading] = useState(false);
    const [dietResult, setDietResult] = useState<DietPlanResponse | null>(null);

    // Fetch user pets for diet planner selection
    const { data: pets = [], isLoading: loadingPets } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => user ? getUserPets(user.id) : Promise.resolve([]),
        enabled: !!user?.id,
    });

    const handleSymptomCheck = async () => {
        if (!symptoms.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor ingresa una descripción de los síntomas.' });
            return;
        }

        setTriageLoading(true);
        setTriageResult(null);
        try {
            const res = await aiSymptomCheck({
                symptom_description: symptoms,
                duration_hours: parseInt(durationHours, 10) || 12,
            });
            setTriageResult(res);
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo completar el análisis de la IA.' });
        } finally {
            setTriageLoading(false);
        }
    };

    const handleDietPlan = async () => {
        if (!selectedPetId) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor selecciona una mascota.' });
            return;
        }

        setDietLoading(true);
        setDietResult(null);
        try {
            const res = await aiDietPlan(selectedPetId, {
                activity_level: activityLevel,
                allergies: allergies.trim() ? allergies : undefined,
                target_weight_kg: targetWeight ? parseFloat(targetWeight) : undefined,
            });
            setDietResult(res);
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo generar el plan de nutrición.' });
        } finally {
            setDietLoading(false);
        }
    };

    const getTriageColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'alta': return '#ef4444';
            case 'media': return '#f59e0b';
            case 'baja': return '#10b981';
            default: return theme.primary;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Sparkles size={20} color="#fcd34d" />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Michi-IA Asistente</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Custom Segmented Control */}
            <View style={[styles.tabBar, { borderColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'triage' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
                    onPress={() => setActiveTab('triage')}
                >
                    <Activity size={18} color={activeTab === 'triage' ? theme.primary : theme.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'triage' ? theme.text : theme.textMuted }]}>
                        Sintomatología
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'diet' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
                    onPress={() => setActiveTab('diet')}
                >
                    <Heart size={18} color={activeTab === 'diet' ? theme.primary : theme.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'diet' ? theme.primary : theme.textMuted }]}>
                        Nutrición IA
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardScreen contentContainerStyle={{ paddingHorizontal: 24 }}>
                {activeTab === 'triage' ? (
                    <View style={styles.formContainer}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Analizador Clínico Pre-Diagnóstico
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                            Nuestra IA simula una evaluación de triaje basada en los síntomas descritos.
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>¿Qué síntomas presenta tu mascota?</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                multiline
                                numberOfLines={4}
                                placeholder="Describe detalladamente lo que notas (ej. vomito constante, no quiere comer, diarrea, sangrado, letargo)..."
                                placeholderTextColor={theme.textMuted}
                                value={symptoms}
                                onChangeText={setSymptoms}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>¿Hace cuántas horas comenzaron los síntomas?</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                keyboardType="numeric"
                                placeholder="Ej. 12"
                                placeholderTextColor={theme.textMuted}
                                value={durationHours}
                                onChangeText={setDurationHours}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSymptomCheck}
                            disabled={triageLoading}
                        >
                            {triageLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Sparkles size={20} color="#fff" />
                                    <Text style={styles.submitBtnText}>Iniciar Análisis Clínico</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {triageResult && (
                            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: getTriageColor(triageResult.urgency) }]}>
                                <View style={styles.resultHeader}>
                                    <ShieldAlert size={24} color={getTriageColor(triageResult.urgency)} />
                                    <Text style={[styles.resultTitle, { color: getTriageColor(triageResult.urgency) }]}>
                                        {triageResult.triage_level}
                                    </Text>
                                </View>

                                <Text style={[styles.resultText, { color: theme.text }]}>
                                    {triageResult.summary}
                                </Text>

                                <View style={[styles.recommendationBox, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.boxTitle, { color: theme.text }]}>Plan de Acción Recomendado:</Text>
                                    <Text style={[styles.boxText, { color: theme.text }]}>
                                        {triageResult.action_plan}
                                    </Text>
                                </View>

                                <View style={styles.disclaimerContainer}>
                                    <Info size={16} color={theme.textMuted} />
                                    <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>
                                        {triageResult.disclaimer}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Planificador Nutricional Personalizado
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                            Genera una guía de alimentación equilibrada y cálculo calórico por IA.
                        </Text>

                        {loadingPets ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : pets.length === 0 ? (
                            <View style={[styles.emptyPetsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <AlertTriangle size={24} color="#f59e0b" />
                                <Text style={[styles.emptyPetsText, { color: theme.text }]}>
                                    Necesitas registrar al menos una mascota para generar un plan nutricional.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Selecciona tu Mascota</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <Picker
                                            selectedValue={selectedPetId}
                                            onValueChange={(val) => setSelectedPetId(val)}
                                            style={{ color: theme.text }}
                                        >
                                            <Picker.Item label="-- Elige una mascota --" value="" />
                                            {pets.map((pet) => (
                                                <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Nivel de Actividad Física</Text>
                                    <View style={[styles.pickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <Picker
                                            selectedValue={activityLevel}
                                            onValueChange={(val) => setActivityLevel(val)}
                                            style={{ color: theme.text }}
                                        >
                                            <Picker.Item label="Bajo (Poco ejercicio)" value="bajo" />
                                            <Picker.Item label="Medio (Normal/Juegos)" value="medio" />
                                            <Picker.Item label="Alto (Deportivo/Activo)" value="alto" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Alergias Conocidas (Opcional)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        placeholder="Ej. Pollo, pescado, granos..."
                                        placeholderTextColor={theme.textMuted}
                                        value={allergies}
                                        onChangeText={setAllergies}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Peso Objetivo en kg (Opcional)</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        keyboardType="numeric"
                                        placeholder="Ej. 8.5"
                                        placeholderTextColor={theme.textMuted}
                                        value={targetWeight}
                                        onChangeText={setTargetWeight}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                    onPress={handleDietPlan}
                                    disabled={dietLoading}
                                >
                                    {dietLoading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Sparkles size={20} color="#fff" />
                                            <Text style={styles.submitBtnText}>Generar Plan de Dieta</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {dietResult && (
                            <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                                <View style={styles.resultHeader}>
                                    <Clipboard size={24} color={theme.primary} />
                                    <Text style={[styles.resultTitle, { color: theme.text }]}>
                                        Guía de Nutrición IA
                                    </Text>
                                </View>

                                <View style={styles.metricRow}>
                                    <View style={[styles.metricBox, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.metricVal, { color: theme.primary }]}>
                                            {dietResult.resting_energy_requirement_kcal}
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>RER (kcal/día)</Text>
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.metricVal, { color: '#10b981' }]}>
                                            {dietResult.daily_energy_needs_kcal}
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Meta Calórica</Text>
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.metricVal, { color: '#0ea5e9' }]}>
                                            {dietResult.hydration_target_ml}ml
                                        </Text>
                                        <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Hidratación</Text>
                                    </View>
                                </View>

                                <View style={[styles.recommendationBox, { backgroundColor: theme.background }]}>
                                    <Text style={[styles.boxTitle, { color: theme.text }]}>Pauta de Dieta Sugerida:</Text>
                                    <Text style={[styles.boxText, { color: theme.text, lineHeight: 20 }]}>
                                        {dietResult.recommended_diet}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </KeyboardScreen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 24,
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {},
    tabText: {
        fontSize: 14,
        fontWeight: '800',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    formContainer: {
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 8,
    },
    input: {
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    textArea: {
        height: 120,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderWidth: 1,
        fontSize: 15,
        fontWeight: '600',
        textAlignVertical: 'top',
    },
    pickerContainer: {
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    submitBtn: {
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
        marginBottom: 30,
        elevation: 4,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    resultCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        gap: 16,
        marginBottom: 30,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '900',
    },
    resultText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    recommendationBox: {
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    boxTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    boxText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    disclaimerContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
        opacity: 0.8,
    },
    disclaimerText: {
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
        lineHeight: 16,
    },
    emptyPetsCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    emptyPetsText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 20,
    },
    metricRow: {
        flexDirection: 'row',
        gap: 10,
    },
    metricBox: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    metricVal: {
        fontSize: 18,
        fontWeight: '900',
    },
    metricLabel: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    }
});
