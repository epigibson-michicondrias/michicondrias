import { useState } from 'react';
import { showAlert } from '@/src/components/AppAlert';

interface UseImageUploadOptions {
    presignedUrlFn: (ext: string) => Promise<{ url: string; object_key: string }>;
    bucketBase: string; // e.g., 'https://michicondrias-storage-1.s3.us-east-1.amazonaws.com'
}

export function useImageUpload({ presignedUrlFn, bucketBase }: UseImageUploadOptions) {
    const [uploading, setUploading] = useState(false);

    const upload = async (imageUri: string): Promise<string | null> => {
        setUploading(true);
        try {
            const ext = imageUri.split('.').pop() || 'jpg';
            const { url, object_key } = await presignedUrlFn(ext);
            const response = await fetch(imageUri);
            const blob = await response.blob();
            await fetch(url, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': `image/${ext}` },
            });
            return `${bucketBase}/${object_key}`;
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen' });
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { upload, uploading };
}
