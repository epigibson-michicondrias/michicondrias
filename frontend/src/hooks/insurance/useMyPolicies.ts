/**
 * useMyPolicies — pólizas activas de las mascotas del usuario (`(app)/aseguradoras/mis-polizas`).
 * Espejo de `mobile/src/hooks/insurance/useMyPolicies.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getActivePolicyByPet } from "@/services/insurance";
import type { PetInsurancePolicy } from "@/services/insurance";
import { getUserPets } from "@/services/mascotas";
import type { Pet } from "@/types/mascotas";

export interface PetWithPolicy {
  pet: Pet;
  policy: PetInsurancePolicy | null;
  isLoadingPolicy: boolean;
}

export function useMyPolicies() {
  const { user } = useAuth();

  const {
    data: pets = [],
    isLoading: isLoadingPets,
    isRefetching,
    refetch,
  } = useQuery<Pet[]>({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const {
    data: policiesMap = {},
    isLoading: isLoadingPolicies,
  } = useQuery<Record<string, PetInsurancePolicy | null>>({
    queryKey: ["insurancePolicies", pets.map((p) => p.id)],
    queryFn: async () => {
      const results: Record<string, PetInsurancePolicy | null> = {};
      await Promise.all(
        pets.map(async (pet) => {
          try {
            results[pet.id] = await getActivePolicyByPet(pet.id);
          } catch {
            results[pet.id] = null;
          }
        }),
      );
      return results;
    },
    enabled: pets.length > 0,
  });

  const petsWithPolicies: PetWithPolicy[] = pets.map((pet) => ({
    pet,
    policy: policiesMap[pet.id] ?? null,
    isLoadingPolicy: isLoadingPolicies,
  }));

  const insuredCount = petsWithPolicies.filter((p) => p.policy !== null).length;
  const uninsuredCount = petsWithPolicies.filter((p) => p.policy === null).length;

  return {
    petsWithPolicies,
    insuredCount,
    uninsuredCount,
    isLoading: isLoadingPets || isLoadingPolicies,
    refetch,
    isRefetching,
  };
}
