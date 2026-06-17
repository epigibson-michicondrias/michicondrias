/**
 * useReminders — Hook for pet medication reminders screen
 * Manages reminder fetching, check mutation, and time formatting
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRemindersWithDetails, checkReminder, ReminderWithDetails } from '@/src/services/reminders';
import { getPetById } from '@/src/services/mascotas';
import { useAuth } from '@/src/contexts/AuthContext';

export function useReminders() {
    const { pet_id } = useLocalSearchParams<{ pet_id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [refreshing, setRefreshing] = useState(false);

    const isVet = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const { data: pet } = useQuery({
        queryKey: ['pet', pet_id],
        queryFn: () => getPetById(pet_id as string),
    });

    const { data: reminders = [], isLoading, refetch } = useQuery({
        queryKey: ['pet-reminders', pet_id],
        queryFn: () => getRemindersWithDetails(pet_id as string),
    });

    const checkMutation = useMutation({
        mutationFn: checkReminder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-reminders', pet_id] });
        },
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const pendingReminders = reminders.filter((r) => !r.sent);
    const completedReminders = reminders.filter((r) => r.sent);

    const formatNextDose = (remindAt: string): string => {
        const date = new Date(remindAt);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) return 'Atrasado';
        if (diffHours < 1) return 'En menos de 1 hora';
        if (diffHours < 24) return `En ${diffHours}h`;
        if (diffDays === 1) return 'Mañana';
        return `En ${diffDays} días`;
    };

    const isOverdue = (remindAt: string): boolean => {
        return new Date(remindAt).getTime() < Date.now();
    };

    const handleCheck = (reminderId: string) => {
        checkMutation.mutate(reminderId);
    };

    const goBack = () => router.back();

    return {
        // Data
        pet,
        reminders,
        pendingReminders,
        completedReminders,
        isLoading,
        refreshing,
        isVet,
        isCheckPending: checkMutation.isPending,

        // Helpers
        formatNextDose,
        isOverdue,

        // Actions
        handleCheck,
        onRefresh,
        goBack,
    };
}
