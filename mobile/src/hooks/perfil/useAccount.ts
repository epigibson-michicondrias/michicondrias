/**
 * useAccount — pestaña Perfil: datos de la cuenta, estado de verificación, tema, facturación, legal y cierre de sesión.
 * Es el único lugar de la app con estas acciones (ver "Propuesta de navegación" en PROGRESO_MOBILE.md).
 */
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import { createBillingPortalSession } from '@/src/services/ecommerce';
import { getRoleLabelFor, isProRole, normalizeRole } from '@/src/constants/roles';
import { PRIVACY_URL, TERMS_URL, SUPPORT_EMAIL } from '@/src/constants/support';
import type { VerificationStatus } from '@/src/types/auth';

const VERIFICATION_COPY: Record<VerificationStatus, { badge?: string; desc: string }> = {
    UNVERIFIED: { desc: 'Sube tu identificación para ofrecer servicios' },
    PENDING: { badge: 'En revisión', desc: 'Un administrador revisa tus documentos' },
    VERIFIED: { badge: 'Verificada', desc: 'Tu identidad está confirmada' },
    REJECTED: { badge: 'Revisar', desc: 'Rechazada: vuelve a subir tus documentos' },
};

export function useAccount() {
    const { user, signOut } = useAuth();
    const { themeMode, setThemeMode } = useTheme();
    const role = normalizeRole(user?.role_name);
    const isAdmin = role === 'admin';
    const verification = (user?.verification_status || 'UNVERIFIED') as VerificationStatus;

    /**
     * Aviso destacado arriba de la pantalla solo cuando hay algo que hacer: activar la cuenta pro tras aprobar la
     * identidad, o volver a subir documentos rechazados. "En revisión" se ve en la fila de Verificación.
     */
    const pendingAction: { title: string; desc: string; route: string; tone: 'success' | 'error' } | null =
        role === 'consumidor' && verification === 'VERIFIED'
            ? { title: 'Identidad aprobada', desc: 'Activa tu cuenta profesional', route: '/perfil/partner', tone: 'success' }
            : verification === 'REJECTED'
                ? { title: 'Verificación rechazada', desc: 'Vuelve a subir tus documentos', route: '/perfil/verificacion', tone: 'error' }
                : null;

    const billingPortal = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) Linking.openURL(data.url).catch(() => {});
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
        },
    });

    const confirmSignOut = () => {
        showAlert({
            type: 'warning',
            title: 'Cerrar sesión',
            message: '¿Seguro que quieres cerrar sesión en este teléfono?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Cerrar sesión',
            onButtonPress: () => signOut(),
        });
    };

    const legalUrl = PRIVACY_URL || TERMS_URL;
    const openLegal = () => {
        if (!legalUrl) return;
        Linking.openURL(legalUrl).catch(() => {
            showAlert({ type: 'info', title: 'No se pudo abrir el enlace', message: `Escríbenos a ${SUPPORT_EMAIL} y te lo enviamos.` });
        });
    };

    return {
        user,
        roleLabel: getRoleLabelFor(role),
        canBecomePro: !isProRole(role) && !isAdmin,
        verification,
        verificationCopy: VERIFICATION_COPY[verification],
        pendingAction,
        themeMode,
        setThemeMode,
        openBillingPortal: () => billingPortal.mutate(),
        isOpeningBilling: billingPortal.isPending,
        hasLegal: !!legalUrl,
        openLegal,
        confirmSignOut,
        appVersion: Constants.expoConfig?.version ?? '',
    };
}
