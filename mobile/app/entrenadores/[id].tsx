import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { useProgramDetail } from '@/src/hooks/training/useProgramDetail';
import { getProgramReviews, createProgramReview } from '@/src/services/training';
import { showAlert } from '@/src/components/AppAlert';
import ReviewsSection from '@/src/components/reviews/ReviewsSection';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Dumbbell, Clock, DollarSign, Info, Calendar } from 'lucide-react-native';
import { families, font, layout, spacing } from '@/constants/design';

export default function ProgramDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { program, isLoading, error, handleEnroll } = useProgramDetail();
    const queryClient = useQueryClient();
    const programId = program?.id;
    const { data: reviews } = useQuery({
        queryKey: ['program-reviews', programId],
        queryFn: () => getProgramReviews(programId!),
        enabled: !!programId,
    });
    const reviewMutation = useMutation({
        mutationFn: ({ rating, comment }: { rating: number; comment: string }) => createProgramReview(programId!, rating, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program-reviews', programId] });
            queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
            showAlert({ type: 'success', title: '¡Gracias por tu reseña!', message: 'Tu opinión ayuda a otros dueños a elegir.' });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo enviar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Programa" />
                <SkeletonList count={4} />
            </ScreenContainer>
        );
    }

    if (error || !program) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Programa" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del programa.
                    </Text>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }}>
                <ScreenHeader title="Detalle del Programa" />

                {/* Program Header */}
                <View style={styles.programHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
                        <Dumbbell size={32} color={theme.secondary} />
                    </View>
                    <Text style={[styles.programName, { color: theme.text }]}>{program.title}</Text>
                    {program.description && (
                        <Text style={[styles.programDesc, { color: theme.textMuted }]}>{program.description}</Text>
                    )}
                </View>

                {/* Quick Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.statItem}>
                        <DollarSign size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>${program.price.toLocaleString()}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Precio</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Clock size={20} color={theme.secondary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{program.duration_weeks}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Semanas</Text>
                    </View>
                </View>

                {/* Program Details */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Información del Programa</Text>
                    <View style={styles.detailRow}>
                        <Info size={16} color={theme.textMuted} />
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Entrenador:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>{program.trainer_name || 'Sin nombre'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={theme.textMuted} />
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Duración:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            {program.duration_weeks} {program.duration_weeks === 1 ? 'semana' : 'semanas'}
                        </Text>
                    </View>
                </View>

                {/* Enroll Button */}
                <View style={styles.actionContainer}>
                    {program.trainer_id === user?.id ? (
                        <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Este es tu programa. Gestiona a tus alumnos desde el Panel Entrenador.</Text>
                    ) : (
                    <TouchableOpacity
                        style={[styles.enrollButton, { backgroundColor: theme.primary }]}
                        onPress={handleEnroll}
                        accessibilityRole="button"
                        accessibilityLabel="Inscribir mascota"
                    >
                        <Dumbbell size={20} color={theme.onPrimary} />
                        <Text style={styles.enrollButtonText}>Inscribir Mascota</Text>
                    </TouchableOpacity>
                    )}
                </View>

                <ReviewsSection
                    title="Reseñas del programa"
                    average={reviews?.average ?? 0}
                    count={reviews?.count ?? 0}
                    reviews={reviews?.reviews ?? []}
                    canReview={!!reviews?.can_review}
                    submitting={reviewMutation.isPending}
                    onSubmit={(rating, comment) => reviewMutation.mutate({ rating, comment })}
                    formPrompt="Completaste este programa. ¿Cómo te fue?"
                />

                <View style={styles.footer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    loadingText: {
        fontSize: font.xl,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.lg,
    },
    errorText: {
        fontSize: font.xl,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButtonText: {
        fontSize: font.xl,
        fontFamily: families.semibold,
    },
    programHeader: {
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.xl,
        gap: spacing.md,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    programName: {
        fontSize: font.h2,
        fontFamily: families.extrabold,
        textAlign: 'center',
    },
    programDesc: {
        fontSize: font.lg,
        lineHeight: 22,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: layout.screenPadding,
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(128,128,128,0.25)',
    },
    statNumber: {
        fontSize: font.h2,
        fontFamily: families.extrabold,
        marginTop: spacing.sm,
    },
    statLabel: {
        fontSize: font.md,
        marginTop: spacing.xs,
    },
    section: {
        marginHorizontal: layout.screenPadding,
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontFamily: families.bold,
        marginBottom: spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.2)',
    },
    detailLabel: {
        fontSize: font.base,
        flex: 1,
    },
    detailValue: {
        fontSize: font.base,
        fontFamily: families.semibold,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    benefitDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    benefitText: {
        fontSize: font.base,
        flex: 1,
    },
    actionContainer: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.xxl,
    },
    enrollButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.md,
    },
    enrollButtonText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    footer: {
        height: 20,
    },
});
