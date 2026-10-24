/**
 * useAccount — pestaña Perfil: datos de la cuenta, verificación, tema, facturación, legal y cierre de sesión.
 * Espejo de `mobile/src/hooks/perfil/useAccount.ts`.
 */
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { showAlert } from '@/components/AppAlert';
import { createBillingPortalSession } from '@/services/ecommerce';
import { openStripeUrl } from '@/utils/payments';
import { getRoleLabelFor, isProRole, normalizeRole } from '@/constants/roles';
import { PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '@/constants/support';
import type { VerificationStatus } from '@/types/auth';

const VERIFICATION_COPY: Record<VerificationStatus, { badge?: string; desc: string }> = {
    UNVERIFIED: { desc: 'Sube tu identificación para ofrecer servicios' },
    PENDING: { badge: 'En revisión', desc: 'Un administrador revisa tus documentos' },
    VERIFIED: { badge: 'Verificada', desc: 'Tu identidad está confirmada' },
    REJECTED: { badge: 'Revisar', desc: 'Rechazada: vuelve a subir tus documentos' },
};

export function useAccount() {
    const { user, signOut } = useAuth();
    const { themeMode, setThemeMode } = useTheme();
    const router = useRouter();
    const role = normalizeRole(user?.role_name);
    const isAdmin = role === 'admin';
    const verification = (user?.verification_status || 'UNVERIFIED') as VerificationStatus;

    const pendingAction: { title: string; desc: string; route: string; tone: 'success' | 'error' } | null =
        role === 'consumidor' && verification === 'VERIFIED'
            ? { title: 'Identidad aprobada', desc: 'Activa tu cuenta profesional', route: '/perfil/partner', tone: 'success' }
            : verification === 'REJECTED'
                ? { title: 'Verificación rechazada', desc: 'Vuelve a subir tus documentos', route: '/perfil/verificacion', tone: 'error' }
                : null;

    const billingPortal = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                openStripeUrl(data.url).catch(() => {
                    showAlert({ type: 'info', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
                });
            }
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
        },
    });

    const confirmSignOut = () => {
        showAlert({
            type: 'warning',
            title: 'Cerrar sesión',
            message: '¿Seguro que quieres cerrar sesión?',
            showCancel: true,
            onButtonPress: async () => {
                await signOut();
                router.replace('/login');
            },
        });
    };

    const legalUrl = PRIVACY_URL || TERMS_URL;
    const openLegal = () => {
        if (!legalUrl) {
            showAlert({ type: 'info', title: 'Aviso legal', message: `Escríbenos a ${SUPPORT_EMAIL} y te lo enviamos.` });
            return;
        }
        window.open(legalUrl, '_blank', 'noopener,noreferrer');
    };

    return {
        user,
        roleLabel: getRoleLabelFor(role),
        canBecomePro: !isProRole(role) && !isAdmin,
        verification,
        verificationCopy: VERIFICATION_COPY[verification] ?? VERIFICATION_COPY.UNVERIFIED,
        pendingAction,
        themeMode,
        setThemeMode,
        openBillingPortal: () => billingPortal.mutate(),
        isOpeningBilling: billingPortal.isPending,
        hasLegal: !!legalUrl,
        openLegal,
        confirmSignOut,
    };
}
