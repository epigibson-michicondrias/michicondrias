import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics } from '../../src/services/directorio';
import { getClinicPrescriptions, createPrescription, PrescriptionCreatePayload } from '../../src/services/prescriptions';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, FileText, PlusCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RecetasScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
    
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [newPresc, setNewPresc] = useState<PrescriptionCreatePayload>({
        patientId: '',
        veterinarianId: 'V-1',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
    });

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: prescriptions = [], isLoading: loadingPrescriptions } = useQuery({
        queryKey: ['clinic-prescriptions', clinic?.id],
        queryFn: () => getClinicPrescriptions(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    if (loadingClinics) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const handleSavePrescription = async () => {
        if (!newPresc.patientId || !newPresc.medications[0].name) {
            Alert.alert("Error", "ID de Paciente y al menos un medicamento son obligatorios");
            return;
        }
        setLoadingAction(true);
        try {
            await createPrescription(clinic!.id, newPresc);
            setModalVisible(false);
            setNewPresc({
                patientId: '',
                veterinarianId: 'V-1',
                medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
                notes: ''
            });
            Alert.alert("Éxito", "Receta emitida correctamente");
        } catch (error) {
            Alert.alert("Error", "No se pudo crear la receta");
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Premium Header */}
            <LinearGradient
                colors={['#10b981', '#059669', '#047857']}
                style={[styles.premiumHeader, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Recetas Médicas</Text>
                        <Text style={styles.subtitle}>{clinic?.name}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <PlusCircle size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingPrescriptions ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : prescriptions.length === 0 ? (
                        <View style={[styles.emptyRecent, { backgroundColor: theme.surface }]}>
                            <FileText size={40} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, fontWeight: '600', marginTop: 12 }}>No hay recetas emitidas</Text>
                        </View>
                    ) : (
                        prescriptions.map(presc => (
                            <View key={presc.id} style={[styles.prescCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.prescHeader}>
                                    <View style={[styles.prescIcon, { backgroundColor: '#10b98115' }]}>
                                        <FileText size={20} color="#10b981" />
                                    </View>
                                    <View style={styles.prescInfo}>
                                        <Text style={[styles.patientLabel, { color: theme.textMuted }]}>Paciente ID: {presc.patientId.substring(0,8)}</Text>
                                        <Text style={[styles.dateLabel, { color: theme.text }]}>
                                            Emitida: {presc.issuedDate ? new Date(presc.issuedDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: presc.status === 'active' ? '#10b98120' : '#f59e0b20' }]}>
                                        <Text style={[styles.statusText, { color: presc.status === 'active' ? '#10b981' : '#f59e0b' }]}>
                                            {presc.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.medsContainer}>
                                    {presc.medications.map((med, idx) => (
                                        <View key={idx} style={styles.medRow}>
                                            <View style={styles.medDot} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.medName, { color: theme.text }]}>{med.name}</Text>
                                                <Text style={[styles.medDetails, { color: theme.textMuted }]}>
                                                    {med.dosage} - {med.frequency} por {med.duration}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                
                                {presc.notes && (
                                    <View style={[styles.notesBox, { backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                                        <AlertCircle size={14} color={theme.textMuted} />
                                        <Text style={[styles.notesText, { color: theme.textMuted }]}>{presc.notes}</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Create Prescription Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Receta</Text>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>ID del Paciente *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newPresc.patientId}
                                onChangeText={t => setNewPresc({...newPresc, patientId: t})}
                                placeholder="UUID del paciente"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 24, fontSize: 14 }]}>Medicamento 1</Text>
                            
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Nombre *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newPresc.medications[0].name}
                                onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], name: t }]
                                })}
                                placeholder="Ej. Amoxicilina 500mg"
                                placeholderTextColor={theme.textMuted}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Dosis</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newPresc.medications[0].dosage}
                                        onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], dosage: t }]
                                        })}
                                        placeholder="1 tableta"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Frecuencia</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newPresc.medications[0].frequency}
                                        onChangeText={t => setNewPresc({
                                            ...newPresc, 
                                            medications: [{ ...newPresc.medications[0], frequency: t }]
                                        })}
                                        placeholder="Cada 8 horas"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Duración</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newPresc.medications[0].duration}
                                onChangeText={t => setNewPresc({
                                    ...newPresc, 
                                    medications: [{ ...newPresc.medications[0], duration: t }]
                                })}
                                placeholder="Por 7 días"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 24 }]}>Notas Adicionales</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 80 }]}
                                value={newPresc.notes}
                                onChangeText={t => setNewPresc({...newPresc, notes: t})}
                                placeholder="Tomar con alimentos..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                            />
                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSavePrescription}
                                disabled={loadingAction}
                            >
                                {loadingAction ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Emitir</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    premiumHeader: { 
        paddingHorizontal: 24, 
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    contentScroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 100 },
    emptyRecent: {
        padding: 40, borderRadius: 24, alignItems: 'center',
        borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 20
    },
    prescCard: {
        padding: 16, borderRadius: 20, borderWidth: 1,
        marginBottom: 16
    },
    prescHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    prescIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    prescInfo: { flex: 1 },
    patientLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    dateLabel: { fontSize: 14, fontWeight: '800' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    medsContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
    medRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
    medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginTop: 6 },
    medName: { fontSize: 15, fontWeight: '800' },
    medDetails: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    notesBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, marginTop: 4 },
    notesText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});
