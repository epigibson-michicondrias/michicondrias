/**
 * use2FA — Hook for two-factor authentication setup, enable, and disable.
 * Hydrates initial 2FA state from AuthContext user data.
 */
import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setup2FA, enable2FA, disable2FA } from '@/src/services/auth2fa';
import { showAlert } from '@/src/components/AppAlert';
import { useAuth } from '@/src/contexts/AuthContext';
import { copyText } from '@/src/utils/helpers';
import { shareContent } from '@/src/utils/share';

export function use2FA() {
    const { user, reloadUser } = useAuth();
    const queryClient = useQueryClient();
    
    const [qrUri, setQrUri] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [code, setCode] = useState('');
    
    // Hydrate 2FA state from user profile (server truth)
    const [is2FAEnabled, setIs2FAEnabled] = useState(
        user?.is_two_factor_enabled ?? false
    );

    // Sync when user data changes (e.g., after reloadUser)
    useEffect(() => {
        if (user?.is_two_factor_enabled !== undefined) {
            setIs2FAEnabled(user.is_two_factor_enabled);
        }
    }, [user?.is_two_factor_enabled]);

    const setupMutation = useMutation({
        mutationFn: setup2FA,
        onSuccess: (data) => {
            setQrUri(data.otpauth_url);
            setSecret(data.secret);
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo configurar 2FA' });
        },
    });

    const enableMutation = useMutation({
        mutationFn: ({ verifyCode, secretKey }: { verifyCode: string; secretKey: string }) => 
            enable2FA(verifyCode, secretKey),
        onSuccess: async () => {
            setIs2FAEnabled(true);
            setCode('');
            setQrUri(null);
            // Reload user to sync 2FA state from server
            await reloadUser();
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            showAlert({ type: 'success', title: 'Éxito', message: '2FA activado correctamente. A partir de ahora necesitarás tu código de autenticación para iniciar sesión.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'Código inválido. Inténtalo de nuevo.' });
        },
    });

    const disableMutation = useMutation({
        mutationFn: ({ verifyCode, secretKey }: { verifyCode: string; secretKey: string }) => 
            disable2FA(verifyCode, secretKey),
        onSuccess: async () => {
            setIs2FAEnabled(false);
            setQrUri(null);
            setSecret(null);
            setCode('');
            // Reload user to sync 2FA state from server
            await reloadUser();
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            showAlert({ type: 'success', title: 'Éxito', message: '2FA desactivado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'Código inválido. Inténtalo de nuevo.' });
        },
    });

    const handleSetup = () => {
        setupMutation.mutate();
    };

    /** Abre la app de autenticación con la cuenta precargada (enlace otpauth:// del setup). */
    const openAuthenticator = async () => {
        if (!qrUri) return;
        try {
            await Linking.openURL(qrUri);
        } catch {
            showAlert({
                type: 'info',
                title: 'No se pudo abrir la app',
                message: 'Copia la clave y agrégala manualmente en tu app de autenticación.',
            });
        }
    };

    /** Copia la clave secreta. En web va al portapapeles; en nativo el menú de compartir incluye "Copiar". */
    const copySecret = async () => {
        if (!secret) return;
        if (await copyText(secret)) {
            showAlert({ type: 'success', title: 'Clave copiada', message: 'Pégala en tu app de autenticación para terminar.' });
            return;
        }
        const shared = await shareContent('Clave de autenticación', secret);
        if (!shared) {
            showAlert({
                type: 'info',
                title: 'Copia la clave manualmente',
                message: 'Muestra la clave y mantenla presionada para copiarla desde el menú del sistema.',
            });
        }
    };

    const handleEnable = () => {
        if (code.length < 6) {
            showAlert({ type: 'warning', title: 'Código requerido', message: 'Ingresa el código de 6 dígitos' });
            return;
        }
        if (!secret) {
            showAlert({ type: 'error', title: 'Error', message: 'Primero configura 2FA para obtener la clave secreta' });
            return;
        }
        enableMutation.mutate({ verifyCode: code, secretKey: secret });
    };

    const handleDisable = () => {
        if (code.length < 6) {
            showAlert({ type: 'warning', title: 'Código requerido', message: 'Ingresa el código de 6 dígitos para desactivar' });
            return;
        }
        showAlert({
            type: 'warning',
            title: 'Desactivar 2FA',
            message: '¿Estás seguro? Tu cuenta será menos segura.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Desactivar',
            onButtonPress: () => {
                // For disable, we need to send the code with the stored secret
                // The backend uses the stored secret on the user record
                disableMutation.mutate({ verifyCode: code, secretKey: code });
            },
        });
    };

    return {
        // Data
        qrUri,
        secret,
        code,
        is2FAEnabled,

        // Loading states
        isSettingUp: setupMutation.isPending,
        isEnabling: enableMutation.isPending,
        isDisabling: disableMutation.isPending,

        // Actions
        setCode,
        handleSetup,
        handleEnable,
        handleDisable,
        openAuthenticator,
        copySecret,
    };
}
