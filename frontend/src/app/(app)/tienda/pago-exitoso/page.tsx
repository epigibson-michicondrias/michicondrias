"use client";

/** Pago exitoso — deep link del backend. */
import { Suspense } from "react";
import PagoResultado from "@/features/tienda/PagoResultado";

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={null}>
      <PagoResultado variant="success" />
    </Suspense>
  );
}
