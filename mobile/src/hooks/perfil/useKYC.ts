/**
 * useKYC — Hook for KYC document upload and verification
 * Manages document state, presigned URLs, upload, and finalization
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    getKYCPresignedUrls,
    finalizeKYC,
    KYCPresignedUrlsResponse,
} from '@/src/services/kyc';
import { showAlert } from '@/src/components/AppAlert';

export interface KYCDocument {
    key: 'id_front' | 'id_back' | 'proof_of_address';
    label: string;
    uri: string | null;
    uploaded: boolean;
    uploading: boolean;
}

export function useKYC() {
    const router = useRouter();

    const [documents, setDocuments] = useState<KYCDocument[]>([
        { key: 'id_front', label: 'INE / ID - Frente', uri: null, uploaded: false, uploading: false },
        { key: 'id_back', label: 'INE / ID - Reverso', uri: null, uploaded: false, uploading: false },
        { key: 'proof_of_address', label: 'Comprobante de domicilio', uri: null, uploaded: false, uploading: false },
    ]);

    const setDocumentUri = (key: string, uri: string) => {
        setDocuments(prev =>
            prev.map(doc => (doc.key === key ? { ...doc, uri } : doc))
        );
    };

    const setDocumentUploading = (key: string, uploading: boolean) => {
        setDocuments(prev =>
            prev.map(doc => (doc.key === key ? { ...doc, uploading } : doc))
        );
    };

    const setDocumentUploaded = (key: string, uploaded: boolean) => {
        setDocuments(prev =>
            prev.map(doc => (doc.key === key ? { ...doc, uploaded } : doc))
        );
    };

    const getExtension = (uri: string): string => {
        const parts = uri.split('.');
        return parts[parts.length - 1] || 'jpg';
    };

    const allDocumentsSelected = documents.every(doc => doc.uri !== null);
    const allDocumentsUploaded = documents.every(doc => doc.uploaded);
    const isAnyUploading = documents.some(doc => doc.uploading);

    const uploadProgress = documents.filter(doc => doc.uploaded).length / documents.length;

    // Upload documents mutation
    const uploadMutation = useMutation<void, Error>({
        mutationFn: async () => {
            const selectedDocs = documents.filter(doc => doc.uri);
            if (selectedDocs.length !== 3) {
                throw new Error('Todos los documentos son requeridos');
            }

            // Get presigned URLs
            const extensions = {
                id_front: getExtension(documents[0].uri!),
                id_back: getExtension(documents[1].uri!),
                proof_of_address: getExtension(documents[2].uri!),
            };

            const presignedResponse: KYCPresignedUrlsResponse = await getKYCPresignedUrls(extensions);

            // Upload each document
            const uploadedUrls: Record<string, string> = {};

            for (const presigned of presignedResponse.urls) {
                const doc = documents.find(d => d.key === presigned.key);
                if (!doc || !doc.uri) continue;

                setDocumentUploading(presigned.key, true);

                try {
                    const response = await fetch(doc.uri);
                    const blob = await response.blob();

                    await fetch(presigned.url, {
                        method: 'PUT',
                        body: blob,
                        headers: { 'Content-Type': blob.type || 'image/jpeg' },
                    });

                    uploadedUrls[`${presigned.key}_url`] = presigned.object_key;
                    setDocumentUploaded(presigned.key, true);
                } finally {
                    setDocumentUploading(presigned.key, false);
                }
            }

            // Finalize KYC
            await finalizeKYC({
                id_front_url: uploadedUrls['id_front_url'],
                id_back_url: uploadedUrls['id_back_url'],
                proof_of_address_url: uploadedUrls['proof_of_address_url'],
            });
        },
        onSuccess: () => {
            showAlert({
                type: 'success',
                title: '¡Documentos enviados!',
                message: 'Tus documentos han sido enviados para verificación. Te notificaremos cuando sean aprobados.',
            });
            router.back();
        },
        onError: (error) => {
            showAlert({
                type: 'error',
                title: 'Error al subir documentos',
                message: error.message || 'No se pudieron subir los documentos. Intenta de nuevo.',
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
        setDocumentUri,
        allDocumentsSelected,
        allDocumentsUploaded,
        isAnyUploading,
        uploadProgress,
        handleSubmit,
        isSubmitting: uploadMutation.isPending,
        router,
    };
}
