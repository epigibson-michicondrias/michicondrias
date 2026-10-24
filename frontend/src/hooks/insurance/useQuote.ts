/**
 * useQuote — cotización y contratación de un plan (`(app)/aseguradoras/cotizar`).
 * Espejo de `mobile/src/hooks/insurance/useQuote.ts`. Acepta `?plan_id=` y `?pet_id=`.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getActivePlans, calculateQuote, subscribeToPlan } from "@/services/insurance";
import type {
  InsurancePlan,
  InsuranceQuoteOut,
  InsuranceQuoteRequest,
  InsuranceSubscribeRequest,
} from "@/services/insurance";
import { getUserPets } from "@/services/mascotas";
import type { Pet } from "@/types/mascotas";
import { showAlert } from "@/components/AppAlert";

export function useQuote() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(() => searchParams.get("pet_id"));
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => searchParams.get("plan_id"));
  const [hasPreexisting, setHasPreexisting] = useState(false);
  const [quote, setQuote] = useState<InsuranceQuoteOut | null>(null);

  const {
    data: plans = [],
    isLoading: isLoadingPlans,
  } = useQuery<InsurancePlan[]>({
    queryKey: ["insurancePlans"],
    queryFn: getActivePlans,
  });

  const {
    data: pets = [],
    isLoading: isLoadingPets,
  } = useQuery<Pet[]>({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

  const quoteMutation = useMutation({
    mutationFn: (data: InsuranceQuoteRequest) => calculateQuote(data),
    onSuccess: (data) => setQuote(data),
    onError: (e: Error) => {
      showAlert({ type: "error", title: "No pudimos cotizar", message: e?.message || "Inténtalo de nuevo." });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: InsuranceSubscribeRequest) => subscribeToPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurancePolicies"] });
      queryClient.invalidateQueries({ queryKey: ["user-pets"] });
      showAlert({
        type: "success",
        title: "¡Suscripción exitosa!",
        message: "Tu mascota ahora está asegurada. La póliza ha sido creada.",
        onButtonPress: () => router.replace("/aseguradoras/mis-polizas"),
      });
    },
    onError: (e: Error) => {
      showAlert({
        type: "error",
        title: "No pudimos completar la contratación",
        message: e?.message || "Inténtalo de nuevo.",
      });
    },
  });

  const petAgeYears = selectedPet?.age_months ? Math.round(selectedPet.age_months / 12) : 1;

  const handleCalculateQuote = () => {
    if (!selectedPet || !selectedPlanId) {
      showAlert({ type: "error", title: "Error", message: "Selecciona una mascota y un plan." });
      return;
    }
    quoteMutation.mutate({
      plan_id: selectedPlanId,
      pet_age: petAgeYears,
      pet_species: selectedPet.species,
      has_preexisting_conditions: hasPreexisting,
    });
  };

  const handleSubscribe = () => {
    if (!selectedPet || !selectedPlanId) {
      showAlert({ type: "error", title: "Error", message: "Selecciona una mascota y un plan." });
      return;
    }
    subscribeMutation.mutate({
      pet_id: selectedPet.id,
      plan_id: selectedPlanId,
      pet_age: petAgeYears,
      pet_species: selectedPet.species,
      has_preexisting_conditions: hasPreexisting,
    });
  };

  return {
    plans,
    pets,
    quote,
    selectedPetId,
    selectedPlanId,
    selectedPet,
    selectedPlan,
    hasPreexisting,
    isLoading: isLoadingPlans || isLoadingPets,
    isCalculating: quoteMutation.isPending,
    isSubscribing: subscribeMutation.isPending,
    setSelectedPetId,
    setSelectedPlanId,
    setHasPreexisting,
    handleCalculateQuote,
    handleSubscribe,
  };
}
