/**
 * useClinicsAndVets — listado del directorio con búsqueda y filtros.
 * Espejo de `mobile/src/hooks/directorio/useClinicsAndVets.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClinics, getVets } from "@/services/directorio";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/constants/roles";
import type { Clinic, Vet } from "@/types/directorio";

export type DirectorioTab = "clinics" | "vets";

const REGISTER_ROLES = ["veterinario", "hospital", "admin"];

export function useClinicsAndVets() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<DirectorioTab>("clinics");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  const { data: clinics = [], isLoading: loadingClinics } = useQuery({
    queryKey: ["directorio-clinics"],
    queryFn: getClinics,
  });

  const { data: vets = [], isLoading: loadingVets } = useQuery({
    queryKey: ["directorio-vets"],
    queryFn: () => getVets(),
  });

  const canRegister = REGISTER_ROLES.includes(normalizeRole(user?.role_name));

  const specialties = useMemo(() => {
    const set = new Set<string>();
    vets.forEach((v) => {
      if (v.specialty) set.add(v.specialty);
    });
    return ["all", ...Array.from(set).sort()];
  }, [vets]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return ["all", ...Array.from(set).sort()];
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return clinics.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.city?.toLowerCase().includes(q) ?? false) ||
        (c.address?.toLowerCase().includes(q) ?? false);
      const matchesService =
        filterService === "all" ||
        (filterService === "24h" && c.is_24_hours) ||
        (filterService === "emergencia" && c.has_emergency);
      const matchesCity = filterCity === "all" || c.city === filterCity;
      return matchesQuery && matchesService && matchesCity;
    });
  }, [clinics, searchQuery, filterService, filterCity]);

  const filteredVets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vets.filter((v) => {
      const fullName = `${v.first_name} ${v.last_name}`.toLowerCase();
      const matchesQuery = !q || fullName.includes(q) || (v.specialty?.toLowerCase().includes(q) ?? false);
      const matchesSpecialty = filterSpecialty === "all" || v.specialty === filterSpecialty;
      return matchesQuery && matchesSpecialty;
    });
  }, [vets, searchQuery, filterSpecialty]);

  const isLoading = activeTab === "clinics" ? loadingClinics : loadingVets;
  const resultsCount = activeTab === "clinics" ? filteredClinics.length : filteredVets.length;
  const hasActiveFilters =
    filterService !== "all" || filterSpecialty !== "all" || filterCity !== "all" || searchQuery.trim().length > 0;

  return {
    clinics,
    vets,
    filteredClinics,
    filteredVets,
    resultsCount,
    loadingClinics,
    loadingVets,
    isLoading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterService,
    setFilterService,
    filterSpecialty,
    setFilterSpecialty,
    filterCity,
    setFilterCity,
    specialties,
    cities,
    hasActiveFilters,
    canRegister,
  };
}

export type { Clinic, Vet };
