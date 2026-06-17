import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useEnrollment } from '@/src/hooks/training';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Dumbbell, DollarSign, Clock, PawPrint, CheckCircle, ArrowRight } from 'lucide-react-native';

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
                <ScreenHeader title="Inscribir Mascota" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ScreenHeader title="Inscribir Mascota" rightElement={<View style={styles.placeholder} />} />

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
                                    <TouchableOpacity
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
                                                <CheckCircle size={18} color="#fff" />
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
                    <TouchableOpacity
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
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Dumbbell size={20} color={selectedPetId ? '#fff' : theme.textMuted} />
                                <Text style={[
                                    styles.enrollButtonText,
                                    { color: selectedPetId ? '#fff' : theme.textMuted },
                                ]}>
                                    Confirmar Inscripción
                                </Text>
                                <ArrowRight size={18} color={selectedPetId ? '#fff' : theme.textMuted} />
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
    placeholder: { width: 24 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: { fontSize: 16 },
    programCard: {
        marginHorizontal: 24,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 24,
    },
    programIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    programName: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    programDesc: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 16,
    },
    programStats: {
        flexDirection: 'row',
        gap: 12,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    sectionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    emptyPets: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    petList: { gap: 12 },
    petCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
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
        fontSize: 16,
        fontWeight: '700',
    },
    petBreed: {
        fontSize: 13,
        marginTop: 2,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    enrollButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        borderWidth: 1,
    },
    enrollButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: { height: 20 },
});
