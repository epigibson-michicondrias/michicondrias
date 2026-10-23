/**
 * useReportForm — Crear o editar un reporte de mascota perdida/encontrada (con `id` en la ruta = edición).
 * Valida en línea, sube la foto, ubica el punto con el GPS (en edición se puede mover a la posición actual).
 */
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { createReport, getPerdidasPresignedUrl, getReportById, updateReport } from '@/src/services/perdidas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { getS3Url, getFileExtension } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

export interface ReportFormState {
    pet_name: string;
    report_type: 'lost' | 'found';
    species: string;
    breed: string;
    color: string;
    size: string;
    age_approx: string;
    last_seen_location: string;
    description: string;
    contact_phone: string;
    contact_email: string;
}

type Point = { latitude: number; longitude: number };
type Errors = Partial<Record<'pet_name' | 'location' | 'contact_phone' | 'contact_email', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useReportForm() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!id;
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [image, setImage] = useState<string | null>(null);
    const [point, setPoint] = useState<Point | null>(null);
    const [locating, setLocating] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<ReportFormState>({
        pet_name: '',
        report_type: 'lost',
        species: 'gato',
        breed: '',
        color: '',
        size: 'mediano',
        age_approx: 'joven',
        last_seen_location: '',
        description: '',
        contact_phone: '',
        contact_email: user?.email || '',
    });

    const { data: report, isLoading: loadingReport } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(id as string),
        enabled: isEditing,
    });

    // Edición: precarga el reporte
    useEffect(() => {
        if (!report) return;
        setForm({
            pet_name: report.pet_name || '',
            report_type: report.report_type === 'found' ? 'found' : 'lost',
            species: report.species || 'gato',
            breed: report.breed || '',
            color: report.color || '',
            size: report.size || 'mediano',
            age_approx: report.age_approx || 'joven',
            last_seen_location: report.last_seen_location || '',
            description: report.description || '',
            contact_phone: report.contact_phone || '',
            contact_email: report.contact_email || '',
        });
        if (report.image_url) setImage(report.image_url);
        if (report.latitude != null && report.longitude != null) setPoint({ latitude: report.latitude, longitude: report.longitude });
    }, [report]);

    /** `silent`: el intento automático al abrir no muestra alertas (el error queda en línea al guardar). */
    const locate = async (silent = false) => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (silent) return;
                showAlert({ type: 'warning', title: 'Sin permiso de ubicación', message: 'Actívalo en los ajustes del teléfono para marcar el punto en el mapa.' });
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setPoint({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            setErrors((prev) => ({ ...prev, location: undefined }));
        } catch {
            if (silent) return;
            showAlert({ type: 'error', title: 'Sin ubicación', message: 'No pudimos obtener tu ubicación. Revisa que el GPS esté activo.' });
        } finally {
            setLocating(false);
        }
    };

    // Reporte nuevo: se ubica de inmediato en la posición actual
    useEffect(() => {
        if (!isEditing) locate(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const updateField = <K extends keyof ReportFormState>(field: K, value: ReportFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof Errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = (): boolean => {
        const next: Errors = {};
        if (!form.pet_name.trim()) next.pet_name = 'Escribe su nombre o una descripción corta.';
        if (!point) next.location = 'Marca el punto con «Usar mi ubicación».';
        const phone = form.contact_phone.trim();
        const email = form.contact_email.trim();
        if (!phone && !email) next.contact_phone = 'Agrega un teléfono o un correo para que puedan avisarte.';
        if (phone && phone.replace(/\D/g, '').length < 8) next.contact_phone = 'Escribe al menos 8 dígitos.';
        if (email && !EMAIL_RE.test(email)) next.contact_email = 'Revisa el correo.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const mutation = useMutation({
        mutationFn: async () => {
            let image_url = report?.image_url ?? null;
            if (image && !image.startsWith('http')) {
                const ext = getFileExtension(image);
                const { url, object_key } = await getPerdidasPresignedUrl(ext);
                await uploadImageToPresignedUrl(image, url, ext);
                image_url = getS3Url(object_key);
            } else if (!image) {
                image_url = null;
            }
            const payload = {
                ...form,
                contact_phone: form.contact_phone.trim() || null,
                contact_email: form.contact_email.trim() || null,
                latitude: point!.latitude,
                longitude: point!.longitude,
                image_url,
            };
            return isEditing
                ? updateReport(id as string, payload)
                : createReport({ ...payload, reporter_id: user!.id, status: 'active' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-report', id] });
            queryClient.invalidateQueries({ queryKey: ['lost-pet-reports'] });
            queryClient.invalidateQueries({ queryKey: ['my-lost-reports'] });
            showAlert(isEditing
                ? { type: 'success', title: 'Cambios guardados', message: 'El reporte ya muestra los datos nuevos.' }
                : { type: 'success', title: '¡Reporte publicado!', message: 'Ya aparece en el listado y en el mapa. Te avisaremos si alguien lo ve.' });
            router.back();
        },
        onError: (e: Error) => showAlert({ type: 'error', title: isEditing ? 'No se pudieron guardar los cambios' : 'No se pudo publicar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    const handleSave = () => {
        if (!validate() || !user) return;
        mutation.mutate();
    };

    return {
        isEditing,
        loadingReport: isEditing && loadingReport,
        form,
        errors,
        image,
        setImage,
        point,
        locating,
        locate: () => locate(),
        updateField,
        handleSave,
        saving: mutation.isPending,
    };
}
