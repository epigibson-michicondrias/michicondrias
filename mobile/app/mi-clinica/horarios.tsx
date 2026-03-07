import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics, Clinic } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Clock, Calendar, Plus, X, Save, Info, Globe } from 'lucide-react-native';

interface ScheduleDay {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breaks: Array<{
        start: string;
        end: string;
    }>;
}

interface Holiday {
    id: string;
    name: string;
    date: string;
    isClosed: boolean;
    reason?: string;
}

export default function HorariosClinicaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [modalVisible, setModalVisible] = useState(false);
    const [holidayModalVisible, setHolidayModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Schedule State
    const [schedule, setSchedule] = useState<ScheduleDay[]>([
        { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '14:00', breaks: [] },
        { day: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '14:00', breaks: [] },
    ]);

    // Holidays State
    const [holidays, setHolidays] = useState<Holiday[]>([
        { id: '1', name: 'Año Nuevo', date: '2024-01-01', isClosed: true, reason: 'Festivo nacional' },
        { id: '2', name: 'Día de la Independencia', date: '2024-09-16', isClosed: true, reason: 'Festivo nacional' },
        { id: '3', name: 'Navidad', date: '2024-12-25', isClosed: true, reason: 'Festivo nacional' },
    ]);

    // Holiday Form State
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState('');
    const [holidayReason, setHolidayReason] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    const updateDaySchedule = (index: number, field: keyof ScheduleDay, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const handleSaveSchedule = async () => {
        setLoading(true);
        try {
            // En producción: llamar a la API para guardar horarios
            Alert.alert("Éxito", "Horarios actualizados correctamente");
            router.back();
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar los horarios");
        } finally {
            setLoading(false);
        }
    };

    const handleAddHoliday = () => {
        if (!holidayName || !holidayDate) {
            Alert.alert("Error", "Por favor completa el nombre y la fecha");
            return;
        }

        const newHoliday: Holiday = {
            id: Date.now().toString(),
            name: holidayName,
            date: holidayDate,
            isClosed: true,
            reason: holidayReason || 'Día festivo'
        };

        setHolidays([...holidays, newHoliday]);
        setHolidayName('');
        setHolidayDate('');
        setHolidayReason('');
        setHolidayModalVisible(false);
        Alert.alert("Éxito", "Día festivo agregado correctamente");
    };

    const handleDeleteHoliday = (id: string) => {
        Alert.alert(
            "Eliminar Día Festivo",
            "¿Estás seguro de eliminar este día festivo?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        setHolidays(holidays.filter(h => h.id !== id));
                        Alert.alert("Eliminado", "Día festivo eliminado correctamente");
                    }
                }
            ]
        );
    };

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
                                onPress={() => Alert.alert("Hora", "Seleccionar hora de apertura")}
                            >
                                <Clock size={16} color={theme.primary} />
                                <Text style={[styles.timeText, { color: theme.text }]}>{day.openTime}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeInput}>
                            <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Cierre</Text>
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => Alert.alert("Hora", "Seleccionar hora de cierre")}
                            >
                                <Clock size={16} color={theme.primary} />
                                <Text style={[styles.timeText, { color: theme.text }]}>{day.closeTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.addBreakBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => Alert.alert("Pausa", "Agregar período de pausa")}
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
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
            </View>
        );
    }

    if (!clinic) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Horarios</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Clock size={80} color={theme.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes clínicas registradas</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={ theme.text } />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Horarios</Text>
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
            </View>

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
                            onValueChange={() => Alert.alert("Configuración", "Esta opción se configura en el perfil de la clínica")}
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

                    <ScrollView style={styles.modalContent}>
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
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', flex: 1 },
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 16, fontWeight: '600' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    footer: { height: 40 },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    modalContent: { flex: 1, paddingHorizontal: 24 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontWeight: '600' },
    textArea: { height: 100, borderRadius: 12, paddingHorizontal: 16, paddingTop: 16, borderWidth: 1, fontSize: 16, textAlignVertical: 'top' },
    modalFooter: { height: 40 },
});
