/**
 * useSitterCalendar — Hook for sitter calendar screen
 * Manages calendar state, sit requests fetching, and date-range grouping
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySitRequests, SitRequest } from '@/src/services/cuidadores';

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

function datesInRange(startDate: string, endDate: string): string[] {
    const keys: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cur = new Date(start);
    while (cur <= end) {
        keys.push(cur.toISOString().substring(0, 10));
        cur.setDate(cur.getDate() + 1);
    }
    return keys;
}

export function useSitterCalendar() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['my-sit-requests'],
        queryFn: getMySitRequests,
    });

    const requestsByDate = useMemo(() => {
        const map: Record<string, SitRequest[]> = {};
        requests.forEach((req) => {
            if (req.start_date && req.end_date) {
                const keys = datesInRange(req.start_date.substring(0, 10), req.end_date.substring(0, 10));
                keys.forEach((key) => {
                    if (!map[key]) map[key] = [];
                    map[key].push(req);
                });
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
