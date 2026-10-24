"use client";

/**
 * Nuevo mensaje de memorial. Espejo de `mobile/app/funeraria/memorial/nuevo.tsx`.
 * Acepta `?pet_id=`.
 */
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, Info, Heart } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormImagePicker from "@/components/forms/FormImagePicker";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPets } from "@/services/mascotas";
import { useMemorial } from "@/hooks/funerary/useMemorial";
import local from "../../funeraria.module.css";

function NuevoMensajeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const petId = searchParams.get("pet_id") || "";

  const { message, setMessage, photoFile, setPhotoFile, handleCreatePost, isCreating } = useMemorial(petId);
  const [touched, setTouched] = useState(false);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const selectedPet = pets.find((p) => p.id === petId) ?? null;
  const messageError = touched && !message.trim() ? "Escribe un mensaje para el memorial." : null;

  return (
    <ScreenContainer>
      <ScreenHeader title="Nuevo Mensaje" subtitle="Comparte un recuerdo de tu mascota" />

      {isLoading ? (
        <SkeletonList count={2} />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="No tienes mascotas registradas"
          subtitle="Registra una mascota para compartir un recuerdo en su memorial."
          actionLabel="Registrar mascota"
          onAction={() => router.push("/mascotas")}
        />
      ) : (
        <>
          <FormSection title="Memorial">
            <FormSelect
              label="Mascota *"
              options={pets.map((p) => ({ label: p.name, value: p.id }))}
              value={petId}
              onChange={(id) => router.replace(`/funeraria/memorial/nuevo?pet_id=${id}`)}
            />
            <FormField
              label="Mensaje *"
              value={message}
              onChangeText={setMessage}
              placeholder="Comparte un recuerdo, un agradecimiento o unas palabras de despedida…"
              multiline
              numberOfLines={4}
              error={messageError}
              onBlur={() => setTouched(true)}
            />
            <FormImagePicker
              label="Foto (opcional)"
              preview={photoFile ? URL.createObjectURL(photoFile) : null}
              onChange={setPhotoFile}
            />
          </FormSection>

          <div className={local.noteBox}>
            <Info size={16} aria-hidden />
            <span>
              {selectedPet
                ? `Tu mensaje se publicará en el memorial de ${selectedPet.name}.`
                : "Tu mensaje se publicará en el memorial de tu mascota."}{" "}
              Trátalo con respeto y cariño.
            </span>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Button
              label={isCreating ? "Publicando..." : "Publicar Mensaje"}
              onPress={handleCreatePost}
              loading={isCreating}
              disabled={!petId || !message.trim()}
              icon={<Send size={18} />}
            />
          </div>
        </>
      )}
    </ScreenContainer>
  );
}

export default function NuevoMensajeMemorialPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Nuevo Mensaje" subtitle="Comparte un recuerdo de tu mascota" />
        </ScreenContainer>
      }
    >
      <NuevoMensajeContent />
    </Suspense>
  );
}
