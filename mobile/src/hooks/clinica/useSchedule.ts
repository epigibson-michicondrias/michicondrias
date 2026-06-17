/**
 * useSchedule — Hook for clinic schedule (horarios) screen
 * Manages weekly schedule, holidays, time picker, and save logic
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    getMyClinics,
    getClinicSchedule,
    setClinicSchedule,
    getScheduleExceptions,
    addScheduleException,
} from '@/src/services/directorio';
import type { ClinicScheduleItem, ScheduleException } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export interface ScheduleDay {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breaks: Array<{
        start: string;
        end: string;
    }>;
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
    isClosed: boolean;
    reason?: string;
}

export function useSchedule() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [holidayModalVisible, setHolidayModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Time Picker State
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [timePickerTarget, setTimePickerTarget] = useState<{ index: number; field: keyof ScheduleDay; title: string } | null>(null);
    const [tempTime, setTempTime] = useState('09:00');

    // Schedule State
    const [schedule, setSchedule] = useState<ScheduleDay[]>([
        { day: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Martes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '18:00', breaks: [] },
        { day: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '14:00', breaks: [] },
        { day: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '14:00', breaks: [] },
    ]);

    // Holidays State
    const [holidays, setHolidays] = useState<Holiday[]>([
        { id: '1', name: 'Año Nuevo', date: '2024-01-01', isClosed: true, reason: 'Festivo nacional' },
        { id: '2', name: 'Día de la Independencia', date: '2024-09-16', isClosed: true, reason: 'Festivo nacional' },
        { id: '3', name: 'Navidad', date: '2024-12-25', isClosed: true, reason: 'Festivo nacional' },
    ]);

    // Holiday Form State
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState('');
    const [holidayReason, setHolidayReason] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    // Fetch real schedule from API
    const { data: apiSchedule = [] } = useQuery<ClinicScheduleItem[]>({
        queryKey: ['clinic-schedule', clinic?.id],
        queryFn: () => getClinicSchedule(clinic!.id),
        enabled: !!clinic?.id,
    });

    // Fetch schedule exceptions from API
    const { data: scheduleExceptions = [] } = useQuery<ScheduleException[]>({
        queryKey: ['schedule-exceptions', clinic?.id],
        queryFn: () => getScheduleExceptions(clinic!.id),
        enabled: !!clinic?.id,
    });

    // Save schedule mutation
    const saveScheduleMutation = useMutation({
        mutationFn: (schedules: { day_of_week: number; start_time: string; end_time: string; slot_duration_minutes?: number }[]) =>
            setClinicSchedule(clinic!.id, schedules),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-schedule', clinic?.id] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Horarios actualizados correctamente' });
            router.back();
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar los horarios' });
        },
    });

    // Add schedule exception mutation
    const addExceptionMutation = useMutation({
        mutationFn: (data: Partial<ScheduleException>) =>
            addScheduleException(clinic!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule-exceptions', clinic?.id] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Excepción de horario agregada correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo agregar la excepción' });
        },
    });

    const updateDaySchedule = (index: number, field: keyof ScheduleDay, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const handleSaveSchedule = async () => {
        if (!clinic?.id) return;
        const schedules = schedule
            .filter(s => s.isOpen)
            .map((s, index) => ({
                day_of_week: index,
                start_time: s.openTime,
                end_time: s.closeTime,
                slot_duration_minutes: 30,
            }));
        saveScheduleMutation.mutate(schedules);
    };

    const handleAddHoliday = () => {
        if (!holidayName || !holidayDate) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa el nombre y la fecha' });
            return;
        }

        const newHoliday: Holiday = {
            id: Date.now().toString(),
            name: holidayName,
            date: holidayDate,
            isClosed: true,
            reason: holidayReason || 'Día festivo',
        };

        setHolidays([...holidays, newHoliday]);
        setHolidayName('');
        setHolidayDate('');
        setHolidayReason('');
        setHolidayModalVisible(false);
        showAlert({ type: 'success', title: 'Éxito', message: 'Día festivo agregado correctamente' });
    };

    const handleDeleteHoliday = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Día Festivo',
            message: '¿Estás seguro de eliminar este día festivo?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => {
                setHolidays(holidays.filter(h => h.id !== id));
                showAlert({ type: 'success', title: 'Eliminado', message: 'Día festivo eliminado correctamente' });
            },
        });
    };

    const openTimePicker = (index: number, field: keyof ScheduleDay, title: string, currentTime: string) => {
        setTempTime(currentTime);
        setTimePickerTarget({ index, field, title });
        setTimePickerVisible(true);
    };

    const confirmTimePicker = () => {
        if (timePickerTarget && tempTime.length === 5 && tempTime.includes(':')) {
            updateDaySchedule(timePickerTarget.index, timePickerTarget.field, tempTime);
            setTimePickerVisible(false);
        } else {
            showAlert({ type: 'error', title: 'Formato Inválido', message: 'Usa el formato HH:MM' });
        }
    };

    const cancelTimePicker = () => {
        setTimePickerVisible(false);
    };

    return {
        // Clinic
        clinic,
        loadingClinics,
        // Schedule
        schedule,
        updateDaySchedule,
        handleSaveSchedule,
        loading: saveScheduleMutation.isPending,
        // API Schedule
        apiSchedule,
        scheduleExceptions,
        // Add Exception
        handleAddException: (data: Partial<ScheduleException>) => addExceptionMutation.mutate(data),
        isAddingException: addExceptionMutation.isPending,
        // Holidays
        holidays,
        handleAddHoliday,
        handleDeleteHoliday,
        // Holiday Modal
        holidayModalVisible,
        setHolidayModalVisible,
        holidayName,
        setHolidayName,
        holidayDate,
        setHolidayDate,
        holidayReason,
        setHolidayReason,
        // Time Picker
        timePickerVisible,
        timePickerTarget,
        tempTime,
        setTempTime,
        openTimePicker,
        confirmTimePicker,
        cancelTimePicker,
    };
}
