import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics } from '../../src/services/directorio';
import { getClinicLabTests, requestLabTest, LabTestCreatePayload } from '../../src/services/laboratory';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, FlaskConical, TestTube2, CheckCircle2, Clock, PlusCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LaboratorioScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [newTest, setNewTest] = useState<LabTestCreatePayload>({
        patientId: '', testType: '', testName: '', description: ''
    });

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: labTests = [], isLoading: loadingTests } = useQuery({
        queryKey: ['clinic-lab', clinic?.id, filter],
        queryFn: () => getClinicLabTests(clinic!.id, filter),
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

    const handleSaveTest = async () => {
        if (!newTest.patientId || !newTest.testName || !newTest.testType) {
            Alert.alert("Error", "ID de Paciente, Tipo y Nombre son obligatorios");
            return;
        }
        setLoadingAction(true);
        try {
            await requestLabTest(clinic!.id, newTest);
            setModalVisible(false);
            setNewTest({ patientId: '', testType: '', testName: '', description: '' });
            Alert.alert("Éxito", "Prueba solicitada correctamente");
        } catch (error) {
            Alert.alert("Error", "No se pudo solicitar la prueba");
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Premium Header */}
            <LinearGradient
                colors={['#0ea5e9', '#0284c7', '#0369a1']}
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
                        <Text style={styles.title}>Laboratorio</Text>
                        <Text style={styles.subtitle}>{clinic?.name}</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <PlusCircle size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Glassmorphic Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'pending' && styles.activeTab]}
                        onPress={() => setFilter('pending')}
                    >
                        <Clock size={16} color={filter === 'pending' ? '#0284c7' : '#fff'} />
                        <Text style={[styles.tabText, { color: filter === 'pending' ? '#0284c7' : '#fff' }]}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'completed' && styles.activeTab]}
                        onPress={() => setFilter('completed')}
                    >
                        <CheckCircle2 size={16} color={filter === 'completed' ? '#0284c7' : '#fff'} />
                        <Text style={[styles.tabText, { color: filter === 'completed' ? '#0284c7' : '#fff' }]}>Completados</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingTests ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : labTests.length === 0 ? (
                        <View style={[styles.emptyRecent, { backgroundColor: theme.surface }]}>
                            <TestTube2 size={40} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, fontWeight: '600', marginTop: 12 }}>No hay pruebas en esta categoría</Text>
                        </View>
                    ) : (
                        labTests.map(test => (
                            <View key={test.id} style={[styles.testCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.testHeader}>
                                    <View style={[styles.testIcon, { backgroundColor: filter === 'pending' ? '#f59e0b15' : '#10b98115' }]}>
                                        <FlaskConical size={20} color={filter === 'pending' ? '#f59e0b' : '#10b981'} />
                                    </View>
                                    <View style={styles.testInfo}>
                                        <Text style={[styles.testName, { color: theme.text }]}>{test.testName}</Text>
                                        <Text style={[styles.testType, { color: theme.textMuted }]}>{test.testType}</Text>
                                    </View>
                                </View>
                                <View style={styles.testFooter}>
                                    <View style={styles.footerItem}>
                                        <Text style={styles.footerLabel}>Paciente ID</Text>
                                        <Text style={[styles.footerValue, { color: theme.text }]}>{test.patientId.substring(0,8)}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <Text style={styles.footerLabel}>Solicitado</Text>
                                        <Text style={[styles.footerValue, { color: theme.text }]}>
                                            {test.requestedDate ? new Date(test.requestedDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Request Test Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Solicitar Prueba</Text>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>ID del Paciente *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newTest.patientId}
                                onChangeText={t => setNewTest({...newTest, patientId: t})}
                                placeholder="UUID del paciente"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Tipo de Prueba *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newTest.testType}
                                onChangeText={t => setNewTest({...newTest, testType: t})}
                                placeholder="Sangre, Orina, Genética..."
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Nombre del Examen *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newTest.testName}
                                onChangeText={t => setNewTest({...newTest, testName: t})}
                                placeholder="Ej. Hemograma Completo"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Notas / Descripción</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 80 }]}
                                value={newTest.description}
                                onChangeText={t => setNewTest({...newTest, description: t})}
                                placeholder="Instrucciones adicionales"
                                placeholderTextColor={theme.textMuted}
                                multiline
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSaveTest}
                                disabled={loadingAction}
                            >
                                {loadingAction ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Solicitar</Text>}
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
        marginBottom: 20
    },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '900', color: '#fff' },
    subtitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    activeTab: { backgroundColor: '#fff' },
    tabText: { fontSize: 13, fontWeight: '800' },
    contentScroll: { flex: 1 },
    content: { padding: 24, paddingBottom: 100 },
    emptyRecent: {
        padding: 40, borderRadius: 24, alignItems: 'center',
        borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 20
    },
    testCard: {
        padding: 16, borderRadius: 20, borderWidth: 1,
        marginBottom: 16
    },
    testHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    testIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    testInfo: { flex: 1 },
    testName: { fontSize: 16, fontWeight: '800' },
    testType: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    testFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
    footerItem: { flex: 1 },
    footerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', color: '#888' },
    footerValue: { fontSize: 13, fontWeight: '700', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});
