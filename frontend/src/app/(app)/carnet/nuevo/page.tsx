"use client";

/** Atajo legacy: `/carnet/nuevo` abre una consulta nueva. */
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NuevoRedirect() {
  const params = useSearchParams();
  const router = useRouter();
  const qs = params.toString();

  useEffect(() => {
    router.replace(qs ? `/carnet/nueva-consulta?${qs}` : "/carnet/nueva-consulta");
  }, [router, qs]);

  return null;
}

export default function CarnetNuevoPage() {
  return (
    <Suspense fallback={null}>
      <NuevoRedirect />
    </Suspense>
  );
}
