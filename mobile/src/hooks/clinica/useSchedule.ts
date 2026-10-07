/**
 * useSchedule — Hook for clinic schedule (horarios) screen
 * Manages weekly schedule, holidays, time picker, and save logic
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    getMyClinics,
    getClinicSchedule,
    setClinicSchedule,
    getScheduleExceptions,
    addScheduleException,
    deleteScheduleException,
} from '@/src/services/directorio';
import type { ClinicScheduleItem, ScheduleException } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export interface ScheduleDay {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breaks: {
        start: string;
        end: string;
    }[];
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

    // Holiday Form State
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState(() => new Date().toISOString().slice(0, 10));
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

    // El horario guardado en el servidor reemplaza los valores por defecto (0 = Lunes, igual que al guardar)
    useEffect(() => {
        if (!apiSchedule.length) return;
        setSchedule(prev => prev.map((day, index) => {
            const saved = apiSchedule.find(s => s.day_of_week === index && s.is_active);
            return saved
                ? { ...day, isOpen: true, openTime: saved.start_time.slice(0, 5), closeTime: saved.end_time.slice(0, 5) }
                : { ...day, isOpen: false };
        }));
    }, [apiSchedule]);

    // Días festivos = excepciones de cierre guardadas en el servidor
    const holidays: Holiday[] = useMemo(
        () => scheduleExceptions
            .filter(e => e.is_closed)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(e => ({ id: e.id, name: e.reason || 'Día festivo', date: e.date, isClosed: true })),
        [scheduleExceptions],
    );

    // Save schedule mutation
    const saveScheduleMutation = useMutation({
        mutationFn: (schedules: { day_of_week: number; start_time: string; end_time: string; slot_duration_minutes?: number }[]) =>
            setClinicSchedule(clinic!.id, schedules),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-schedule', clinic?.id] });
            queryClient.invalidateQueries({ queryKey: ['clinic-slots'] });
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
            queryClient.invalidateQueries({ queryKey: ['clinic-slots'] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Excepción de horario agregada correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo agregar la excepción' });
        },
    });

    const deleteExceptionMutation = useMutation({
        mutationFn: (exceptionId: string) => deleteScheduleException(clinic!.id, exceptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule-exceptions', clinic?.id] });
            showAlert({ type: 'success', title: 'Eliminado', message: 'Día festivo eliminado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar el día festivo' });
        },
    });

    const updateDaySchedule = (index: number, field: keyof ScheduleDay, value: any) => {
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setSchedule(newSchedule);
    };

    const handleSaveSchedule = async () => {
        if (!clinic?.id) return;
        // day_of_week es la posición real en la semana (0 = Lunes); se calcula ANTES de filtrar los días cerrados
        const schedules = schedule
            .map((s, index) => ({ s, index }))
            .filter(({ s }) => s.isOpen)
            .map(({ s, index }) => ({
                day_of_week: index,
                start_time: s.openTime,
                end_time: s.closeTime,
                slot_duration_minutes: 30,
            }));
        const invalid = schedule.find(s => s.isOpen && s.closeTime <= s.openTime);
        if (invalid) {
            showAlert({ type: 'error', title: 'Horario inválido', message: `En ${invalid.day} la hora de cierre debe ser posterior a la de apertura.` });
            return;
        }
        if (schedules.length === 0) {
            showAlert({ type: 'error', title: 'Sin días de atención', message: 'Activa al menos un día de la semana.' });
            return;
        }
        saveScheduleMutation.mutate(schedules);
    };

    const handleAddHoliday = () => {
        if (!holidayName || !holidayDate) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa el nombre y la fecha' });
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(holidayDate.trim()) || Number.isNaN(Date.parse(holidayDate.trim()))) {
            showAlert({ type: 'error', title: 'Fecha inválida', message: 'Usa el formato AAAA-MM-DD, por ejemplo 2026-12-25' });
            return;
        }

        addExceptionMutation.mutate(
            {
                date: holidayDate.trim(),
                is_closed: true,
                reason: holidayReason.trim() ? `${holidayName.trim()} — ${holidayReason.trim()}` : holidayName.trim(),
            },
            {
                onSuccess: () => {
                    setHolidayName('');
                    setHolidayDate(new Date().toISOString().slice(0, 10));
                    setHolidayReason('');
                    setHolidayModalVisible(false);
                },
            },
        );
    };

    const handleDeleteHoliday = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Día Festivo',
            message: '¿Estás seguro de eliminar este día festivo?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteExceptionMutation.mutate(id),
        });
    };

    const openTimePicker = (index: number, field: keyof ScheduleDay, title: string, currentTime: string) => {
        setTempTime(currentTime);
        setTimePickerTarget({ index, field, title });
        setTimePickerVisible(true);
    };

    const confirmTimePicker = () => {
        if (timePickerTarget && /^([01]\d|2[0-3]):[0-5]\d$/.test(tempTime)) {
            updateDaySchedule(timePickerTarget.index, timePickerTarget.field, tempTime);
            setTimePickerVisible(false);
        } else {
            showAlert({ type: 'error', title: 'Formato inválido', message: 'Usa el formato de 24 horas HH:MM, por ejemplo 09:30.' });
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
