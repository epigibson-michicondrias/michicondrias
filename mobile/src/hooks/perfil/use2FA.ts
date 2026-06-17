/**
 * use2FA — Hook for two-factor authentication setup, enable, and disable
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { setup2FA, enable2FA, disable2FA, upgradeToPartner } from '@/src/services/auth2fa';
import { showAlert } from '@/src/components/AppAlert';

export function use2FA() {
    const [qrUri, setQrUri] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);

    const setupMutation = useMutation({
        mutationFn: setup2FA,
        onSuccess: (data) => {
            setQrUri(data.qr_uri);
            setSecret(data.secret);
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo configurar 2FA' });
        },
    });

    const enableMutation = useMutation({
        mutationFn: (verifyCode: string) => enable2FA(verifyCode),
        onSuccess: () => {
            setIs2FAEnabled(true);
            setCode('');
            showAlert({ type: 'success', title: 'Éxito', message: '2FA activado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'Código inválido. Inténtalo de nuevo.' });
        },
    });

    const disableMutation = useMutation({
        mutationFn: (verifyCode: string) => disable2FA(verifyCode),
        onSuccess: () => {
            setIs2FAEnabled(false);
            setQrUri(null);
            setSecret(null);
            setCode('');
            showAlert({ type: 'success', title: 'Éxito', message: '2FA desactivado correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'Código inválido. Inténtalo de nuevo.' });
        },
    });

    const handleSetup = () => {
        setupMutation.mutate();
    };

    const handleEnable = () => {
        if (code.length < 6) {
            showAlert({ type: 'warning', title: 'Código requerido', message: 'Ingresa el código de 6 dígitos' });
            return;
        }
        enableMutation.mutate(code);
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
            onButtonPress: () => disableMutation.mutate(code),
        });
    };

    // --- Role Upgrade ---
    const upgradeMutation = useMutation({
        mutationFn: upgradeToPartner,
        onSuccess: () => {
            showAlert({ type: 'success', title: '¡Felicidades!', message: 'Tu cuenta ha sido actualizada a Partner. Cierra sesión y vuelve a entrar para ver los cambios.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar tu rol. Inténtalo de nuevo.' });
        },
    });

    const handleUpgradeToPartner = () => {
        showAlert({
            type: 'info',
            title: 'Upgrade a Partner',
            message: '¿Deseas actualizar tu cuenta a Partner? Esto te dará acceso a funciones avanzadas.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Actualizar',
            onButtonPress: () => upgradeMutation.mutate(),
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
        // Upgrade
        handleUpgradeToPartner,
        isUpgrading: upgradeMutation.isPending,
    };
}
