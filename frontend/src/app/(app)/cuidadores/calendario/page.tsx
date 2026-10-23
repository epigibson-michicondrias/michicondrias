"use client";

/**
 * Calendario de cuidados (`/cuidadores/calendario`).
 * Espejo de `mobile/app/cuidadores/calendario.tsx`.
 */
import { useRouter } from "next/navigation";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import CalendarBoard from "@/features/servicios-pro/CalendarBoard";
import { useSitterCalendar } from "@/hooks/cuidadores/useSitterCalendar";

export default function CuidadoresCalendarioPage() {
  const router = useRouter();
  const c = useSitterCalendar();

  return (
    <ScreenContainer>
      <ScreenHeader title="Calendario" subtitle="Tus cuidados del mes" module="cuidadores" />
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
        unitLabel="cuidado(s)"
        onOpenRequest={() => router.push("/cuidadores/solicitudes")}
      />
    </ScreenContainer>
  );
}
