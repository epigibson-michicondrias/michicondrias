"use client";

/**
 * Ruta heredada `/transportistas/nuevo` → `/transportistas/solicitar` (flujo guiado).
 * Espejo de `mobile/app/transportistas/nuevo.tsx`.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoTransportePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/transportistas/solicitar");
  }, [router]);
  return null;
}
