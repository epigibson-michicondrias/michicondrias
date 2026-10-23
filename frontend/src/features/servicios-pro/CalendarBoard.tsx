"use client";

/**
 * CalendarBoard — calendario mensual con las solicitudes del día (paseos o cuidados).
 * Espejo de las pantallas `calendario.tsx` de la app.
 */
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { SkeletonList } from "@/components/Skeleton";
import StatusBadge from "./StatusBadge";
import { formatIsoDate } from "./requestStatus";
import s from "./servicios-pro.module.css";

export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
export const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export interface CalendarRequestItem {
  id: string;
  status: string;
  title: string;
  meta: string;
  timeText?: string | null;
  address?: string | null;
}

interface CalendarBoardProps {
  isLoading: boolean;
  today: Date;
  currentMonth: number;
  currentYear: number;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  calendarDays: (number | null)[];
  requestsByDate: Record<string, CalendarRequestItem[]>;
  selectedRequests: CalendarRequestItem[];
  /** "paseo(s)" / "cuidado(s)". */
  unitLabel: string;
  onOpenRequest?: (item: CalendarRequestItem) => void;
}

export default function CalendarBoard({
  isLoading, today, currentMonth, currentYear, selectedDay, onSelectDay, onPrevMonth, onNextMonth,
  calendarDays, requestsByDate, selectedRequests, unitLabel, onOpenRequest,
}: CalendarBoardProps) {
  if (isLoading) {
    return <SkeletonList count={4} />;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div>
      <div className={s.monthNav}>
        <button type="button" className={s.navBtn} onClick={onPrevMonth} aria-label="Mes anterior">
          <ChevronLeft size={20} />
        </button>
        <p className={s.monthText}>
          {MONTHS_ES[currentMonth]} {currentYear}
        </p>
        <button type="button" className={s.navBtn} onClick={onNextMonth} aria-label="Mes siguiente">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={s.dayHeaders}>
        {DAYS_ES.map((day) => (
          <span key={day} className={s.dayHeaderText}>
            {day}
          </span>
        ))}
      </div>

      <div className={s.calendarGrid}>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <span key={`empty-${idx}`} className={`${s.dayCell} ${s.dayCellEmpty}`} aria-hidden />;
          }
          const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
          const dayRequests = requestsByDate[dateKey] || [];
          const isSelected = selectedDay === day;
          return (
            <button
              key={`day-${day}`}
              type="button"
              className={`${s.dayCell} ${isSelected ? s.daySelected : ""} ${!isSelected && isToday(day) ? s.dayToday : ""}`}
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              aria-label={`${day} de ${MONTHS_ES[currentMonth]}${dayRequests.length ? `, ${dayRequests.length} ${unitLabel}` : ""}`}
            >
              {day}
              {dayRequests.length > 0 ? <span className={s.dayDot} aria-hidden /> : null}
            </button>
          );
        })}
      </div>

      <p className={s.dayListTitle}>
        {selectedDay
          ? `${selectedDay} de ${MONTHS_ES[currentMonth]} — ${selectedRequests.length} ${unitLabel}`
          : "Selecciona un día"}
      </p>

      {selectedRequests.length === 0 ? (
        <div className={s.dayEmpty}>
          {selectedDay ? `Sin ${unitLabel} este día` : `Toca un día del calendario`}
        </div>
      ) : (
        <div className={s.dayList}>
          {selectedRequests.map((req) => (
            <button
              key={req.id}
              type="button"
              className={s.dayRequest}
              onClick={() => onOpenRequest?.(req)}
            >
              <div className={s.requestInfo}>
                <p className={s.dayRequestTitle}>{req.title}</p>
                <p className={s.dayRequestMeta}>{req.meta}</p>
                {req.timeText ? (
                  <p className={s.dayRequestMeta}>
                    <Clock size={12} aria-hidden /> {req.timeText}
                  </p>
                ) : null}
                {req.address ? (
                  <p className={s.dayRequestMeta}>
                    <MapPin size={12} aria-hidden /> {req.address}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={req.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { formatIsoDate };
