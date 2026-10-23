"use client";

/** Pago cancelado — deep link del backend. */
import { Suspense } from "react";
import PagoResultado from "@/features/tienda/PagoResultado";

export default function PagoCanceladoPage() {
  return (
    <Suspense fallback={null}>
      <PagoResultado variant="cancelled" />
    </Suspense>
  );
}
