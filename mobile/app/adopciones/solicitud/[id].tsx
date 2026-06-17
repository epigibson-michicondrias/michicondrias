import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useApplicationDetail, STATUS_LABELS } from '@/src/hooks/adopciones/useApplicationDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { User, Home, Calendar, Clock, CheckCircle, XCircle, Heart, Mail, Phone, FileText, Send, AlertCircle } from 'lucide-react-native';

export default function ProcesarSolicitudScreen() {
    const { theme } = useTheme();
    const {
        request, listing, isLoading, statusInfo,
        notes, interviewDate,
        setNotes, setInterviewDate,
        handleStatusUpdate, handleApprove, goBack,
    } = useApplicationDetail();

    if (isLoading) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando solicitud..." />
            </ScreenContainer>
        );
    }

    if (!request) {
        return (
            <ScreenContainer>
                <EmptyState
                    icon={<AlertCircle size={48} color={theme.textMuted} />}
                    title="No se encontró la solicitud"
                />
            </ScreenContainer>
        );
    }

    return (
        <KeyboardScreen style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Procesar Solicitud" onBack={goBack} />

            {/* Status Badge */}
            <View style={[styles.statusCard, { backgroundColor: statusInfo.color + '15', borderColor: statusInfo.color + '30' }]}>
                <View style={styles.statusHeader}>
                    <Text style={[styles.statusIcon]}>{statusInfo.icon}</Text>
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                        <Text style={[styles.statusDate, { color: theme.textMuted }]}>
                            Solicitado: {new Date(request.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Applicant Information */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Información del Solicitante
                </Text>
                
                <View style={styles.infoRow}>
                    <User size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Nombre</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {request.applicant_name || 'No especificado'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Mail size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Contacto</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            Contacto no disponible
                        </Text>
                    </View>
                </View>
            </View>

            {/* Pet Information */}
            {listing && (
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Información de la Mascota
                    </Text>
                    
                    <View style={styles.petInfo}>
                        <Heart size={20} color={theme.primary} />
                        <View style={styles.petDetails}>
                            <Text style={[styles.petName, { color: theme.text }]}>
                                {listing.name}
                            </Text>
                            <Text style={[styles.petBreed, { color: theme.textMuted }]}>
                                {listing.breed || 'Mestizo'} • {listing.species}
                            </Text>
                            <Text style={[styles.petDescription, { color: theme.text }]}>
                                {listing.description}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Housing Information */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Información de Vivienda
                </Text>
                
                <View style={styles.infoRow}>
                    <Home size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Tipo de vivienda</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {request.house_type}
                        </Text>
                    </View>
                </View>

                <View style={styles.checkboxRow}>
                    <CheckCircle 
                        size={20} 
                        color={request.has_yard ? '#22c55e' : theme.textMuted} 
                    />
                    <Text style={[styles.checkboxText, { color: theme.text }]}>
                        Tiene patio/jardín
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <FileText size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Propiedad</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {request.own_or_rent === 'Propio' ? 'Propia' : 'Rentada'}
                        </Text>
                    </View>
                </View>

                {request.other_pets && (
                    <View style={styles.infoRow}>
                        <Heart size={20} color={theme.primary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Otras mascotas</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>
                                {request.other_pets}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Adoption Reason */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Razón de Adopción
                </Text>
                <Text style={[styles.reasonText, { color: theme.text }]}>
                    {request.reason}
                </Text>
            </View>

            {/* Interview Scheduling */}
            {request.status === 'REVIEWING' && (
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Programar Entrevista
                    </Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Fecha y hora propuesta
                        </Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            placeholder="Ej: Sábado 15 de marzo, 10:00 AM"
                            placeholderTextColor={theme.textMuted}
                            value={interviewDate}
                            onChangeText={setInterviewDate}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                        onPress={() => handleStatusUpdate('INTERVIEW_SCHEDULED')}
                    >
                        <Calendar size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Programar Entrevista</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notes */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Notas Internas
                </Text>
                
                <TextInput
                    style={[styles.textArea, { 
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text 
                    }]}
                    placeholder="Añade notas sobre esta solicitud..."
                    placeholderTextColor={theme.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {request.status === 'PENDING' && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.rejectButton, { backgroundColor: '#ef4444' }]}
                            onPress={() => handleStatusUpdate('REJECTED')}
                        >
                            <XCircle size={20} color="#fff" />
                            <Text style={styles.buttonText}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.reviewButton, { backgroundColor: '#3b82f6' }]}
                            onPress={() => handleStatusUpdate('REVIEWING')}
                        >
                            <FileText size={20} color="#fff" />
                            <Text style={styles.buttonText}>Comenzar Revisión</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {request.status === 'REVIEWING' && (
                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: '#22c55e' }]}
                        onPress={handleApprove}
                    >
                        <CheckCircle size={20} color="#fff" />
                        <Text style={styles.buttonText}>Aprobar Adopción</Text>
                    </TouchableOpacity>
                )}

                {request.status === 'INTERVIEW_SCHEDULED' && (
                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: '#22c55e' }]}
                        onPress={handleApprove}
                    >
                        <CheckCircle size={20} color="#fff" />
                        <Text style={styles.buttonText}>Aprobar Adopción</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardScreen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusCard: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statusIcon: {
        fontSize: 24,
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    statusDate: {
        fontSize: 14,
        marginTop: 4,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    checkboxText: {
        fontSize: 16,
    },
    petInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    petDetails: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    petBreed: {
        fontSize: 14,
        marginBottom: 8,
    },
    petDescription: {
        fontSize: 15,
        lineHeight: 22,
    },
    reasonText: {
        fontSize: 16,
        lineHeight: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    actionContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    reviewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
