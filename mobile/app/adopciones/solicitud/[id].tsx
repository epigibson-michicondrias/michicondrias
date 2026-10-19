import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useApplicationDetail } from '@/src/hooks/adopciones/useApplicationDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { User, Home, Calendar, Clock, CheckCircle, XCircle, Heart, Mail, FileText, AlertCircle } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

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

    const statusColor = theme[statusInfo.tone] as string;

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
            <View style={[styles.statusCard, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
                <View style={styles.statusHeader}>
                    {request.status === 'REJECTED' ? <XCircle size={26} color={statusColor} /> : request.status === 'PENDING' ? <Clock size={26} color={statusColor} /> : <CheckCircle size={26} color={statusColor} />}
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: statusColor }]}>
                            {statusInfo.label}
                        </Text>
                        <Text style={[styles.statusDate, { color: theme.textMuted }]}>
                            Solicitado: {new Date(request.created_at).toLocaleDateString('es-MX')}
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
                            El contacto es por notificaciones de la app
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
                        color={request.has_yard ? theme.success : theme.textMuted} 
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
                            {request.own_or_rent || 'No indicado'}
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

            {request.compatibility_score != null && (
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Compatibilidad estimada: {request.compatibility_score}/100</Text>
                    {!!request.vetting_notes && <Text style={[styles.reasonText, { color: theme.textMuted }]}>{request.vetting_notes}</Text>}
                </View>
            )}

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
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
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
                    Mensaje para el solicitante
                </Text>
                
                <TextInput
                    style={[styles.textArea, { 
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text 
                    }]}
                    placeholder="Se enviará al solicitante junto con el cambio de estado (opcional)"
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
                            style={[styles.rejectButton, { backgroundColor: theme.error }]}
                            onPress={() => handleStatusUpdate('REJECTED')}
                        >
                            <XCircle size={20} color="#fff" />
                            <Text style={styles.buttonText}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.reviewButton, { backgroundColor: theme.info }]}
                            onPress={() => handleStatusUpdate('REVIEWING')}
                        >
                            <FileText size={20} color="#fff" />
                            <Text style={styles.buttonText}>Comenzar Revisión</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(request.status === 'REVIEWING' || request.status === 'INTERVIEW_SCHEDULED' || request.status === 'APPROVED') && (
                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: theme.error, marginBottom: spacing.md }]}
                        onPress={() => handleStatusUpdate('REJECTED')}
                        accessibilityRole="button"
                    >
                        <XCircle size={20} color="#fff" />
                        <Text style={styles.buttonText}>Rechazar solicitud</Text>
                    </TouchableOpacity>
                )}

                {(request.status === 'REVIEWING' || request.status === 'APPROVED') && (
                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: theme.success }]}
                        onPress={handleApprove}
                    >
                        <CheckCircle size={20} color="#fff" />
                        <Text style={styles.buttonText}>Aprobar Adopción</Text>
                    </TouchableOpacity>
                )}

                {request.status === 'INTERVIEW_SCHEDULED' && (
                    <TouchableOpacity
                        style={[styles.approveButton, { backgroundColor: theme.success }]}
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
        marginHorizontal: layout.screenPadding,
        marginBottom: spacing.xl,
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    statusIcon: {
        fontSize: font.h2,
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
    },
    statusDate: {
        fontSize: font.base,
        marginTop: spacing.xs,
    },
    card: {
        marginHorizontal: layout.screenPadding,
        marginBottom: spacing.xl,
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    cardTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
        marginBottom: spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: font.md,
        fontWeight: '600',
        marginBottom: spacing.xxs,
    },
    infoValue: {
        fontSize: font.xl,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    checkboxText: {
        fontSize: font.xl,
    },
    petInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    petDetails: {
        flex: 1,
    },
    petName: {
        fontSize: font.xxl,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    petBreed: {
        fontSize: font.base,
        marginBottom: spacing.sm,
    },
    petDescription: {
        fontSize: font.lg,
        lineHeight: 22,
    },
    reasonText: {
        fontSize: font.xl,
        lineHeight: 24,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: font.base,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: font.xl,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: font.xl,
        height: 100,
        textAlignVertical: 'top',
    },
    actionContainer: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: 12,
    },
    reviewButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: 12,
    },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
});
