import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useLaboratory } from '@/src/hooks/clinica/useLaboratory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { FlaskConical, TestTube2, CheckCircle2, Clock, PlusCircle, Edit3 } from 'lucide-react-native';

export default function LaboratorioScreen() {
    const { theme } = useTheme();
    const {
        filter, setFilter, modalVisible, setModalVisible, loadingAction,
        newTest, setNewTest, loadingClinics, loadingTests, labTests, handleSaveTest,
        resultModalVisible, setResultModalVisible, resultData, setResultData,
        handleOpenResultModal, handleSaveResults, isSavingResults,
    } = useLaboratory();

    if (loadingClinics) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando laboratorio..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Laboratorio"
                gradient={['#0ea5e9', '#0284c7', '#0369a1']}
                rightElement={
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <PlusCircle size={20} color="#fff" />
                    </TouchableOpacity>
                }
            />

            {/* Glassmorphic Tabs */}
            <View style={styles.tabsWrapper}>
                <View style={styles.tabsContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'pending' && styles.activeTab]}
                        onPress={() => setFilter('pending')}
                    >
                        <Clock size={16} color={filter === 'pending' ? '#0284c7' : '#666'} />
                        <Text style={[styles.tabText, { color: filter === 'pending' ? '#0284c7' : '#666' }]}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'completed' && styles.activeTab]}
                        onPress={() => setFilter('completed')}
                    >
                        <CheckCircle2 size={16} color={filter === 'completed' ? '#0284c7' : '#666'} />
                        <Text style={[styles.tabText, { color: filter === 'completed' ? '#0284c7' : '#666' }]}>Completados</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingTests ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                    ) : labTests.length === 0 ? (
                        <EmptyState
                            icon={<TestTube2 size={40} color={theme.textMuted} />}
                            title="No hay pruebas en esta categoría"
                        />
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

                                {filter === 'pending' && (
                                    <TouchableOpacity
                                        style={[styles.resultBtn, { backgroundColor: '#0ea5e915' }]}
                                        onPress={() => handleOpenResultModal(test.id)}
                                    >
                                        <Edit3 size={14} color="#0ea5e9" />
                                        <Text style={[styles.resultBtnText, { color: '#0ea5e9' }]}>Ingresar Resultados</Text>
                                    </TouchableOpacity>
                                )}
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
                        
                        <KeyboardScreen>
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
                        </KeyboardScreen>

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

            {/* Result Entry Modal */}
            <Modal visible={resultModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Ingresar Resultados</Text>
                        
                        <KeyboardScreen>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Resultados *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100 }]}
                                value={resultData.results}
                                onChangeText={t => setResultData({...resultData, results: t})}
                                placeholder="Ingresa los resultados del examen..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Notas Adicionales</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 80 }]}
                                value={resultData.notes}
                                onChangeText={t => setResultData({...resultData, notes: t})}
                                placeholder="Observaciones..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                            />
                        </KeyboardScreen>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setResultModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: '#0ea5e9' }]}
                                onPress={handleSaveResults}
                                disabled={isSavingResults}
                            >
                                {isSavingResults ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsWrapper: { paddingHorizontal: 24, paddingVertical: 16 },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
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
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    resultBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12, marginTop: 12 },
    resultBtnText: { fontSize: 13, fontWeight: '800' },
});
