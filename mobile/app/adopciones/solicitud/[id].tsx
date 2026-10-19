import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
    AlertCircle, Home, Trees, Key, Baby, Clock, PawPrint, Wallet, Calendar, CheckCircle2, XCircle, Search,
} from 'lucide-react-native';
import { useApplicationDetail } from '@/src/hooks/adopciones/useApplicationDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import EmptyState from '@/src/components/EmptyState';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import Card from '@/src/components/Card';
import { Skeleton } from '@/src/components/Skeleton';
import type { IconComponent } from '@/src/components/IconButton';
import { formatDate, sentenceCase } from '@/src/utils/formatters';
import { layout, spacing, type } from '@/constants/design';

/** Qué sigue según el estado (lo ve quien publicó). */
const NEXT_STEP: Record<string, string> = {
    PENDING: 'Revisa los datos y decide si sigue adelante.',
    REVIEWING: 'Agenda una entrevista o aprueba la adopción.',
    INTERVIEW_SCHEDULED: 'Después de la entrevista, aprueba o rechaza.',
    APPROVED: 'Pre-aprobada: confirma la adopción cuando entregues a la mascota.',
    ADOPTED: 'La adopción se concretó. La mascota ya está en la cuenta de quien adoptó.',
    REJECTED: 'Esta solicitud se cerró.',
};

function Fact({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
    const { theme } = useTheme();
    return (
        <View style={styles.fact}>
            <Icon size={layout.icon.sm} color={theme.primary} />
            <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>{label}</Text>
            <Text style={[type.bodyStrong, styles.factValue, { color: theme.text }]}>{sentenceCase(value)}</Text>
        </View>
    );
}

export default function ProcesarSolicitudScreen() {
    const { theme } = useTheme();
    const {
        request, listing, isLoading, statusInfo, notes, interviewDate,
        setNotes, setInterviewDate, handleStatusUpdate, handleApprove, isMutating,
    } = useApplicationDetail();

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud" />
                <View style={styles.content}>
                    <Skeleton height={72} />
                    <Skeleton height={140} />
                    <Skeleton height={200} />
                </View>
            </ScreenContainer>
        );
    }

    if (!request) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Solicitud" />
                <EmptyState
                    icon={<AlertCircle size={layout.icon.xl} color={theme.textMuted} />}
                    title="No encontramos esta solicitud"
                    subtitle="Puede que se haya retirado o que no tengas acceso."
                />
            </ScreenContainer>
        );
    }

    const status = request.status;
    const isClosed = status === 'ADOPTED' || status === 'REJECTED';
    const canApprove = status === 'REVIEWING' || status === 'INTERVIEW_SCHEDULED' || status === 'APPROVED';
    const statusColor = theme[statusInfo.tone] as string;
    const petName = listing?.name ?? request.pet_name ?? 'la mascota';

    return (
        <ScreenContainer>
            <ScreenHeader title={request.applicant_name || 'Solicitud'} subtitle={`Quiere adoptar a ${petName}`} />

            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={isClosed ? undefined : (
                    <DetailFooter>
                        <Button
                            label="Rechazar"
                            variant="secondary"
                            icon={<XCircle size={layout.icon.sm} color={theme.error} />}
                            onPress={() => handleStatusUpdate('REJECTED')}
                            disabled={isMutating}
                            size="lg"
                            style={styles.flex}
                        />
                        {status === 'PENDING' ? (
                            <Button
                                label="Empezar revisión"
                                icon={<Search size={layout.icon.sm} color={theme.onPrimary} />}
                                onPress={() => handleStatusUpdate('REVIEWING')}
                                loading={isMutating}
                                size="lg"
                                style={styles.primary}
                            />
                        ) : canApprove ? (
                            <Button
                                label="Aprobar adopción"
                                icon={<CheckCircle2 size={layout.icon.sm} color={theme.onPrimary} />}
                                onPress={handleApprove}
                                loading={isMutating}
                                size="lg"
                                style={styles.primary}
                            />
                        ) : null}
                    </DetailFooter>
                )}
            >
                {/* Estado y siguiente paso */}
                <Card>
                    <View style={styles.cardBody}>
                        <View style={styles.statusRow}>
                            <Badge label={statusInfo.label} color={statusColor} variant="solid" />
                            <Text style={[type.caption, { color: theme.textMuted }]}>Enviada el {formatDate(request.created_at)}</Text>
                        </View>
                        <Text style={[type.body, { color: theme.text }]}>{NEXT_STEP[status] ?? ''}</Text>
                    </View>
                </Card>

                <View style={styles.section}>
                    <Text style={[type.title, { color: theme.text }]}>Por qué quiere adoptar</Text>
                    <Text style={[type.body, { color: theme.textMuted }]}>«{request.reason}»</Text>
                    {request.previous_experience ? (
                        <Text style={[type.body, { color: theme.textMuted }]}>Experiencia: {request.previous_experience}</Text>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <Text style={[type.title, { color: theme.text }]}>Su hogar</Text>
                    <Card>
                        <View style={styles.cardBody}>
                            <Fact icon={Home} label="Vivienda" value={request.house_type || 'Sin dato'} />
                            <Fact
                                icon={Key}
                                label="Es"
                                value={request.own_or_rent === 'Renta' ? `Rentada${request.landlord_permission ? ' · con permiso' : ' · sin permiso'}` : request.own_or_rent || 'Sin dato'}
                            />
                            <Fact icon={Trees} label="Patio o jardín" value={request.has_yard ? 'Sí' : 'No'} />
                            <Fact icon={Baby} label="Niños" value={request.has_children ? (request.children_ages || 'Sí') : 'No'} />
                            <Fact icon={Clock} label="Horas sola al día" value={`${request.hours_alone} h`} />
                            <Fact icon={PawPrint} label="Otras mascotas" value={request.other_pets || 'Ninguna'} />
                            <Fact icon={Wallet} label="Compromiso de gastos" value={request.financial_commitment ? 'Aceptado' : 'No'} />
                        </View>
                    </Card>
                </View>

                {request.compatibility_score != null ? (
                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Compatibilidad estimada: {request.compatibility_score}/100</Text>
                        {request.vetting_notes ? <Text style={[type.body, { color: theme.textMuted }]}>{request.vetting_notes}</Text> : null}
                    </View>
                ) : null}

                {!isClosed ? (
                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Responder</Text>
                        {status === 'REVIEWING' ? (
                            <View style={styles.interview}>
                                <FormField
                                    label="Entrevista"
                                    value={interviewDate}
                                    onChangeText={setInterviewDate}
                                    placeholder="Ej: sábado 15, 10:00 a. m., en el refugio"
                                />
                                <Button
                                    label="Agendar entrevista"
                                    variant="secondary"
                                    icon={<Calendar size={layout.icon.sm} color={theme.text} />}
                                    onPress={() => handleStatusUpdate('INTERVIEW_SCHEDULED')}
                                    disabled={isMutating}
                                    fullWidth
                                />
                            </View>
                        ) : null}
                        <FormField
                            label="Mensaje para quien solicita (opcional)"
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Se envía junto con el cambio de estado"
                            multiline
                        />
                    </View>
                ) : null}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    primary: { flex: 1.6 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.xl },
    cardBody: { gap: spacing.md },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    section: { gap: spacing.sm },
    fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    factValue: { flexShrink: 1, textAlign: 'right' },
    interview: { gap: spacing.sm },
});
