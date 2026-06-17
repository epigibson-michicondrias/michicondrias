import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { Info, Clock, CheckCircle2, XCircle, Search, MessageSquare, PartyPopper, ChevronRight, Check } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { useMyApplications } from '@/src/hooks/adopciones/useMyApplications';
import type { AdoptionRequest } from '@/src/types/adopciones';

const { width } = Dimensions.get('window');

const STEP_ICONS = {
    PENDING: Clock,
    REVIEWING: Search,
    INTERVIEW_SCHEDULED: MessageSquare,
    APPROVED: CheckCircle2,
    ADOPTED: PartyPopper,
} as const;

export default function MisSolicitudesScreen() {
    const { theme } = useTheme();
    const {
        requests,
        isLoading,
        isRefetching,
        refetch,
        getProgressIndex,
        goToExplore,
        goToMyPets,
        STEPS,
    } = useMyApplications();

    const renderItem = ({ item }: { item: AdoptionRequest }) => {
        const currentIdx = getProgressIndex(item.status);
        const isRejected = item.status === "REJECTED";

        return (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                {/* Header info */}
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: item.pet_photo_url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400' }}
                        style={styles.petImage}
                    />
                    <View style={styles.headerText}>
                        <Text style={[styles.petName, { color: theme.text }]}>Adopción de {item.pet_name || 'Mascota'}</Text>
                        <View style={styles.idRow}>
                            <View style={[styles.idBadge, { backgroundColor: theme.primary + '15' }]}>
                                <Text style={[styles.idText, { color: theme.primary }]}>#{item.id.substring(0, 8).toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.dateText, { color: theme.textMuted }]}>Enviada para evaluación</Text>
                        </View>
                    </View>
                </View>

                {isRejected ? (
                    <View style={[styles.rejectedBanner, { backgroundColor: '#ef444415' }]}>
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.bannerText, { color: '#ef4444' }]}>
                            Esta solicitud fue rechazada debido a que no se cumplieron los criterios de seguridad.
                        </Text>
                    </View>
                ) : (
                    <>
                        {item.status === "ADOPTED" && (
                            <TouchableOpacity
                                style={[styles.adoptedBanner, { backgroundColor: '#10b98115' }]}
                                onPress={goToMyPets}
                            >
                                <PartyPopper size={20} color="#10b981" />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.bannerTitle, { color: '#10b981' }]}>¡Felicidades! Adopción Finalizada</Text>
                                    <Text style={[styles.bannerSub, { color: '#10b981', opacity: 0.8 }]}>
                                        Tu nuevo mejor amigo ya está registrado. Toca para ver tus mascotas.
                                    </Text>
                                </View>
                                <ChevronRight size={18} color="#10b981" />
                            </TouchableOpacity>
                        )}

                        {/* Stepper */}
                        <View style={styles.stepperContainer}>
                            <View style={[styles.stepperLine, { backgroundColor: theme.border }]}>
                                <View
                                    style={[
                                        styles.stepperFill,
                                        {
                                            backgroundColor: theme.primary,
                                            width: `${(currentIdx / (STEPS.length - 1)) * 100}%`
                                        }
                                    ]}
                                />
                            </View>
                            <View style={styles.stepsRow}>
                                {STEPS.map((step, idx) => {
                                    const isCompleted = idx < currentIdx;
                                    const isActive = idx === currentIdx;
                                    const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Clock;

                                    return (
                                        <View key={step.key} style={styles.stepItem}>
                                            <View
                                                style={[
                                                    styles.stepIconBox,
                                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                                    isCompleted && { backgroundColor: theme.primary, borderColor: theme.primary },
                                                    isActive && { borderColor: theme.primary, borderWidth: 2 }
                                                ]}
                                            >
                                                {isCompleted ? (
                                                    <Check size={12} color="#fff" strokeWidth={3} />
                                                ) : (
                                                    <Icon size={12} color={isActive ? theme.primary : theme.textMuted} />
                                                )}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.stepLabel,
                                                    { color: theme.textMuted },
                                                    isActive && { color: theme.primary, fontWeight: '800' }
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {step.label}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}
            </View>
        );
    };

    const ListHeader = (
        <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
            <Info size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>
                El equipo de rescate valida periódicamente el estatus de cada trámite. Recibirás una notificación ante cualquier cambio.
            </Text>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Solicitudes"
                rightElement={
                    <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
                        <Clock size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                }
                subtitle=""
                leftElement={undefined}
            />

            {/* Live indicator below header */}
            <View style={styles.liveIndicatorRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>En Vivo</Text>
            </View>

            <DataList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                isLoading={isLoading}
                loadingMessage="Consultando estatus en tiempo real..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                contentStyle={styles.list}
                header={ListHeader}
                emptyIcon={<CheckCircle2 size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="Aún no has solicitado ninguna adopción"
                emptyActionLabel="Explorar Mascotas"
                onEmptyAction={goToExplore}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 80, marginTop: -10, marginBottom: 10 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
    liveText: { fontSize: 10, fontWeight: '800', color: '#10b981', textTransform: 'uppercase' },
    refreshBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20, paddingBottom: 40 },
    infoCard: { flexDirection: 'row', padding: 16, borderRadius: 20, gap: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    infoText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
    card: { borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    cardHeader: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 },
    petImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#7c3aed' },
    headerText: { flex: 1, gap: 4 },
    petName: { fontSize: 18, fontWeight: '800' },
    idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    idBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    idText: { fontSize: 10, fontWeight: '800' },
    dateText: { fontSize: 11, fontWeight: '600' },
    rejectedBanner: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, alignItems: 'center' },
    adoptedBanner: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, alignItems: 'center' },
    bannerTitle: { fontSize: 14, fontWeight: '800' },
    bannerSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    bannerText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 18 },
    stepperContainer: { marginTop: 10 },
    stepperLine: { height: 3, width: '100%', borderRadius: 1.5, position: 'absolute', top: 12, left: 0 },
    stepperFill: { height: '100%', borderRadius: 1.5 },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center', width: (width - 80) / 5 },
    stepIconBox: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    stepLabel: { fontSize: 9, fontWeight: '700', marginTop: 8 },
});
