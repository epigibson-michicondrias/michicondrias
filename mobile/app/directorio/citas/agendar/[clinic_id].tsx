import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, Clinic } from '@/src/services/directorio';
import { getUserPets, Pet } from '@/src/services/mascotas';
import { createAppointment } from '@/src/services/citas';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Calendar, Clock, User, Phone, MapPin, Stethoscope, Heart, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function AgendarCitaScreen() {
    const { clinic_id, service_id, reschedule_id, pet_id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const [selectedPet, setSelectedPet] = useState<string>(pet_id as string || '');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);

    const { data: clinic, isLoading: clinicLoading } = useQuery({
        queryKey: ['clinic', clinic_id],
        queryFn: () => getClinic(clinic_id as string),
        enabled: !!clinic_id,
    });

    const { data: pets = [], isLoading: petsLoading } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
            Alert.alert(
                "¡Cita Agendada!",
                "Tu cita ha sido programada exitosamente. Te contactaremos pronto para confirmar.",
                [
                    { text: "OK", onPress: () => router.push('/directorio/citas' as any) }
                ]
            );
        },
        onError: (error: any) => {
            Alert.alert(
                "Error",
                error.message || "No se pudo agendar la cita. Por favor, intenta nuevamente."
            );
        }
    });

    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ];

    const handleAgendar = () => {
        if (!selectedPet) {
            Alert.alert("Error", "Por favor selecciona una mascota");
            return;
        }

        if (!selectedDate) {
            Alert.alert("Error", "Por favor selecciona una fecha");
            return;
        }

        if (!selectedTime) {
            Alert.alert("Error", "Por favor selecciona una hora");
            return;
        }

        if (!reason.trim()) {
            Alert.alert("Error", "Por favor describe el motivo de la cita");
            return;
        }

        const appointmentData = {
            clinic_id: clinic_id,
            pet_id: selectedPet,
            service_id: service_id || null,
            appointment_date: `${selectedDate} ${selectedTime}`,
            reason: reason.trim(),
            is_emergency: isEmergency,
            status: 'scheduled'
        };

        createMutation.mutate(appointmentData);
    };

    if (clinicLoading || petsLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Cargando información...
                    </Text>
                </View>
            </View>
        );
    }

    if (!clinic) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.text }]}>
                        No se encontró la clínica
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>
                    Agendar Cita
                </Text>
            </View>

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
                
                <TextInput
                    style={[styles.dateInput, { 
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text 
                    }]}
                    placeholder="Selecciona una fecha (ej: 15/03/2024)"
                    placeholderTextColor={theme.textMuted}
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                />

                <Text style={[styles.helperText, { color: theme.textMuted }]}>
                    Formato: DD/MM/YYYY
                </Text>
            </View>

            {/* Time Selection */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Hora Preferida
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.timeSlotsContainer}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={time}
                                style={[
                                    styles.timeSlot,
                                    {
                                        backgroundColor: selectedTime === time ? theme.primary : 'transparent',
                                        borderColor: selectedTime === time ? theme.primary : theme.border
                                    }
                                ]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Clock size={14} color={selectedTime === time ? '#fff' : theme.text} />
                                <Text style={[
                                    styles.timeSlotText,
                                    { color: selectedTime === time ? '#fff' : theme.text }
                                ]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
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
                    onPress={() => setIsEmergency(!isEmergency)}
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
                            backgroundColor: createMutation.isPending ? theme.textMuted : theme.primary,
                            opacity: createMutation.isPending ? 0.6 : 1
                        }
                    ]}
                    onPress={handleAgendar}
                    disabled={createMutation.isPending}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.agendarButtonText}>
                        {createMutation.isPending ? 'Agendando...' : 'Agendar Cita'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 16,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
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
    dateInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        marginTop: 8,
    },
    timeSlotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    timeSlot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 90,
    },
    timeSlotText: {
        fontSize: 12,
        fontWeight: '600',
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
