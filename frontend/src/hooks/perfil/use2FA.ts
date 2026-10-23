/**
 * use2FA — configuración, activación y desactivación del segundo factor (espejo de
 * `mobile/src/hooks/perfil/use2FA.ts`).
 */
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setup2FA, enable2FA, disable2FA } from '@/services/auth2fa';
import { showAlert } from '@/components/AppAlert';
import { useAuth } from '@/contexts/AuthContext';
import { copyText } from '@/utils/helpers';

export function use2FA() {
    const { user, reloadUser } = useAuth();
    const queryClient = useQueryClient();

    const [qrUri, setQrUri] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [code, setCode] = useState('');

    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is_two_factor_enabled ?? false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await Promise.resolve();
            if (cancelled) return;
            if (user?.is_two_factor_enabled !== undefined) setIs2FAEnabled(user.is_two_factor_enabled);
        })();
        return () => { cancelled = true; };
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
            await reloadUser();
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            showAlert({
                type: 'success',
                title: 'Éxito',
                message: '2FA activado correctamente. A partir de ahora necesitarás tu código de autenticación para iniciar sesión.',
            });
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
            await reloadUser();
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            showAlert({ type: 'success', title: 'Éxito', message: '2FA desactivado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'Código inválido. Inténtalo de nuevo.' });
        },
    });

    const handleSetup = () => setupMutation.mutate();

    const handleEnable = () => {
        if (!secret) return;
        enableMutation.mutate({ verifyCode: code.trim(), secretKey: secret });
    };

    const handleDisable = () => {
        if (!secret) return;
        disableMutation.mutate({ verifyCode: code.trim(), secretKey: secret });
    };

    const copySecret = async () => {
        if (!secret) return;
        const ok = await copyText(secret);
        showAlert({
            type: ok ? 'success' : 'error',
            title: ok ? 'Clave copiada' : 'No se pudo copiar',
            message: ok ? 'Pégala en tu app de autenticación.' : 'Cópiala a mano.',
        });
    };

    return {
        is2FAEnabled,
        qrUri,
        secret,
        code,
        setCode,
        handleSetup,
        handleEnable,
        handleDisable,
        copySecret,
        isSettingUp: setupMutation.isPending,
        isEnabling: enableMutation.isPending,
        isDisabling: disableMutation.isPending,
    };
}
