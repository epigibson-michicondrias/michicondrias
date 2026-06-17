/**
 * usePetCarnet — Data fetching and tab state for the pet carnet detail screen
 * Fetches pet info, medical records, vaccines, and medication reminders
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getPetById } from '@/src/services/mascotas';
import { getRecordsByPet, getVaccinesByPet } from '@/src/services/carnet';
import { getRemindersWithDetails, checkReminder } from '@/src/services/reminders';
import { getPetLabHistory } from '@/src/services/laboratorio';
import type { MedicalRecord, Vaccine } from '@/src/services/carnet';
import type { ReminderWithDetails } from '@/src/services/reminders';

export type CarnetTab = 'records' | 'vaccines' | 'reminders' | 'laboratorio';

export function usePetCarnet() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const petId = id as string;

    const [activeTab, setActiveTab] = useState<CarnetTab>('records');

    const isVet = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const { data: pet, isLoading: loadingPet } = useQuery({
        queryKey: ['pet', petId],
        queryFn: () => getPetById(petId),
    });

    const { data: records = [], isLoading: loadingRecords } = useQuery({
        queryKey: ['pet-records', petId],
        queryFn: () => getRecordsByPet(petId),
    });

    const { data: vaccines = [], isLoading: loadingVaccines } = useQuery({
        queryKey: ['pet-vaccines', petId],
        queryFn: () => getVaccinesByPet(petId),
    });

    const { data: reminders = [], isLoading: loadingReminders } = useQuery({
        queryKey: ['pet-reminders', petId],
        queryFn: () => getRemindersWithDetails(petId),
    });

    const { data: labHistory = [], isLoading: loadingLabHistory } = useQuery({
        queryKey: ['pet-lab-history', petId],
        queryFn: () => getPetLabHistory(petId),
    });

    const checkMutation = useMutation({
        mutationFn: checkReminder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-reminders', petId] });
        },
    });

    const handleCheck = (reminderId: string) => {
        checkMutation.mutate(reminderId);
    };

    const handleAddRecord = () => {
        router.push(`/carnet/nueva-consulta?pet_id=${petId}` as any);
    };

    const handleAddVaccine = () => {
        router.push(`/carnet/nueva-vacuna?pet_id=${petId}` as any);
    };

    return {
        petId,
        pet,
        loadingPet,
        records,
        loadingRecords,
        vaccines,
        loadingVaccines,
        reminders,
        loadingReminders,
        labHistory,
        loadingLabHistory,
        activeTab,
        setActiveTab,
        isVet,
        handleAddRecord,
        handleAddVaccine,
        handleCheck,
        isChecking: checkMutation.isPending,
    };
}

export type { MedicalRecord, Vaccine, ReminderWithDetails };
