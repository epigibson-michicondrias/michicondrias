/**
 * useMyPolicies -- Hook for user's active insurance policies
 * Fetches user pets and their active policies
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getActivePolicyByPet } from '@/src/services/insurance';
import type { PetInsurancePolicy } from '@/src/services/insurance';
import { getUserPets } from '@/src/services/mascotas';
import type { Pet } from '@/src/types/mascotas';

export interface PetWithPolicy {
    pet: Pet;
    policy: PetInsurancePolicy | null;
    isLoadingPolicy: boolean;
}

export function useMyPolicies() {
    const { user } = useAuth();

    // Fetch user's pets
    const {
        data: pets = [],
        isLoading: isLoadingPets,
        refetch,
        isRefetching,
    } = useQuery<Pet[]>({
        queryKey: ['user-pets', user?.id],
        queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
        enabled: !!user?.id,
    });

    // Fetch policies for all pets
    const {
        data: policiesMap = {},
        isLoading: isLoadingPolicies,
    } = useQuery<Record<string, PetInsurancePolicy | null>>({
        queryKey: ['insurancePolicies', pets.map((p) => p.id)],
        queryFn: async () => {
            const results: Record<string, PetInsurancePolicy | null> = {};
            await Promise.all(
                pets.map(async (pet) => {
                    try {
                        const policy = await getActivePolicyByPet(pet.id);
                        results[pet.id] = policy;
                    } catch {
                        results[pet.id] = null;
                    }
                })
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
