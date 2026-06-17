import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useTrainerDashboard } from '@/src/hooks/training';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import {
    Target,
    Plus,
    Video,
    CheckCircle,
    XCircle,
    Trophy,
    ClipboardList,
    X,
} from 'lucide-react-native';

/** Placeholder goals for demonstration (in a real app these would come from an API query) */
interface LocalGoal {
    id: string;
    goal_name: string;
    status: string;
    progress_notes?: string;
    video_proof_url?: string;
}

const MOCK_STATUSES: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pendiente', color: '#f59e0b', icon: ClipboardList },
    in_progress: { label: 'En progreso', color: '#3b82f6', icon: Target },
    video_submitted: { label: 'Video enviado', color: '#8b5cf6', icon: Video },
    completed: { label: 'Completado', color: '#22c55e', icon: Trophy },
    rejected: { label: 'Rechazado', color: '#ef4444', icon: XCircle },
};

export default function GoalManagementScreen() {
    const { theme } = useTheme();
    const {
        goalForm,
        setGoalForm,
        reviewNotes,
        setReviewNotes,
        handleCreateGoal,
        handleReviewVideo,
        isCreatingGoal,
        isReviewingVideo,
    } = useTrainerDashboard();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<LocalGoal | null>(null);

    // Placeholder goals for the UI (real data would come from a query)
    const [goals] = useState<LocalGoal[]>([
        { id: '1', goal_name: 'Sentarse al comando', status: 'completed', progress_notes: 'Excelente progreso' },
        { id: '2', goal_name: 'Caminar con correa', status: 'in_progress', progress_notes: 'Mejorando cada día' },
        { id: '3', goal_name: 'Venir al llamado', status: 'video_submitted', video_proof_url: 'https://example.com/video.mp4' },
        { id: '4', goal_name: 'Quedarse quieto', status: 'pending' },
    ]);

    const completedCount = goals.filter(g => g.status === 'completed').length;
    const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

    const openReview = (goal: LocalGoal) => {
        setSelectedGoal(goal);
        setReviewNotes('');
        setShowReviewModal(true);
    };

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                <ScreenHeader title="Metas" rightElement={<View style={styles.placeholder} />} />

                {/* Progress Overview */}
                <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <View style={styles.progressHeader}>
                        <Trophy size={22} color={theme.primary} />
                        <Text style={[styles.progressTitle, { color: theme.text }]}>Progreso General</Text>
                    </View>
                    <View style={styles.progressRow}>
                        <View style={[styles.progressCircle, { borderColor: theme.primary }]}>
                            <Text style={[styles.progressPercent, { color: theme.primary }]}>{progressPercent}%</Text>
                        </View>
                        <View style={styles.progressStats}>
                            <Text style={[styles.progressStatText, { color: theme.text }]}>
                                {completedCount} de {goals.length} metas completadas
                            </Text>
                            <View style={[styles.progressBarBg, { backgroundColor: theme.overlay }]}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { backgroundColor: theme.primary, width: `${progressPercent}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Goals List */}
                <View style={styles.goalsSection}>
                    <View style={styles.goalsSectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de Metas</Text>
                        <TouchableOpacity
                            style={[styles.addGoalBtn, { backgroundColor: theme.primary }]}
                            onPress={() => setShowCreateModal(true)}
                            activeOpacity={0.8}
                        >
                            <Plus size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {goals.map((goal) => {
                        const statusInfo = MOCK_STATUSES[goal.status] || MOCK_STATUSES.pending;
                        const StatusIcon = statusInfo.icon;
                        const hasVideo = goal.status === 'video_submitted';

                        return (
                            <View
                                key={goal.id}
                                style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                            >
                                <View style={styles.goalHeader}>
                                    <View style={[styles.goalIconBg, { backgroundColor: statusInfo.color + '20' }]}>
                                        <StatusIcon size={18} color={statusInfo.color} />
                                    </View>
                                    <View style={styles.goalInfo}>
                                        <Text style={[styles.goalName, { color: theme.text }]}>{goal.goal_name}</Text>
                                        <View style={[styles.goalStatusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                                            <Text style={[styles.goalStatusText, { color: statusInfo.color }]}>
                                                {statusInfo.label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {goal.progress_notes && (
                                    <Text style={[styles.goalNotes, { color: theme.textMuted }]}>
                                        {goal.progress_notes}
                                    </Text>
                                )}

                                {/* Video Review Button */}
                                {hasVideo && (
                                    <View style={styles.videoActions}>
                                        <TouchableOpacity
                                            style={[styles.reviewBtn, { backgroundColor: '#22c55e' }]}
                                            onPress={() => openReview(goal)}
                                            activeOpacity={0.8}
                                        >
                                            <CheckCircle size={16} color="#fff" />
                                            <Text style={styles.reviewBtnText}>Revisar Video</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footer} />
            </ScrollView>

            {/* Create Goal Modal */}
            <Modal visible={showCreateModal} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Meta</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={22} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.modalLabel, { color: theme.text }]}>Nombre de la meta *</Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                                placeholder="Ej: Sentarse al comando"
                                placeholderTextColor={theme.textMuted}
                                value={goalForm.goal_name}
                                onChangeText={(v) => setGoalForm(prev => ({ ...prev, goal_name: v }))}
                            />

                            <Text style={[styles.modalLabel, { color: theme.text }]}>Notas de progreso</Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    styles.modalTextArea,
                                    { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                                ]}
                                placeholder="Notas adicionales..."
                                placeholderTextColor={theme.textMuted}
                                value={goalForm.progress_notes}
                                onChangeText={(v) => setGoalForm(prev => ({ ...prev, progress_notes: v }))}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                            onPress={() => {
                                handleCreateGoal('placeholder-pet-id');
                                setShowCreateModal(false);
                            }}
                            disabled={isCreatingGoal}
                            activeOpacity={0.8}
                        >
                            {isCreatingGoal ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.modalSubmitText}>Crear Meta</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Review Video Modal */}
            <Modal visible={showReviewModal} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Revisar Video</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <X size={22} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.reviewGoalName, { color: theme.text }]}>
                                {selectedGoal?.goal_name}
                            </Text>

                            {/* Video placeholder */}
                            <View style={[styles.videoPlaceholder, { backgroundColor: theme.overlay }]}>
                                <Video size={40} color={theme.textMuted} />
                                <Text style={[styles.videoPlaceholderText, { color: theme.textMuted }]}>
                                    Video de evidencia
                                </Text>
                            </View>

                            <Text style={[styles.modalLabel, { color: theme.text }]}>Notas de revisión</Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    styles.modalTextArea,
                                    { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text },
                                ]}
                                placeholder="Comentarios sobre el video..."
                                placeholderTextColor={theme.textMuted}
                                value={reviewNotes}
                                onChangeText={setReviewNotes}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.reviewActions}>
                            <TouchableOpacity
                                style={[styles.rejectBtn, { borderColor: '#ef4444' }]}
                                onPress={() => {
                                    if (selectedGoal) handleReviewVideo(selectedGoal.id, false);
                                    setShowReviewModal(false);
                                }}
                                disabled={isReviewingVideo}
                                activeOpacity={0.8}
                            >
                                <XCircle size={18} color="#ef4444" />
                                <Text style={[styles.rejectBtnText, { color: '#ef4444' }]}>Rechazar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.approveBtn, { backgroundColor: '#22c55e' }]}
                                onPress={() => {
                                    if (selectedGoal) handleReviewVideo(selectedGoal.id, true);
                                    setShowReviewModal(false);
                                }}
                                disabled={isReviewingVideo}
                                activeOpacity={0.8}
                            >
                                {isReviewingVideo ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <CheckCircle size={18} color="#fff" />
                                        <Text style={styles.approveBtnText}>Aprobar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    placeholder: { width: 24 },
    progressCard: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    progressCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressPercent: {
        fontSize: 18,
        fontWeight: '900',
    },
    progressStats: {
        flex: 1,
        gap: 8,
    },
    progressStatText: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    goalsSection: {
        paddingHorizontal: 24,
        gap: 12,
    },
    goalsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    addGoalBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    goalIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalInfo: {
        flex: 1,
        gap: 6,
    },
    goalName: {
        fontSize: 15,
        fontWeight: '700',
    },
    goalStatusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    goalStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    goalNotes: {
        fontSize: 13,
        lineHeight: 18,
    },
    videoActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    reviewBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    footer: { height: 40 },

    // Modals
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modalBody: { gap: 12 },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalInput: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        fontSize: 15,
    },
    modalTextArea: {
        minHeight: 80,
        paddingTop: 14,
    },
    modalSubmitBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 16,
    },
    modalSubmitText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    reviewGoalName: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    videoPlaceholder: {
        height: 160,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    videoPlaceholderText: {
        fontSize: 13,
    },
    reviewActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    rejectBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 6,
    },
    rejectBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    approveBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 6,
    },
    approveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
