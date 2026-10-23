/**
 * useSitterCalendar — calendario de cuidados del profesional (`(app)/cuidadores/calendario`).
 * Espejo de `mobile/src/hooks/cuidadores/useSitterCalendar.ts`: agrupa por rango de fechas.
 */
import { useMemo, useState } from "react";
import { useProRequests } from "@/features/servicios-pro/useProRequests";
import type { CalendarRequestItem } from "@/features/servicios-pro/CalendarBoard";
import type { SitRequest } from "@/services/cuidadores";

const SIT_TYPE_LABELS: Record<string, string> = {
  hosting: "Hospedaje",
  visiting: "Visitas a domicilio",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function datesInRange(startDate: string, endDate: string): string[] {
  const keys: string[] = [];
  const cur = new Date(startDate);
  const end = new Date(endDate);
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

  const { allRequests, isLoading } = useProRequests("sit");
  const requests = allRequests as SitRequest[];

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarRequestItem[]> = {};
    requests.forEach((req) => {
      if (!req.start_date || !req.end_date) return;
      const keys = datesInRange(req.start_date.substring(0, 10), req.end_date.substring(0, 10));
      const item: CalendarRequestItem = {
        id: req.id,
        status: req.status,
        title: req.pet_name || "Mascota",
        meta: `${SIT_TYPE_LABELS[req.service_type] || "Cuidado"} · Cliente: ${req.client_name || "Sin nombre"}`,
        address: req.address || null,
      };
      keys.forEach((key) => {
        if (!map[key]) map[key] = [];
        map[key].push(item);
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
