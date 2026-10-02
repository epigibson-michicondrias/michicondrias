import { useState } from 'react';
import { showAlert } from '@/src/components/AppAlert';
import { getFileExtension } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

interface UseImageUploadOptions {
    presignedUrlFn: (ext: string) => Promise<{ url: string; object_key: string }>;
    bucketBase: string; // e.g., 'https://michicondrias-storage-1.s3.us-east-1.amazonaws.com'
}

export function useImageUpload({ presignedUrlFn, bucketBase }: UseImageUploadOptions) {
    const [uploading, setUploading] = useState(false);

    const upload = async (imageUri: string): Promise<string | null> => {
        setUploading(true);
        try {
            const ext = getFileExtension(imageUri);
            const { url, object_key } = await presignedUrlFn(ext);
            await uploadImageToPresignedUrl(imageUri, url, ext);
            return /^https?:\/\//i.test(object_key) ? object_key : `${bucketBase}/${object_key}`;
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo subir la imagen' });
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { upload, uploading };
}
