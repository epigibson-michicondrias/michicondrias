"use client";

/**
 * Calendario de paseos (`/paseadores/calendario`).
 * Espejo de `mobile/app/paseadores/calendario.tsx`.
 */
import { useRouter } from "next/navigation";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import CalendarBoard from "@/features/servicios-pro/CalendarBoard";
import { useWalkerCalendar } from "@/hooks/paseadores/useWalkerCalendar";

export default function PaseadoresCalendarioPage() {
  const router = useRouter();
  const c = useWalkerCalendar();

  return (
    <ScreenContainer>
      <ScreenHeader title="Calendario" subtitle="Tus paseos del mes" module="paseadores" />
      <CalendarBoard
        isLoading={c.isLoading}
        today={c.today}
        currentMonth={c.currentMonth}
        currentYear={c.currentYear}
        selectedDay={c.selectedDay}
        onSelectDay={c.setSelectedDay}
        onPrevMonth={c.prevMonth}
        onNextMonth={c.nextMonth}
        calendarDays={c.calendarDays}
        requestsByDate={c.requestsByDate}
        selectedRequests={c.selectedRequests}
        unitLabel="paseo(s)"
        onOpenRequest={() => router.push("/paseadores/solicitudes")}
      />
    </ScreenContainer>
  );
}
