import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSchedule, ScheduleDay, Holiday } from '@/src/hooks/clinica';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { showAlert } from '@/src/components/AppAlert';
import { Clock, Calendar, Plus, X, Save, Info, Globe } from 'lucide-react-native';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

export default function HorariosClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        clinic,
        loadingClinics,
        schedule,
        updateDaySchedule,
        handleSaveSchedule,
        loading,
        holidays,
        handleAddHoliday,
        handleDeleteHoliday,
        holidayModalVisible,
        setHolidayModalVisible,
        holidayName,
        setHolidayName,
        holidayDate,
        setHolidayDate,
        holidayReason,
        setHolidayReason,
        timePickerVisible,
        timePickerTarget,
        tempTime,
        setTempTime,
        openTimePicker,
        confirmTimePicker,
        cancelTimePicker,
    } = useSchedule();

    const renderDaySchedule = (day: ScheduleDay, index: number) => (
        <View key={day.day} style={[styles.dayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                    <Text style={[styles.dayName, { color: theme.text }]}>{day.day}</Text>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: day.isOpen ? '#10b98120' : '#ef444420' 
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: day.isOpen ? '#10b981' : '#ef4444' 
                        }]}>
                            {day.isOpen ? 'Abierto' : 'Cerrado'}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={day.isOpen}
                    onValueChange={(value) => updateDaySchedule(index, 'isOpen', value)}
                    trackColor={{ false: '#767577', true: theme.primary + '80' }}
                    thumbColor={day.isOpen ? theme.primary : '#f4f3f4'}
                />
            </View>

            {day.isOpen && (
                <View style={styles.timeSettings}>
                    <View style={styles.timeRow}>
                        <View style={styles.timeInput}>
                            <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Apertura</Text>
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => openTimePicker(index, 'openTime', 'Hora de Apertura', day.openTime)}
                            >
                                <Clock size={16} color={theme.primary} />
                                <Text style={[styles.timeText, { color: theme.text }]}>{day.openTime}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeInput}>
                            <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Cierre</Text>
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => openTimePicker(index, 'closeTime', 'Hora de Cierre', day.closeTime)}
                            >
                                <Clock size={16} color={theme.primary} />
                                <Text style={[styles.timeText, { color: theme.text }]}>{day.closeTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.addBreakBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => showAlert({ type: 'info', title: 'Próximamente', message: 'La gestión de descansos múltiples se habilitará pronto' })}
                    >
                        <Plus size={16} color={theme.primary} />
                        <Text style={[styles.addBreakText, { color: theme.primary }]}>Agregar Pausa</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderHoliday = (holiday: Holiday) => (
        <View key={holiday.id} style={[styles.holidayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.holidayInfo}>
                <View style={styles.holidayHeader}>
                    <Text style={[styles.holidayName, { color: theme.text }]}>{holiday.name}</Text>
                    <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: '#ef444420' }]}
                        onPress={() => handleDeleteHoliday(holiday.id)}
                    >
                        <X size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
                <View style={styles.holidayDetails}>
                    <View style={styles.holidayDate}>
                        <Calendar size={14} color={theme.primary} />
                        <Text style={[styles.holidayDateText, { color: theme.text }]}>{holiday.date}</Text>
                    </View>
                    <Text style={[styles.holidayReason, { color: theme.textMuted }]}>{holiday.reason}</Text>
                </View>
            </View>
            <View style={[styles.holidayStatus, { backgroundColor: '#ef444420' }]}>
                <Text style={[styles.holidayStatusText, { color: '#ef4444' }]}>Cerrado</Text>
            </View>
        </View>
    );

    if (loadingClinics) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando horarios..." />
            </ScreenContainer>
        );
    }

    if (!clinic) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Horarios" />
                <EmptyState
                    icon={<Clock size={80} color={theme.textMuted} />}
                    title="No tienes clínicas registradas"
                />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Horarios"
                rightElement={
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSaveSchedule}
                        disabled={loading}
                    >
                        {loading ? (
                            <Text style={styles.saveBtnText}>...</Text>
                        ) : (
                            <Save size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.primary + '15' }]}>
                    <Info size={20} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.primary }]}>
                        Configura tus horarios de atención. Los clientes podrán ver tu disponibilidad al agendar citas.
                    </Text>
                </View>

                {/* Weekly Schedule */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Horario Semanal</Text>
                {schedule.map(renderDaySchedule)}

                {/* Holidays */}
                <View style={styles.holidaysHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Días Festivos</Text>
                    <TouchableOpacity
                        style={[styles.addHolidayBtn, { backgroundColor: theme.primary }]}
                        onPress={() => setHolidayModalVisible(true)}
                    >
                        <Plus size={16} color="#fff" />
                        <Text style={styles.addHolidayBtnText}>Agregar</Text>
                    </TouchableOpacity>
                </View>

                {holidays.map(renderHoliday)}

                {/* Emergency Hours */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicio de Emergencias</Text>
                <View style={[styles.emergencyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.emergencyHeader}>
                        <View style={styles.emergencyInfo}>
                            <Globe size={20} color="#ef4444" />
                            <View>
                                <Text style={[styles.emergencyTitle, { color: theme.text }]}>24/7 Emergencias</Text>
                                <Text style={[styles.emergencySub, { color: theme.textMuted }]}>
                                    Atención inmediata fuera de horario
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={clinic.has_emergency}
                            onValueChange={() => showAlert({ type: 'info', title: 'Configuración', message: 'Esta opción se configura en el perfil de la clínica' })}
                            trackColor={{ false: '#767577', true: '#ef444480' }}
                            thumbColor={clinic.has_emergency ? '#ef4444' : '#f4f3f4'}
                        />
                    </View>
                    {clinic.has_emergency && (
                        <View style={styles.emergencyContact}>
                            <Text style={[styles.emergencyContactLabel, { color: theme.textMuted }]}>
                                Teléfono de emergencia:
                            </Text>
                            <Text style={[styles.emergencyPhone, { color: theme.text }]}>
                                {clinic.phone || 'No configurado'}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer} />
            </ScrollView>

            {/* Add Holiday Modal */}
            <Modal
                visible={holidayModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setHolidayModalVisible(false)}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Agregar Día Festivo</Text>
                        <TouchableOpacity onPress={handleAddHoliday}>
                            <Text style={[styles.saveBtnText, { color: theme.primary }]}>Guardar</Text>
                        </TouchableOpacity>
                    </View>

                    <KeyboardScreen style={{ paddingHorizontal: 24 }}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Nombre del Festivo *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="Ej: Navidad"
                                value={holidayName}
                                onChangeText={setHolidayName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Fecha *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="YYYY-MM-DD"
                                value={holidayDate}
                                onChangeText={setHolidayDate}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Motivo (opcional)</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="Motivo del cierre..."
                                value={holidayReason}
                                onChangeText={setHolidayReason}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.modalFooter} />
                    </KeyboardScreen>
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal
                visible={timePickerVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.timePickerContent, { backgroundColor: theme.background }]}>
                        <View style={styles.timePickerHeader}>
                            <Text style={[styles.timePickerTitle, { color: theme.text }]}>
                                {timePickerTarget?.title || 'Seleccionar Hora'}
                            </Text>
                        </View>

                        <View style={styles.timePickerBody}>
                            <Text style={[styles.label, { color: theme.textMuted, textAlign: 'center', marginBottom: 12 }]}>Formato 24 Horas (HH:MM)</Text>
                            <TextInput
                                style={[styles.timeInputModal, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={tempTime}
                                onChangeText={setTempTime}
                                keyboardType="numbers-and-punctuation"
                                placeholder="09:00"
                                placeholderTextColor={theme.textMuted}
                                maxLength={5}
                                textAlign="center"
                            />
                        </View>

                        <View style={styles.timePickerActions}>
                            <TouchableOpacity 
                                style={[styles.timePickerBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
                                onPress={cancelTimePicker}
                            >
                                <Text style={[styles.timePickerBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.timePickerBtn, { backgroundColor: theme.primary }]}
                                onPress={confirmTimePicker}
                            >
                                <Text style={[styles.timePickerBtnText, { color: '#fff' }]}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    saveBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    content: { flex: 1, paddingHorizontal: 24 },
    infoCard: { flexDirection: 'row', padding: 16, borderRadius: 12, gap: 12, marginBottom: 24 },
    infoText: { flex: 1, fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
    dayCard: { padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    dayInfo: { flex: 1 },
    dayName: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusText: { fontSize: 11, fontWeight: '700' },
    timeSettings: { gap: 12 },
    timeRow: { flexDirection: 'row', gap: 16 },
    timeInput: { flex: 1 },
    timeLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    timeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
    timeText: { fontSize: 15, fontWeight: '600' },
    addBreakBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
    addBreakText: { fontSize: 14, fontWeight: '600' },
    holidaysHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    addHolidayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    addHolidayBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    holidayCard: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    holidayInfo: { flex: 1 },
    holidayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    holidayName: { fontSize: 16, fontWeight: '800' },
    deleteBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    holidayDetails: { gap: 4 },
    holidayDate: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    holidayDateText: { fontSize: 14, fontWeight: '600' },
    holidayReason: { fontSize: 13 },
    holidayStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    holidayStatusText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
    emergencyCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
    emergencyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    emergencyInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    emergencyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    emergencySub: { fontSize: 13 },
    emergencyContact: { gap: 4 },
    emergencyContactLabel: { fontSize: 13 },
    emergencyPhone: { fontSize: 16, fontWeight: '700' },
    footer: { height: 40 },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontWeight: '600' },
    textArea: { height: 100, borderRadius: 12, paddingHorizontal: 16, paddingTop: 16, borderWidth: 1, fontSize: 16, textAlignVertical: 'top' },
    modalFooter: { height: 40 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    timePickerContent: { width: '80%', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
    timePickerHeader: { alignItems: 'center', marginBottom: 20 },
    timePickerTitle: { fontSize: 18, fontWeight: '800' },
    timePickerBody: { marginBottom: 24 },
    timeInputModal: { height: 60, fontSize: 32, fontWeight: '900', borderRadius: 16, borderWidth: 1, letterSpacing: 2 },
    timePickerActions: { flexDirection: 'row', gap: 12 },
    timePickerBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    timePickerBtnText: { fontSize: 15, fontWeight: '700' }
});
