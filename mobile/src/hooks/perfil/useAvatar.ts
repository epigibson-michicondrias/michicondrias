/**
 * useAvatar — foto de perfil: lectura, elegir de la galería, subir y guardar.
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { getMyAvatar, getAvatarPresignedUrl, setMyAvatar } from '@/src/services/avatar';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';
import { getFileExtension } from '@/src/utils/helpers';
import { showAlert } from '@/src/components/AppAlert';

export function useAvatar() {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const { data } = useQuery({ queryKey: ['my-avatar'], queryFn: getMyAvatar });

    const pickAndUpload = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            showAlert({ type: 'warning', title: 'Permiso necesario', message: 'Permite el acceso a tus fotos para elegir una imagen de perfil.' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.[0]?.uri) return;

        const uri = result.assets[0].uri;
        setUploading(true);
        try {
            const ext = getFileExtension(uri);
            const { url, object_key } = await getAvatarPresignedUrl(ext);
            await uploadImageToPresignedUrl(uri, url, ext);
            await setMyAvatar(object_key);
            await queryClient.invalidateQueries({ queryKey: ['my-avatar'] });
        } catch (error: any) {
            showAlert({ type: 'error', title: 'No se pudo cambiar la foto', message: error?.message || 'Inténtalo de nuevo en unos minutos.' });
        } finally {
            setUploading(false);
        }
    };

    return { avatarUrl: data?.avatar_url ?? null, uploading, pickAndUpload };
}
