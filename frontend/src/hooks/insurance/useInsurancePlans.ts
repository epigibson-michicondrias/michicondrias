/**
 * useInsurancePlans — listado de planes de seguro (`(app)/aseguradoras`).
 * Espejo de `mobile/src/hooks/insurance/useInsurancePlans.ts` con filtro de búsqueda.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivePlans } from "@/services/insurance";
import type { InsurancePlan } from "@/services/insurance";

export function useInsurancePlans() {
  const [search, setSearch] = useState("");

  const {
    data: plans = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<InsurancePlan[]>({
    queryKey: ["insurancePlans"],
    queryFn: getActivePlans,
  });

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(q) ||
        (plan.description || "").toLowerCase().includes(q),
    );
  }, [plans, search]);

  return {
    plans: filteredPlans,
    isLoading,
    isRefetching,
    refetch,
    search,
    setSearch,
    hasSearch: search.trim() !== "",
  };
}

export type { InsurancePlan };
