import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useReminders } from '@/src/hooks/carnet/useReminders';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Bell, Check, Clock, Pill } from 'lucide-react-native';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import { ReminderWithDetails } from '@/src/services/reminders';

export default function PetRemindersScreen() {
    const { theme } = useTheme();
    const {
        reminders, pendingReminders, completedReminders,
        isLoading, refreshing, isCheckPending,
        formatNextDose, isOverdue,
        handleCheck, onRefresh, goBack,
    } = useReminders();

    const renderReminderItem = (item: ReminderWithDetails, isCompleted: boolean) => {
        const overdue = !isCompleted && isOverdue(item.remind_at);
        const statusColor = isCompleted ? '#10b981' : overdue ? '#ef4444' : theme.primary;

        return (
            <View
                key={item.id}
                style={[
                    styles.reminderCard,
                    {
                        backgroundColor: theme.surface,
                        borderColor: isCompleted ? '#10b98130' : overdue ? '#ef444430' : theme.borderLight,
                    },
                ]}
            >
                <View style={styles.reminderLeft}>
                    <View style={[styles.pillIcon, { backgroundColor: statusColor + '15' }]}>
                        <Pill size={20} color={statusColor} />
                    </View>
                    <View style={styles.reminderInfo}>
                        <Text style={[styles.medName, { color: theme.text }]}>{item.medication_name}</Text>
                        <Text style={[styles.dosageText, { color: theme.textMuted }]}>
                            {item.dosage} · Cada {item.frequency_hours}h · {item.duration_days}d
                        </Text>
                        <View style={styles.reminderMeta}>
                            <Clock size={12} color={statusColor} />
                            <Text style={[styles.nextDoseText, { color: statusColor, fontWeight: '700' }]}>
                                {formatNextDose(item.remind_at)}
                            </Text>
                        </View>
                        {item.instructions && (
                            <Text style={[styles.instructions, { color: theme.textMuted }]}>
                                {item.instructions}
                            </Text>
                        )}
                    </View>
                </View>

                {!isCompleted && (
                    <TouchableOpacity
                        style={[styles.checkButton, { backgroundColor: theme.primary }]}
                        onPress={() => handleCheck(item.id)}
                        disabled={isCheckPending}
                        activeOpacity={0.8}
                    >
                        <Check size={18} color="#fff" />
                    </TouchableOpacity>
                )}

                {isCompleted && (
                    <View style={[styles.completedBadge, { backgroundColor: '#10b98120' }]}>
                        <Check size={14} color="#10b981" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Recordatorios"
                onBack={goBack}
                rightElement={
                    <Badge
                        label={`${pendingReminders.length} pendiente${pendingReminders.length !== 1 ? 's' : ''}`}
                        color={pendingReminders.length > 0 ? '#f59e0b' : '#10b981'}
                    />
                }
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : reminders.length === 0 ? (
                    <EmptyState
                        icon={<Bell size={32} color={theme.primary} />}
                        title="Sin recordatorios"
                        subtitle="Los recordatorios de medicamentos se generan automáticamente cuando se crea una consulta con receta."
                    />
                ) : (
                    <>
                        {pendingReminders.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    Pendientes ({pendingReminders.length})
                                </Text>
                                {pendingReminders.map((item) => renderReminderItem(item, false))}
                            </View>
                        )}

                        {completedReminders.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                                    Completados ({completedReminders.length})
                                </Text>
                                {completedReminders.map((item) => renderReminderItem(item, true))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 14,
    },
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    reminderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    pillIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reminderInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 3,
    },
    dosageText: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    reminderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nextDoseText: {
        fontSize: 12,
    },
    instructions: {
        fontSize: 11,
        fontWeight: '500',
        fontStyle: 'italic',
        marginTop: 6,
    },
    checkButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    completedBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
});
