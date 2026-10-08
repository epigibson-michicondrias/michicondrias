/**
 * usePartnerUpgrade — convierte la cuenta en profesional desde `perfil/partner`.
 * Regla de negocio: la identidad tiene que estar aprobada (KYC) antes de elegir el rol; si no,
 * se devuelve el estado de verificación para que la pantalla ofrezca ir a `/perfil/verificacion`.
 * El backend devuelve un token con el rol nuevo y aquí se guarda con `refreshSession`.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, upgradeRole } from '@/src/services/auth';
import { useAuth } from '@/src/contexts/AuthContext';
import type { VerificationStatus } from '@/src/types/auth';

export type UpgradeResult =
    | { ok: true }
    | { ok: false; verification: VerificationStatus };

export function usePartnerUpgrade() {
    const { refreshSession } = useAuth();
    const queryClient = useQueryClient();

    const upgradeMutation = useMutation<UpgradeResult, Error, string>({
        mutationFn: async (roleName: string): Promise<UpgradeResult> => {
            // Estado fresco: la aprobación del KYC puede haber llegado hace un momento
            const me = await getCurrentUser();
            const verification = (me.verification_status || 'UNVERIFIED') as VerificationStatus;
            if (verification !== 'VERIFIED') return { ok: false, verification };

            const res = await upgradeRole(roleName);
            if (res.access_token) await refreshSession(res.access_token);
            return { ok: true };
        },
        onSuccess: (result) => {
            // Con el rol nuevo cambian las herramientas: hay que refrescar las pantallas ya cargadas
            if (result.ok) queryClient.invalidateQueries();
        },
    });

    return {
        upgrade: upgradeMutation.mutate,
        isUpgrading: upgradeMutation.isPending,
    };
}
