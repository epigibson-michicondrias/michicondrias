/**
 * useWalkerCalendar — Hook for walker calendar screen
 * Manages calendar state, walk requests fetching, and date grouping
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyWalkRequests, WalkRequest } from '@/src/services/paseadores';

export const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#f59e0b', bg: '#f59e0b20', label: 'Pendiente' },
    confirmed: { color: '#10b981', bg: '#10b98120', label: 'Confirmado' },
    completed: { color: '#6366f1', bg: '#6366f120', label: 'Completado' },
    cancelled: { color: '#ef4444', bg: '#ef444420', label: 'Cancelado' },
};

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export function useWalkerCalendar() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['my-walk-requests'],
        queryFn: getMyWalkRequests,
    });

    const requestsByDate = useMemo(() => {
        const map: Record<string, WalkRequest[]> = {};
        requests.forEach((req) => {
            if (req.requested_date) {
                const key = req.requested_date.substring(0, 10);
                if (!map[key]) map[key] = [];
                map[key].push(req);
            }
        });
        return map;
    }, [requests]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const selectedDateKey = selectedDay
        ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
        : null;

    const selectedRequests = selectedDateKey ? requestsByDate[selectedDateKey] || [] : [];

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
        setSelectedDay(null);
    };

    return {
        today,
        currentMonth,
        currentYear,
        selectedDay,
        setSelectedDay,
        calendarDays,
        requestsByDate,
        selectedRequests,
        selectedDateKey,
        isLoading,
        prevMonth,
        nextMonth,
    };
}
