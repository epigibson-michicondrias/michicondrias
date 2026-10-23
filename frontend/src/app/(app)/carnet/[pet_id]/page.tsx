"use client";

/**
 * Carnet de una mascota — redirect a la pestaña Salud de su ficha (como en la app).
 */
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

function CarnetRedirect() {
  const params = useParams<{ pet_id: string }>();
  const router = useRouter();
  const petId = params.pet_id;

  useEffect(() => {
    if (petId) router.replace(`/mascotas/${petId}?tab=salud`);
  }, [petId, router]);

  return null;
}

export default function CarnetPetPage() {
  return (
    <Suspense fallback={null}>
      <CarnetRedirect />
    </Suspense>
  );
}
