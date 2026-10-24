/**
 * usePartnerUpgrade — convierte la cuenta en profesional desde `perfil/partner`.
 * Espejo de `mobile/src/hooks/perfil/usePartnerUpgrade.ts`.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, upgradeRole } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import type { VerificationStatus } from '@/types/auth';

export type UpgradeResult =
    | { ok: true }
    | { ok: false; verification: VerificationStatus };

export function usePartnerUpgrade() {
    const { refreshSession } = useAuth();
    const queryClient = useQueryClient();

    const upgradeMutation = useMutation<UpgradeResult, Error, string>({
        mutationFn: async (roleName: string): Promise<UpgradeResult> => {
            const me = await getCurrentUser();
            const verification = (me.verification_status || 'UNVERIFIED') as VerificationStatus;
            if (verification !== 'VERIFIED') return { ok: false, verification };

            const res = await upgradeRole(roleName);
            if (res.access_token) await refreshSession(res.access_token);
            return { ok: true };
        },
        onSuccess: (result) => {
            if (result.ok) queryClient.invalidateQueries();
        },
    });

    return {
        upgrade: upgradeMutation.mutate,
        isUpgrading: upgradeMutation.isPending,
    };
}
