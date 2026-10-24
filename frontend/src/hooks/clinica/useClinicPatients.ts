/**
 * useClinicPatients — pacientes de la clínica con búsqueda y filtros (`(app)/mi-clinica/pacientes`).
 * En la app esta lógica vive en la pantalla; aquí se separa para respetar pantalla → hook → service.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics } from '@/services/directorio';
import { getClinicPatients, type ClinicPatient } from '@/services/patients';

export type PatientFilter = 'all' | 'upcoming' | 'critical';

const isCritical = (p: ClinicPatient) => p.alert_level === 'red' || p.alert_level === 'yellow';
const MATCH: Record<PatientFilter, (p: ClinicPatient) => boolean> = {
    all: () => true,
    upcoming: (p) => !!p.next_visit,
    critical: isCritical,
};

export function useClinicPatients() {
    const [filter, setFilter] = useState<PatientFilter>('all');
    const [q, setQ] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({ queryKey: ['my-clinics'], queryFn: getMyClinics });
    const clinic = clinics[0];
    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['clinic-patients', clinic?.id],
        queryFn: () => getClinicPatients(clinic!.id),
        enabled: !!clinic?.id,
    });

    const list = useMemo(() => {
        const query = q.trim().toLowerCase();
        return patients.filter((p) => MATCH[filter](p) && `${p.name} ${p.owner}`.toLowerCase().includes(query));
    }, [patients, filter, q]);

    const count = (f: PatientFilter) => patients.filter(MATCH[f]).length;

    return { filter, setFilter, q, setQ, list, count, isCritical, isLoading: loadingClinics || isLoading };
}
