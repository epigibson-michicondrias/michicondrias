/**
 * useWalkerCalendar — calendario de paseos del profesional (`(app)/paseadores/calendario`).
 * Espejo de `mobile/src/hooks/paseadores/useWalkerCalendar.ts`.
 */
import { useMemo, useState } from "react";
import { useProRequests } from "@/features/servicios-pro/useProRequests";
import type { CalendarRequestItem } from "@/features/servicios-pro/CalendarBoard";
import type { WalkRequest } from "@/services/paseadores";

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

  const { allRequests, isLoading } = useProRequests("walk");
  const requests = allRequests as WalkRequest[];

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarRequestItem[]> = {};
    requests.forEach((req) => {
      if (!req.requested_date) return;
      const key = req.requested_date.substring(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: req.id,
        status: req.status,
        title: req.pet_name || "Mascota",
        meta: `Cliente: ${req.client_name || "Sin nombre"}`,
        timeText: [req.requested_time, req.duration_minutes ? `${req.duration_minutes} min` : null]
          .filter(Boolean)
          .join(" · ") || null,
        address: req.pickup_address || null,
      });
    });
    return map;
  }, [requests]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const selectedDateKey = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const selectedRequests = selectedDateKey ? itemsByDate[selectedDateKey] || [] : [];

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
    requestsByDate: itemsByDate,
    selectedRequests,
    isLoading,
    prevMonth,
    nextMonth,
  };
}
