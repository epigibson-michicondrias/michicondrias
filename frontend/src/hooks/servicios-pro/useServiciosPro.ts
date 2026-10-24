/**
 * useServiciosPro — listado de paseadores o cuidadores con búsqueda (`(app)/servicios-pro`).
 * Espejo de `mobile/src/hooks/servicios-pro/useServiciosPro.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listWalkers, type Walker } from "@/services/paseadores";
import { listSitters, type Sitter } from "@/services/cuidadores";

export type ProTab = "walkers" | "sitters";

export function useServiciosPro() {
  const [activeTab, setActiveTab] = useState<ProTab>("walkers");
  const [searchQuery, setSearchQuery] = useState("");

  const walkersQuery = useQuery<Walker[]>({
    queryKey: ["walkers"],
    queryFn: () => listWalkers(),
    enabled: activeTab === "walkers",
  });

  const sittersQuery = useQuery<Sitter[]>({
    queryKey: ["sitters"],
    queryFn: () => listSitters(),
    enabled: activeTab === "sitters",
  });

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: (Walker | Sitter)[] = (activeTab === "walkers" ? walkersQuery.data : sittersQuery.data) ?? [];
    if (!q) return list;
    return list.filter(
      (item) =>
        item.display_name.toLowerCase().includes(q) || (item.location || "").toLowerCase().includes(q),
    );
  }, [activeTab, walkersQuery.data, sittersQuery.data, searchQuery]);

  const isLoading = activeTab === "walkers" ? walkersQuery.isLoading : sittersQuery.isLoading;

  return { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredData, isLoading };
}
