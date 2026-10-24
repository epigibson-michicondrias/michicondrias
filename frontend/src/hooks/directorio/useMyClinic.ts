/**
 * useMyClinic — panel "Mi clínica": perfil, métricas del día y citas pendientes.
 * Espejo simplificado de `mobile/src/hooks/directorio/useMyClinic.ts`.
 */
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyClinics, getClinicAppointments, getWeeklyMetrics } from "@/services/directorio";
import { getClinicMetrics, getClinicRevenue, getClinicOccupancy } from "@/services/metrics";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_METRICS = {
  todayAppointments: 0,
  pendingConfirmations: 0,
  surgeriesToday: 0,
  emergencyCases: 0,
  vaccinationsToday: 0,
  checkupsToday: 0,
  labResultsPending: 0,
  prescriptionsActive: 0,
  inventoryAlerts: 0,
  dailyRevenue: 0,
  occupancyRate: 0,
  newPatientsToday: 0,
  criticalPatients: 0,
};

/** YYYY-MM-DD en hora local. */
function todayYMD(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export type RevenuePeriod = "daily" | "weekly" | "monthly";

export function useMyClinic(revenuePeriod: RevenuePeriod = "daily") {
  const router = useRouter();
  const { user } = useAuth();

  const { data: clinics = [], isLoading: loadingClinics } = useQuery({
    queryKey: ["my-clinics"],
    queryFn: getMyClinics,
  });

  const clinic = clinics[0];
  const clinicId = clinic?.id;

  const { data: veterinaryMetrics } = useQuery({
    queryKey: ["clinic-metrics", clinicId],
    queryFn: () => getClinicMetrics(clinicId!),
    enabled: !!clinicId,
    refetchInterval: 60000,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["clinic-appointments", clinicId],
    queryFn: () => getClinicAppointments(clinicId!),
    enabled: !!clinicId,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["clinic-revenue", clinicId, revenuePeriod],
    queryFn: () => getClinicRevenue(clinicId!, revenuePeriod),
    enabled: !!clinicId,
    refetchInterval: 60000,
  });

  const { data: occupancyData } = useQuery({
    queryKey: ["clinic-occupancy", clinicId],
    queryFn: () => getClinicOccupancy(clinicId!),
    enabled: !!clinicId,
    refetchInterval: 60000,
  });

  const { data: weeklyMetrics } = useQuery({
    queryKey: ["clinic-weekly-metrics", clinicId],
    queryFn: () => getWeeklyMetrics(clinicId!),
    enabled: !!clinicId,
    refetchInterval: 60000,
  });

  const todayStr = todayYMD();
  const todayAppointments = useMemo(
    () => appointments.filter((a) => (a.date ?? "").slice(0, 10) === todayStr),
    [appointments, todayStr],
  );
  const pendingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "pending" || a.status === "scheduled"),
    [appointments],
  );

  return {
    clinic,
    loadingClinics,
    metrics: veterinaryMetrics || DEFAULT_METRICS,
    todayAppointments,
    pendingAppointments,
    appointments,
    user,
    revenueData,
    occupancyData,
    weeklyMetrics,
    goToRegister: () => router.push("/directorio/nuevo"),
  };
}
