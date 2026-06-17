import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useBookAppointment } from '@/src/hooks/directorio/useBookAppointment';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import { Calendar, MapPin, Stethoscope, Heart, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function AgendarCitaScreen() {
    const { theme } = useTheme();
    const {
        clinic, pets, clinicLoading, petsLoading, isRescheduling,
        selectedPet, selectedDate, selectedTime, reason, isEmergency, isPending,
        setSelectedPet, setSelectedDate, setSelectedTime, setReason,
        toggleEmergency, handleAgendar, goBack,
    } = useBookAppointment();

    if (clinicLoading || petsLoading) {
        return (
            <ScreenContainer>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Cargando información...
                    </Text>
                </View>
            </ScreenContainer>
        );
    }

    if (!clinic) {
        return (
            <ScreenContainer>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.text }]}>
                        No se encontró la clínica
                    </Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <KeyboardScreen style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title={isRescheduling ? 'Reagendar Cita' : 'Agendar Cita'}
                onBack={goBack}
            />

            {/* Clinic Info */}
            <View style={[styles.clinicCard, { backgroundColor: theme.surface }]}>
                <View style={styles.clinicHeader}>
                    <View style={[styles.clinicIcon, { backgroundColor: theme.primary + '20' }]}>
                        <Stethoscope size={24} color={theme.primary} />
                    </View>
                    <View style={styles.clinicInfo}>
                        <Text style={[styles.clinicName, { color: theme.text }]}>
                            {clinic.name}
                        </Text>
                        <View style={styles.clinicLocation}>
                            <MapPin size={14} color={theme.textMuted} />
                            <Text style={[styles.clinicAddress, { color: theme.textMuted }]}>
                                {clinic.city}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.clinicFeatures}>
                    {clinic.is_24_hours && (
                        <View style={[styles.featureTag, { backgroundColor: '#3b82f620' }]}>
                            <Text style={[styles.featureText, { color: '#60a5fa' }]}>🕒 24 Horas</Text>
                        </View>
                    )}
                    {clinic.has_emergency && (
                        <View style={[styles.featureTag, { backgroundColor: '#ef444420' }]}>
                            <Text style={[styles.featureText, { color: '#f87171' }]}>🚨 Urgencias</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Pet Selection */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Selecciona tu Mascota
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.petsContainer}>
                        {pets.map((pet) => (
                            <TouchableOpacity
                                key={pet.id}
                                style={[
                                    styles.petCard,
                                    {
                                        backgroundColor: selectedPet === pet.id ? theme.primary + '20' : 'transparent',
                                        borderColor: selectedPet === pet.id ? theme.primary : theme.border
                                    }
                                ]}
                                onPress={() => setSelectedPet(pet.id)}
                            >
                                <Heart size={20} color={selectedPet === pet.id ? theme.primary : theme.textMuted} />
                                <View style={styles.petInfo}>
                                    <Text style={[
                                        styles.petName,
                                        { color: selectedPet === pet.id ? theme.primary : theme.text }
                                    ]}>
                                        {pet.name}
                                    </Text>
                                    <Text style={[styles.petBreed, { color: theme.textMuted }]}>
                                        {pet.breed || 'Mestizo'}
                                    </Text>
                                </View>
                                {selectedPet === pet.id && (
                                    <CheckCircle size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Date Selection */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Fecha de la Cita
                </Text>
                
                <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    mode="date"
                    label="Fecha"
                    placeholder="Seleccionar fecha"
                    minimumDate={new Date()}
                />
            </View>

            {/* Time Selection */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Hora Preferida
                </Text>
                
                <DatePicker
                    value={selectedTime}
                    onChange={setSelectedTime}
                    mode="time"
                    label="Hora"
                    placeholder="Seleccionar hora"
                />
            </View>

            {/* Reason */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Motivo de la Consulta
                </Text>
                
                <TextInput
                    style={[styles.reasonInput, { 
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text 
                    }]}
                    placeholder="Describe los síntomas o motivo de la visita..."
                    placeholderTextColor={theme.textMuted}
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* Emergency Option */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.emergencyHeader}>
                    <AlertCircle size={20} color="#ef4444" />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        ¿Es una Emergencia?
                    </Text>
                </View>
                
                <TouchableOpacity
                    style={[
                        styles.emergencyOption,
                        {
                            backgroundColor: isEmergency ? '#ef444420' : 'transparent',
                            borderColor: isEmergency ? '#ef4444' : theme.border
                        }
                    ]}
                    onPress={toggleEmergency}
                >
                    <Text style={[
                        styles.emergencyText,
                        { color: isEmergency ? '#ef4444' : theme.text }
                    ]}>
                        Sí, es una emergencia médica
                    </Text>
                </TouchableOpacity>

                {isEmergency && (
                    <View style={styles.emergencyNotice}>
                        <AlertCircle size={16} color="#ef4444" />
                        <Text style={[styles.emergencyNoticeText, { color: theme.textMuted }]}>
                            Las emergencias tienen prioridad y pueden ser atendidas fuera del horario normal.
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.agendarButton,
                        { 
                            backgroundColor: isPending ? theme.textMuted : theme.primary,
                            opacity: isPending ? 0.6 : 1
                        }
                    ]}
                    onPress={handleAgendar}
                    disabled={isPending}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.agendarButtonText}>
                        {isPending
                            ? (isRescheduling ? 'Reagendando...' : 'Agendando...')
                            : (isRescheduling ? 'Reagendar Cita' : 'Agendar Cita')}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
    },
    clinicCard: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    clinicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    clinicIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicInfo: {
        flex: 1,
    },
    clinicName: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    clinicLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clinicAddress: {
        fontSize: 14,
    },
    clinicFeatures: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    featureTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '700',
    },
    card: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    petsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 140,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 14,
        fontWeight: '700',
    },
    petBreed: {
        fontSize: 12,
        marginTop: 2,
    },
    reasonInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        height: 100,
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    emergencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    emergencyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    emergencyNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 8,
    },
    emergencyNoticeText: {
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    agendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    agendarButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
