/**
 * useMyClinic — Hook for clinic dashboard screen
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyClinics, getClinicAppointments, getWeeklyMetrics } from '@/src/services/directorio';
import { getClinicMetrics, getClinicRevenue, getClinicOccupancy } from '@/src/services/metrics';
import { getCriticalPatients } from '@/src/services/patients';
import { getClinicAlerts } from '@/src/services/alerts';
import { useAuth } from '@/src/contexts/AuthContext';

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

export function useMyClinic() {
    const router = useRouter();
    const { user } = useAuth();
    const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    const { data: veterinaryMetrics } = useQuery({
        queryKey: ['clinic-metrics', clinic?.id],
        queryFn: () => getClinicMetrics(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 60000,
    });

    const { data: criticalPatientsData } = useQuery({
        queryKey: ['critical-patients', clinic?.id],
        queryFn: () => getCriticalPatients(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    const { data: veterinaryAlerts } = useQuery({
        queryKey: ['clinic-alerts', clinic?.id],
        queryFn: () => getClinicAlerts(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 15000,
    });

    const { data: appointments = [] } = useQuery({
        queryKey: ['clinic-appointments', clinic?.id],
        queryFn: () => getClinicAppointments(clinic?.id || '0'),
        enabled: !!clinic?.id,
    });

    const { data: revenueData } = useQuery({
        queryKey: ['clinic-revenue', clinic?.id, revenuePeriod],
        queryFn: () => getClinicRevenue(clinic!.id, revenuePeriod),
        enabled: !!clinic?.id,
        refetchInterval: 60000,
    });

    const { data: occupancyData } = useQuery({
        queryKey: ['clinic-occupancy', clinic?.id],
        queryFn: () => getClinicOccupancy(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 60000,
    });

    const { data: weeklyMetrics } = useQuery({
        queryKey: ['clinic-weekly-metrics', clinic?.id],
        queryFn: () => getWeeklyMetrics(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 60000,
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === todayStr);
    const pendingAppointments = appointments.filter(a => a.status === 'pending');

    const metrics = veterinaryMetrics || DEFAULT_METRICS;
    const alerts = veterinaryAlerts || [];
    const patients = criticalPatientsData || [];

    const goBack = () => router.back();
    const goToSettings = () => router.push(`/mi-clinica/configuracion` as any);
    const goToRegister = () => router.push('/directorio/nuevo-lugar' as any);

    return {
        clinic,
        loadingClinics,
        metrics,
        alerts,
        patients,
        todayAppointments,
        pendingAppointments,
        appointments,
        user,
        revenueData,
        occupancyData,
        weeklyMetrics,
        revenuePeriod,
        setRevenuePeriod,
        goBack,
        goToSettings,
        goToRegister,
    };
}
