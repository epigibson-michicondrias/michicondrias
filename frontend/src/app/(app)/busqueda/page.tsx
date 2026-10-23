"use client";

/**
 * Búsqueda — espejo de `mobile/app/busqueda/`. W4 porta el buscador global con dominios.
 */
import { Search } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";

export default function BusquedaPage() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Búsqueda" />
      <EmptyState
        icon={<Search size={28} />}
        title="Buscador en camino"
        subtitle="La búsqueda global de mascotas, servicios y productos llega en la siguiente portada."
      />
    </ScreenContainer>
  );
}
