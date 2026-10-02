/**
 * useMemorial — Hook for pet memorial screens
 * Handles fetching memorial posts/feed and creating new memorial posts
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  getMemorialPosts,
  getMemorialFeed,
  createMemorialPost,
  PetMemorialPost,
  PetMemorialPostCreate,
} from '@/src/services/funerary';
import { showAlert } from '@/src/components/AppAlert';
import { getMascotasPresignedUrl } from '@/src/services/mascotas';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

export function useMemorial(petId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Form state for creating posts ---
  const [form, setForm] = useState<PetMemorialPostCreate>({
    pet_id: petId || '',
    message: '',
    photo_url: '',
  });

  // Foto local elegida (se sube a almacenamiento al publicar)
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateForm = (field: keyof PetMemorialPostCreate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ pet_id: petId || '', message: '', photo_url: '' });
    setPhotoUri(null);
  };

  // --- Queries ---
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useQuery<PetMemorialPost[]>({
    queryKey: ['memorial-posts', petId],
    queryFn: () => getMemorialPosts(petId!),
    enabled: !!petId,
  });

  const {
    data: feed = [],
    isLoading: isLoadingFeed,
    refetch: refetchFeed,
  } = useQuery<PetMemorialPost[]>({
    queryKey: ['memorial-feed', petId],
    queryFn: () => getMemorialFeed(petId!),
    enabled: !!petId,
  });

  // --- Mutations ---
  const createPostMutation = useMutation({
    mutationFn: (data: PetMemorialPostCreate) => createMemorialPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memorial-posts'] });
      queryClient.invalidateQueries({ queryKey: ['memorial-feed'] });
      showAlert({
        type: 'success',
        title: 'Publicación creada',
        message: 'Tu mensaje de memorial ha sido publicado.',
        onButtonPress: () => router.back(),
      });
      resetForm();
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo publicar tu mensaje. Intenta de nuevo.',
      });
    },
  });

  const handleCreatePost = async () => {
    if (!form.pet_id || !form.message.trim()) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Selecciona una mascota y escribe un mensaje.',
      });
      return;
    }
    let photoUrl: string | undefined;
    if (photoUri) {
      setIsUploading(true);
      try {
        const ext = getFileExtension(photoUri);
        const { url, object_key } = await getMascotasPresignedUrl(ext);
        await uploadImageToPresignedUrl(photoUri, url, ext);
        photoUrl = getS3Url(object_key);
      } catch (e: any) {
        showAlert({ type: 'error', title: 'No se pudo subir la foto', message: e?.message || 'Intenta de nuevo.' });
        return;
      } finally {
        setIsUploading(false);
      }
    }
    createPostMutation.mutate({
      pet_id: form.pet_id,
      message: form.message.trim(),
      photo_url: photoUrl,
    });
  };

  return {
    // Form
    form,
    updateForm,
    resetForm,

    // Data
    posts,
    feed,
    isLoadingPosts,
    isLoadingFeed,
    refetchPosts,
    refetchFeed,

    // Mutations
    handleCreatePost,
    isCreating: createPostMutation.isPending || isUploading,
    photoUri,
    setPhotoUri,

    // Navigation
    router,
  };
}
