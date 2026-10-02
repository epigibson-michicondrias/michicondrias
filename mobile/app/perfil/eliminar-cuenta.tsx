import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyProfile, deleteMyAccount } from '@/src/services/profile';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import Button from '@/src/components/Button';

/** Eliminación de cuenta (requisito de Apple/Google): confirma con la contraseña actual y, si aplica, el código 2FA. */
export default function EliminarCuentaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { signOut } = useAuth();
    const queryClient = useQueryClient();
    const { data: profile } = useQuery({ queryKey: ['user-profile'], queryFn: getMyProfile });

    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const needsCode = !!profile?.is_two_factor_enabled;
    const canSubmit = password.length > 0 && (!needsCode || code.trim().length >= 6);

    const performDelete = async () => {
        setBusy(true);
        try {
            await deleteMyAccount(password, needsCode ? code.trim() : undefined);
            queryClient.clear();
            await signOut();
            showAlert({ type: 'success', title: 'Cuenta eliminada', message: 'Tu cuenta y tus datos personales fueron eliminados. Gracias por haber sido parte de Michicondrias.' });
            router.replace('/login' as any);
        } catch (error: any) {
            showAlert({ type: 'error', title: 'No se pudo eliminar la cuenta', message: error?.message || 'Inténtalo de nuevo en unos minutos.' });
        } finally {
            setBusy(false);
        }
    };

    const confirm = () => {
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

    const inputStyle = [styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }];

    return (
        <ScreenContainer>
            <ScreenHeader title="Eliminar cuenta" onBack={() => router.back()} />
            <KeyboardScreen style={{ backgroundColor: theme.background }}>
                <View style={[styles.warnCard, { backgroundColor: theme.errorLight, borderColor: theme.borderLight }]}>
                    <AlertTriangle size={22} color={theme.error} />
                    <View style={{ flex: 1, gap: 6 }}>
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
                    <Text style={[styles.label, { color: theme.textMuted }]}>Contraseña actual</Text>
                    <TextInput
                        style={inputStyle}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Tu contraseña"
                        placeholderTextColor={theme.textMuted}
                        textContentType="password"
                    />

                    {needsCode && (
                        <>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Código de tu app de autenticación (2FA)</Text>
                            <TextInput
                                style={inputStyle}
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                placeholder="123456"
                                placeholderTextColor={theme.textMuted}
                            />
                        </>
                    )}

                    <Button
                        label="Eliminar mi cuenta"
                        variant="danger"
                        icon={<Trash2 size={18} color="#fff" />}
                        onPress={confirm}
                        loading={busy}
                        disabled={!canSubmit}
                        style={{ marginTop: 12 }}
                    />
                    <Button label="Cancelar" variant="ghost" onPress={() => router.back()} disabled={busy} />
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    warnCard: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 20, padding: 16, borderRadius: 16, borderWidth: 1 },
    warnTitle: { fontSize: 15, fontWeight: '800' },
    warnText: { fontSize: 13, lineHeight: 20 },
    form: { paddingHorizontal: 24, gap: 8, paddingBottom: 40 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 8 },
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
});
