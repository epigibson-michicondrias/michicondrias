/**
 * useKYC — subida de documentos de identidad (`perfil/verificacion`). Espejo de
 * `mobile/src/hooks/perfil/useKYC.ts` con `<input type="file">` en vez de expo-image-picker.
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getKYCPresignedUrls, finalizeKYC } from '@/services/kyc';
import type { KYCPresignedUrlsResponse } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/AppAlert';
import { getFileExtension, getImageMimeType } from '@/utils/helpers';

export interface KYCDocument {
    key: 'id_front' | 'id_back' | 'proof_of_address';
    label: string;
    hint: string;
    /** URL local de previsualización (blob:). */
    preview: string | null;
    file: File | null;
    uploaded: boolean;
    uploading: boolean;
}

const DOCS: Pick<KYCDocument, 'key' | 'label' | 'hint'>[] = [
    { key: 'id_front', label: 'INE / ID - Frente', hint: 'INE, Pasaporte o Cédula' },
    { key: 'id_back', label: 'INE / ID - Reverso', hint: 'El reverso del mismo documento' },
    { key: 'proof_of_address', label: 'Comprobante de domicilio', hint: 'Luz, Agua o Teléfono (< 3 meses)' },
];

const emptyDocs = (): KYCDocument[] =>
    DOCS.map((d) => ({ ...d, preview: null, file: null, uploaded: false, uploading: false }));

export function useKYC() {
    const router = useRouter();
    const { reloadUser } = useAuth();
    const [documents, setDocuments] = useState<KYCDocument[]>(emptyDocs);

    const setDocumentFile = (key: string, file: File | null) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.key === key
                    ? {
                        ...doc,
                        file,
                        preview: file ? URL.createObjectURL(file) : null,
                        uploaded: false,
                    }
                    : doc,
            ),
        );
    };

    const allDocumentsSelected = documents.every((doc) => doc.file !== null);
    const isAnyUploading = documents.some((doc) => doc.uploading);
    const uploadProgress = documents.filter((doc) => doc.uploaded).length / documents.length;

    const uploadMutation = useMutation<void, Error>({
        mutationFn: async () => {
            const selected = documents.filter((doc) => doc.file);
            if (selected.length !== 3) throw new Error('Todos los documentos son requeridos');

            const extensions = {
                id_front: getFileExtension(documents[0].file!.name) || 'jpg',
                id_back: getFileExtension(documents[1].file!.name) || 'jpg',
                proof_of_address: getFileExtension(documents[2].file!.name) || 'jpg',
            };

            const presignedResponse: KYCPresignedUrlsResponse = await getKYCPresignedUrls(extensions);
            const uploadedUrls: Record<string, string> = {};

            for (const presigned of presignedResponse.urls) {
                const doc = documents.find((d) => d.key === presigned.key);
                if (!doc?.file) continue;

                setDocuments((prev) => prev.map((d) => (d.key === presigned.key ? { ...d, uploading: true } : d)));
                try {
                    const ext = getFileExtension(doc.file.name) || 'jpg';
                    const putRes = await fetch(presigned.url, {
                        method: 'PUT',
                        body: doc.file,
                        headers: { 'Content-Type': getImageMimeType(ext) },
                    });
                    if (!putRes.ok) throw new Error('No se pudo subir el documento. Inténtalo de nuevo.');
                    uploadedUrls[`${presigned.key}_url`] = presigned.object_key;
                    setDocuments((prev) => prev.map((d) => (d.key === presigned.key ? { ...d, uploaded: true } : d)));
                } finally {
                    setDocuments((prev) => prev.map((d) => (d.key === presigned.key ? { ...d, uploading: false } : d)));
                }
            }

            await finalizeKYC({
                id_front_url: uploadedUrls['id_front_url'],
                id_back_url: uploadedUrls['id_back_url'],
                proof_of_address_url: uploadedUrls['proof_of_address_url'],
            });
        },
        onSuccess: async () => {
            await reloadUser();
            showAlert({
                type: 'success',
                title: '¡Documentos enviados!',
                message: 'Tus documentos han sido enviados para verificación. Te notificaremos cuando sean aprobados.',
            });
            router.back();
        },
        onError: (error: Error) => {
            showAlert({
                type: 'error',
                title: 'Error al subir documentos',
                message: error.message || 'No se pudieron subir los documentos. Inténtalo de nuevo.',
            });
        },
    });

    const handleSubmit = () => {
        if (!allDocumentsSelected) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona todos los documentos antes de enviar.' });
            return;
        }
        uploadMutation.mutate();
    };

    return {
        documents,
        setDocumentFile,
        allDocumentsSelected,
        isAnyUploading,
        uploadProgress,
        handleSubmit,
        isSubmitting: uploadMutation.isPending,
    };
}
