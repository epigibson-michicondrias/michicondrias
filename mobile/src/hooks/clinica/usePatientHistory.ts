import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppointmentItem } from '@/src/services/directorio';
import { createRecord, MedicalRecordCreate } from '@/src/services/carnet';
import { showAlert } from '@/src/components/AppAlert';

export function usePatientHistory(id: string, appointmentId?: string) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');
    const [notes, setNotes] = useState('');
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    const { data: appointments = [] } = useQuery<AppointmentItem[]>({
        queryKey: ['clinic-appointments'],
        enabled: !!appointmentId,
    });

    const appointment = (appointments as AppointmentItem[]).find((a: AppointmentItem) => a.id === appointmentId);

    useEffect(() => {
        if (appointment) {
            setReason(appointment.service_name || '');
        }
    }, [appointment]);

    const addPrescriptionRow = () => {
        setPrescriptions([...prescriptions, {
            medication_name: '',
            dosage: '',
            frequency_hours: 8,
            duration_days: 7,
            instructions: ''
        }]);
    };

    const updatePrescription = (index: number, field: string, value: any) => {
        const newP = [...prescriptions];
        newP[index] = { ...newP[index], [field]: value };
        setPrescriptions(newP);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!reason || !diagnosis) {
            showAlert({ type: 'error', title: 'Error', message: 'El motivo y el diagnóstico son obligatorios' });
            return;
        }

        setLoading(true);
        try {
            const payload: MedicalRecordCreate = {
                pet_id: appointment?.pet_id || id,
                reason_for_visit: reason,
                diagnosis,
                treatment,
                weight_kg: weight ? parseFloat(weight) : undefined,
                temperature_c: temp ? parseFloat(temp) : undefined,
                notes,
                appointment_id: appointmentId || undefined,
                prescriptions: prescriptions.map(p => ({
                    ...p,
                    frequency_hours: parseInt(p.frequency_hours),
                    duration_days: parseInt(p.duration_days)
                }))
            };

            await createRecord(payload);

            showAlert({ type: 'success', title: 'Éxito', message: 'Ficha médica generada correctamente', onButtonPress: () => router.push('/mi-clinica/agenda' as any) });
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo guardar la ficha médica' });
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        loading,
        reason, setReason,
        diagnosis, setDiagnosis,
        treatment, setTreatment,
        weight, setWeight,
        temp, setTemp,
        notes, setNotes,
        prescriptions,
        // Data
        appointment,
        // Actions
        addPrescriptionRow,
        updatePrescription,
        removePrescription,
        handleSave,
    };
}
