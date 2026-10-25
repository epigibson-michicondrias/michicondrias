import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useEnrollment } from '@/src/hooks/training/useEnrollment';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Dumbbell, DollarSign, Clock, PawPrint, CheckCircle, ArrowRight } from 'lucide-react-native';
import { families, font, layout, spacing } from '@/constants/design';

export default function EnrollPetScreen() {
    const { theme } = useTheme();
    const {
        program,
        pets,
        selectedPetId,
        setSelectedPetId,
        handleEnroll,
        isEnrolling,
        isLoading,
    } = useEnrollment();

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Inscribir Mascota" />
                <SkeletonList count={4} />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ScreenHeader title="Inscribir Mascota" />

                {/* Program Info Card */}
                {program && (
                    <View style={[styles.programCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <View style={[styles.programIconBg, { backgroundColor: theme.secondary + '20' }]}>
                            <Dumbbell size={28} color={theme.secondary} />
                        </View>
                        <Text style={[styles.programName, { color: theme.text }]}>{program.title}</Text>
                        {program.description && (
                            <Text style={[styles.programDesc, { color: theme.textMuted }]}>{program.description}</Text>
                        )}
                        <View style={styles.programStats}>
                            <View style={[styles.statChip, { backgroundColor: theme.primaryLight }]}>
                                <DollarSign size={14} color={theme.primary} />
                                <Text style={[styles.statChipText, { color: theme.primary }]}>
                                    ${program.price.toLocaleString()}
                                </Text>
                            </View>
                            <View style={[styles.statChip, { backgroundColor: theme.secondaryLight }]}>
                                <Clock size={14} color={theme.secondary} />
                                <Text style={[styles.statChipText, { color: theme.secondary }]}>
                                    {program.duration_weeks} semanas
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Pet Selector */}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Selecciona tu mascota</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                        Elige la mascota que participará en el entrenamiento
                    </Text>

                    {pets.length === 0 ? (
                        <View style={[styles.emptyPets, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <PawPrint size={40} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                No tienes mascotas registradas
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.petList}>
                            {pets.map((pet) => {
                                const isSelected = selectedPetId === pet.id;
                                return (
                                    <TouchableOpacity accessibilityRole="button"
                                        key={pet.id}
                                        style={[
                                            styles.petCard,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: isSelected ? theme.primary : theme.cardBorder,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => setSelectedPetId(pet.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.petAvatar, { backgroundColor: theme.primaryLight }]}>
                                            <PawPrint size={20} color={theme.primary} />
                                        </View>
                                        <View style={styles.petInfo}>
                                            <Text style={[styles.petName, { color: theme.text }]}>{pet.name}</Text>
                                            <Text style={[styles.petBreed, { color: theme.textMuted }]}>
                                                {pet.breed || pet.species}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                                                <CheckCircle size={18} color={theme.onPrimary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Enroll Button */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[
                            styles.enrollButton,
                            {
                                backgroundColor: selectedPetId ? theme.primary : theme.surface,
                                borderColor: selectedPetId ? theme.primary : theme.cardBorder,
                            },
                        ]}
                        onPress={handleEnroll}
                        disabled={isEnrolling || !selectedPetId}
                        activeOpacity={0.8}
                    >
                        {isEnrolling ? (
                            <ActivityIndicator size="small" color={theme.onPrimary} />
                        ) : (
                            <>
                                <Dumbbell size={20} color={selectedPetId ? theme.onPrimary : theme.textMuted} />
                                <Text style={[
                                    styles.enrollButtonText,
                                    { color: selectedPetId ? theme.onPrimary : theme.textMuted },
                                ]}>
                                    Confirmar Inscripción
                                </Text>
                                <ArrowRight size={18} color={selectedPetId ? theme.onPrimary : theme.textMuted} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

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
    loadingText: { fontSize: font.xl },
    programCard: {
        marginHorizontal: layout.screenPadding,
        padding: spacing.xxl,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    programIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    programName: {
        fontSize: font.h3,
        fontFamily: families.extrabold,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    programDesc: {
        fontSize: font.base,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    programStats: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        justifyContent: 'center',
    },
    statChipText: {
        fontSize: font.base,
        fontFamily: families.bold,
    },
    sectionContainer: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: font.base,
        marginBottom: spacing.lg,
    },
    emptyPets: {
        alignItems: 'center',
        padding: spacing.xxxl,
        borderRadius: 16,
        borderWidth: 1,
        gap: spacing.md,
    },
    emptyText: {
        fontSize: font.base,
        textAlign: 'center',
    },
    petList: { gap: spacing.md },
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        gap: spacing.lg,
    },
    petAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    petInfo: { flex: 1 },
    petName: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    petBreed: {
        fontSize: font.base,
        marginTop: spacing.xxs,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
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
        borderWidth: 1,
    },
    enrollButtonText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    footer: { height: 20 },
});
