import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getAllPrograms, TrainingProgram } from '../../src/services/training';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Dumbbell, Clock, DollarSign, Info, Calendar } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

export default function ProgramDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? {
        background: '#000',
        text: '#fff',
        textMuted: '#999',
        surface: '#111',
        border: '#333',
        primary: '#7c3aed',
        secondary: '#10b981',
    } : {
        background: '#fff',
        text: '#000',
        textMuted: '#666',
        surface: '#f9f9f9',
        border: '#e5e5e5',
        primary: '#7c3aed',
        secondary: '#10b981',
    };

    const { data: programs = [], isLoading, error } = useQuery<TrainingProgram[]>({
        queryKey: ['trainingPrograms'],
        queryFn: () => getAllPrograms(),
    });

    const program = programs.find(p => p.id === id);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Programa</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </View>
        );
    }

    if (error || !program) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Programa</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del programa.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleEnroll = () => {
        showAlert({
            type: 'info',
            title: 'Inscribir mascota',
            message: '¿Deseas inscribir a tu mascota en este programa?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Inscribir',
            onButtonPress: () => showAlert({ type: 'info', title: 'Inscripción', message: 'Redirigiendo al formulario de inscripción...' }),
        });
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle del Programa</Text>
                <View style={styles.placeholder} />
            </View>

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
                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>ID del Programa:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{program.id.substring(0, 12)}...</Text>
                </View>
                <View style={styles.detailRow}>
                    <Info size={16} color={theme.textMuted} />
                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Entrenador:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{program.trainer_id.substring(0, 12)}...</Text>
                </View>
                <View style={styles.detailRow}>
                    <Calendar size={16} color={theme.textMuted} />
                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Duración:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                        {program.duration_weeks} {program.duration_weeks === 1 ? 'semana' : 'semanas'}
                    </Text>
                </View>
            </View>

            {/* Benefits */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Beneficios</Text>
                <View style={styles.benefitItem}>
                    <View style={[styles.benefitDot, { backgroundColor: theme.secondary }]} />
                    <Text style={[styles.benefitText, { color: theme.textMuted }]}>Entrenamiento personalizado</Text>
                </View>
                <View style={styles.benefitItem}>
                    <View style={[styles.benefitDot, { backgroundColor: theme.secondary }]} />
                    <Text style={[styles.benefitText, { color: theme.textMuted }]}>Seguimiento de progreso semanal</Text>
                </View>
                <View style={styles.benefitItem}>
                    <View style={[styles.benefitDot, { backgroundColor: theme.secondary }]} />
                    <Text style={[styles.benefitText, { color: theme.textMuted }]}>Videos de evidencia de avance</Text>
                </View>
                <View style={styles.benefitItem}>
                    <View style={[styles.benefitDot, { backgroundColor: theme.secondary }]} />
                    <Text style={[styles.benefitText, { color: theme.textMuted }]}>Soporte continuo del entrenador</Text>
                </View>
            </View>

            {/* Enroll Button */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.enrollButton, { backgroundColor: theme.primary }]}
                    onPress={handleEnroll}
                >
                    <Dumbbell size={20} color="#fff" />
                    <Text style={styles.enrollButtonText}>Inscribir Mascota</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    placeholder: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    programHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 12,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    programName: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    programDesc: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    detailLabel: {
        fontSize: 14,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    benefitDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    benefitText: {
        fontSize: 14,
        flex: 1,
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
    },
    enrollButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
});
