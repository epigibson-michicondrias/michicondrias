import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { useLaboratory } from '@/src/hooks/clinica/useLaboratory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import PatientPicker from '@/src/features/salud/PatientPicker';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { FlaskConical, TestTube2, CheckCircle2, Clock, Plus, Edit3 } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

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
                actions={[{ icon: Plus, label: 'Nueva orden de laboratorio', onPress: () => setModalVisible(true) }]}
            />

            {/* Glassmorphic Tabs */}
            <View style={styles.tabsWrapper}>
                <View style={[styles.tabsContainer, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'pending' && { backgroundColor: theme.info + '20' }]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: filter === 'pending' }}
                        onPress={() => setFilter('pending')}
                    >
                        <Clock size={16} color={filter === 'pending' ? theme.info : theme.textMuted} />
                        <Text style={[styles.tabText, { color: filter === 'pending' ? theme.info : theme.textMuted }]}>Pendientes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, filter === 'completed' && { backgroundColor: theme.info + '20' }]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: filter === 'completed' }}
                        onPress={() => setFilter('completed')}
                    >
                        <CheckCircle2 size={16} color={filter === 'completed' ? theme.info : theme.textMuted} />
                        <Text style={[styles.tabText, { color: filter === 'completed' ? theme.info : theme.textMuted }]}>Completados</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    
                    {loadingTests ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: spacing.huge }} />
                    ) : labTests.length === 0 ? (
                        <EmptyState
                            icon={<TestTube2 size={40} color={theme.textMuted} />}
                            title="No hay pruebas en esta categoría"
                        />
                    ) : (
                        labTests.map(test => (
                            <View key={test.id} style={[styles.testCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={styles.testHeader}>
                                    <View style={[styles.testIcon, { backgroundColor: filter === 'pending' ? theme.warning + '15' : theme.success + '15' }]}>
                                        <FlaskConical size={20} color={filter === 'pending' ? theme.warning : theme.success} />
                                    </View>
                                    <View style={styles.testInfo}>
                                        <Text style={[styles.testName, { color: theme.text }]}>{test.testName}</Text>
                                        <Text style={[styles.testType, { color: theme.textMuted }]}>{test.testType}</Text>
                                    </View>
                                </View>
                                <View style={styles.testFooter}>
                                    <View style={styles.footerItem}>
                                        <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Paciente</Text>
                                        <Text style={[styles.footerValue, { color: theme.text }]}>{test.patientName || 'Paciente'}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Solicitado</Text>
                                        <Text style={[styles.footerValue, { color: theme.text }]}>
                                            {test.requestedDate ? new Date(test.requestedDate).toLocaleDateString('es-MX') : 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                {filter === 'completed' && !!test.results && (
                                    <View style={[styles.resultBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Resultados</Text>
                                        <Text style={{ color: theme.text, fontSize: font.base, marginTop: spacing.xs }}>{typeof test.results === 'string' ? test.results : JSON.stringify(test.results)}</Text>
                                        {!!test.interpretation && <Text style={{ color: theme.textMuted, fontSize: font.md, marginTop: spacing.sm }}>{test.interpretation}</Text>}
                                    </View>
                                )}

                                {filter === 'pending' && (
                                    <TouchableOpacity
                                        style={[styles.resultBtn, { backgroundColor: theme.info + '15' }]}
                                        onPress={() => handleOpenResultModal(test.id)}
                                    >
                                        <Edit3 size={14} color={theme.info} />
                                        <Text style={[styles.resultBtnText, { color: theme.info }]}>Ingresar Resultados</Text>
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
                            <PatientPicker value={newTest.patientId} onChange={(id) => setNewTest({ ...newTest, patientId: id })} />

                            <FormField label="Tipo de Prueba *" value={newTest.testType} onChangeText={t => setNewTest({...newTest, testType: t})} placeholder="Sangre, Orina, Genética..." />

                            <FormField label="Nombre del Examen *" value={newTest.testName} onChangeText={t => setNewTest({...newTest, testName: t})} placeholder="Ej. Hemograma Completo" />

                            <FormField label="Notas / Descripción" value={newTest.description ?? ''} onChangeText={t => setNewTest({...newTest, description: t})} placeholder="Instrucciones adicionales" multiline />
                        </KeyboardScreen>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.surface }]} onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel="Cancelar">
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <Button label="Solicitar" onPress={handleSaveTest} loading={loadingAction} />
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
                            <FormField label="Resultados *" value={resultData.results} onChangeText={t => setResultData({...resultData, results: t})} placeholder="Ingresa los resultados del examen..." multiline />

                            <FormField label="Notas Adicionales" value={resultData.notes} onChangeText={t => setResultData({...resultData, notes: t})} placeholder="Observaciones..." multiline />
                        </KeyboardScreen>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.surface }]} onPress={() => setResultModalVisible(false)} accessibilityRole="button" accessibilityLabel="Cancelar">
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <Button label="Guardar" onPress={handleSaveResults} loading={isSavingResults} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsWrapper: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.lg },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: spacing.xs,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    tabText: { fontSize: font.base, fontWeight: '800' },
    contentScroll: { flex: 1 },
    content: { padding: spacing.xxl, paddingBottom: 100 },
    testCard: {
        padding: spacing.lg, borderRadius: 20, borderWidth: 1,
        marginBottom: spacing.lg
    },
    testHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
    testIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    testInfo: { flex: 1 },
    testName: { fontSize: font.xl, fontWeight: '800' },
    testType: { fontSize: font.md, fontWeight: '600', marginTop: spacing.xxs },
    testFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.15)', paddingTop: spacing.lg },
    footerItem: { flex: 1 },
    footerLabel: { fontSize: font.xs, fontWeight: '700', textTransform: 'uppercase' },
    footerValue: { fontSize: font.base, fontWeight: '700', marginTop: spacing.xs },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: spacing.xxl, paddingBottom: spacing.huge, maxHeight: '80%' },
    modalTitle: { fontSize: font.h3, fontWeight: '900', marginBottom: spacing.xl },
    inputLabel: { fontSize: font.md, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.lg },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.lg, fontSize: font.lg, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxxl },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: font.lg, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
    resultBox: { padding: spacing.md, borderRadius: 12, borderWidth: 1, marginTop: spacing.md },
    resultBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderRadius: 12, marginTop: spacing.md },
    resultBtnText: { fontSize: font.base, fontWeight: '800' },
});
