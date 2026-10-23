/**
 * useMemorial — memorial de una mascota (`(app)/funeraria/memorial/[petId]` y `/memorial/nuevo`).
 * Espejo de `mobile/src/hooks/funerary/useMemorial.ts`.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getMemorialPosts,
  getMemorialFeed,
  createMemorialPost,
  type PetMemorialPost,
  type PetMemorialPostCreate,
} from "@/services/funerary";
import { showAlert } from "@/components/AppAlert";
import { getMascotasPresignedUrl } from "@/services/mascotas";
import { getFileExtension, getS3Url } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";

export function useMemorial(petId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useQuery<PetMemorialPost[]>({
    queryKey: ["memorial-posts", petId],
    queryFn: () => getMemorialPosts(petId!),
    enabled: !!petId,
  });

  const {
    data: feed = [],
    isLoading: isLoadingFeed,
    refetch: refetchFeed,
    isRefetching,
  } = useQuery<PetMemorialPost[]>({
    queryKey: ["memorial-feed", petId],
    queryFn: () => getMemorialFeed(petId!),
    enabled: !!petId,
  });

  const createPostMutation = useMutation({
    mutationFn: (data: PetMemorialPostCreate) => createMemorialPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memorial-posts"] });
      queryClient.invalidateQueries({ queryKey: ["memorial-feed"] });
      showAlert({
        type: "success",
        title: "Publicación creada",
        message: "Tu mensaje de memorial ha sido publicado.",
        onButtonPress: () => router.back(),
      });
      setMessage("");
      setPhotoFile(null);
    },
    onError: () => {
      showAlert({
        type: "error",
        title: "Error",
        message: "No se pudo publicar tu mensaje. Intenta de nuevo.",
      });
    },
  });

  const handleCreatePost = async () => {
    if (!petId || !message.trim()) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Selecciona una mascota y escribe un mensaje.",
      });
      return;
    }
    let photoUrl: string | undefined;
    if (photoFile) {
      setIsUploading(true);
      try {
        const ext = getFileExtension(photoFile.name) || "jpg";
        const { url, object_key } = await getMascotasPresignedUrl(ext);
        await uploadImageToPresignedUrl(URL.createObjectURL(photoFile), url, ext);
        photoUrl = getS3Url(object_key);
      } catch {
        showAlert({
          type: "error",
          title: "No se pudo subir la foto",
          message: "Intenta de nuevo.",
        });
        return;
      } finally {
        setIsUploading(false);
      }
    }
    createPostMutation.mutate({
      pet_id: petId,
      message: message.trim(),
      photo_url: photoUrl,
    });
  };

  return {
    message,
    setMessage,
    photoFile,
    setPhotoFile,
    posts,
    feed,
    isLoadingPosts,
    isLoadingFeed,
    isRefetching,
    refetchPosts,
    refetchFeed,
    handleCreatePost,
    isCreating: createPostMutation.isPending || isUploading,
  };
}
