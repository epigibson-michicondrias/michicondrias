import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Trash2, AlertTriangle, Lock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyProfile, deleteMyAccount } from '@/src/services/profile';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import Button from '@/src/components/Button';
import AuthField from '@/src/components/AuthField';
import { validateRequired } from '@/src/utils/validators';
import { font, spacing, layout } from '@/constants/design';

/** Eliminación de cuenta (requisito de Apple/Google): confirma con la contraseña actual y, si aplica, el código 2FA. */
export default function EliminarCuentaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { signOut } = useAuth();
    const { data: profile } = useQuery({ queryKey: ['user-profile'], queryFn: getMyProfile });

    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const needsCode = !!profile?.is_two_factor_enabled;

    const performDelete = async () => {
        setBusy(true);
        try {
            await deleteMyAccount(password, needsCode ? code.trim() : undefined);
            // signOut limpia token, caché y carrito; la guarda de app/_layout.tsx lleva a /login
            await signOut();
            showAlert({ type: 'success', title: 'Cuenta eliminada', message: 'Tu cuenta y tus datos personales fueron eliminados. Gracias por haber sido parte de Michicondrias.' });
        } catch (error: any) {
            showAlert({ type: 'error', title: 'No se pudo eliminar la cuenta', message: error?.message || 'Inténtalo de nuevo en unos minutos.' });
        } finally {
            setBusy(false);
        }
    };

    const confirm = () => {
        const e1 = validateRequired(password, 'La contraseña', 'f');
        setPasswordError(e1.valid ? null : e1.message!);
        let codeOk = true;
        if (needsCode) {
            const trimmed = code.trim();
            codeOk = trimmed.length === 6;
            setCodeError(codeOk ? null : 'El código tiene 6 dígitos.');
        }
        if (!e1.valid || !codeOk) return;

        showAlert({
            type: 'warning',
            title: 'Eliminar cuenta definitivamente',
            message: 'Esta acción no se puede deshacer. Se borrarán tus datos personales y tus mascotas. ¿Continuar?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: performDelete,
        });
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Eliminar cuenta" onBack={() => router.back()} />
            <KeyboardScreen style={{ backgroundColor: theme.background }}>
                <View style={[styles.warnCard, { backgroundColor: theme.errorLight, borderColor: theme.borderLight }]}>
                    <AlertTriangle size={22} color={theme.error} />
                    <View style={{ flex: 1, gap: spacing.sm }}>
                        <Text style={[styles.warnTitle, { color: theme.text }]}>Qué pasará</Text>
                        <Text style={[styles.warnText, { color: theme.textMuted }]}>
                            {'•'} Se eliminarán tu nombre, correo, foto, teléfono y documentos de verificación.{'\n'}
                            {'•'} Tus mascotas dejarán de aparecer en la app.{'\n'}
                            {'•'} Tus compras y donaciones se conservan sin datos personales por motivos contables.{'\n'}
                            {'•'} No podrás eliminarla si tienes pedidos o viajes en curso, o una suscripción Michi-Tracker Pro activa.
                        </Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <AuthField
                        label="Contraseña actual"
                        icon={Lock}
                        value={password}
                        onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(null); }}
                        error={passwordError}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Tu contraseña"
                        textContentType="password"
                    />

                    {needsCode && (
                        <AuthField
                            label="Código de tu app de autenticación (2FA)"
                            icon={ShieldCheck}
                            value={code}
                            onChangeText={(t) => { setCode(t.replace(/[^0-9]/g, '').slice(0, 6)); if (codeError) setCodeError(null); }}
                            error={codeError}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="123456"
                            textContentType="oneTimeCode"
                        />
                    )}

                    <Button
                        label="Eliminar mi cuenta"
                        variant="danger"
                        icon={<Trash2 size={18} color={theme.onPrimary} />}
                        onPress={confirm}
                        loading={busy}
                        style={{ marginTop: spacing.md }}
                    />
                    <Button label="Cancelar" variant="ghost" onPress={() => router.back()} disabled={busy} />
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    warnCard: { flexDirection: 'row', gap: spacing.md, marginHorizontal: layout.screenPadding, marginBottom: spacing.xl, padding: spacing.lg, borderRadius: 16, borderWidth: 1 },
    warnTitle: { fontSize: font.lg, fontWeight: '800' },
    warnText: { fontSize: font.base, lineHeight: 20 },
    form: { paddingHorizontal: layout.screenPadding, gap: spacing.sm, paddingBottom: spacing.huge },
});
