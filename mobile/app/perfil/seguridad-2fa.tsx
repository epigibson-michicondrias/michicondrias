import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/src/hooks/useTheme';
import { use2FA } from '@/src/hooks/perfil/use2FA';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Button from '@/src/components/Button';
import { Shield, ShieldCheck, ShieldOff, Eye, EyeOff, Smartphone, Copy } from 'lucide-react-native';
import { families, font, layout, spacing } from '@/constants/design';

export default function Seguridad2FAScreen() {
    const { theme } = useTheme();
    const {
        qrUri,
        secret,
        code,
        is2FAEnabled,
        isSettingUp,
        isEnabling,
        isDisabling,
        setCode,
        handleSetup,
        handleEnable,
        handleDisable,
        openAuthenticator,
        copySecret,
    } = use2FA();

    const [showSecret, setShowSecret] = React.useState(false);

    return (
        <ScreenContainer>
            <ScreenHeader title="Seguridad 2FA" subtitle="Autenticación de dos factores" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <View style={[styles.statusIcon, {
                        backgroundColor: is2FAEnabled ? theme.success + '20' : theme.warning + '20'
                    }]}>
                        {is2FAEnabled ? (
                            <ShieldCheck size={32} color={theme.success} />
                        ) : (
                            <Shield size={32} color={theme.warning} />
                        )}
                    </View>
                    <Text style={[styles.statusTitle, { color: theme.text }]}>
                        {is2FAEnabled ? '2FA Activado' : '2FA Desactivado'}
                    </Text>
                    <Text style={[styles.statusDescription, { color: theme.textMuted }]}>
                        {is2FAEnabled
                            ? 'Tu cuenta está protegida con autenticación de dos factores.'
                            : 'Activa 2FA para añadir una capa extra de seguridad a tu cuenta.'}
                    </Text>
                </View>

                {/* Setup Section */}
                {!qrUri && !is2FAEnabled && (
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Configurar 2FA
                        </Text>
                        <Text style={[styles.cardDescription, { color: theme.textMuted }]}>
                            Necesitarás una app de autenticación como Google Authenticator o Authy.
                        </Text>
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                            onPress={handleSetup}
                            disabled={isSettingUp}
                        >
                            {isSettingUp ? (
                                <ActivityIndicator color={theme.onPrimary} size="small" />
                            ) : (
                                <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Iniciar Configuración</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* QR Code + acciones */}
                {qrUri && !is2FAEnabled && (
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Escanea el código QR
                        </Text>
                        <Text style={[styles.cardDescription, { color: theme.textMuted }]}>
                            Escanea el código con tu app de autenticación (Google Authenticator, Authy, etc.).
                        </Text>

                        {/* QR real en SVG (siempre negro sobre blanco: si no, no se escanea) */}
                        <View style={[styles.qrContainer, { borderColor: theme.border }]}>
                            <QRCode value={qrUri} size={180} />
                        </View>

                        {/* Acciones */}
                        <View style={styles.qrActions}>
                            <TouchableOpacity
                                style={[styles.qrActionButton, { borderColor: theme.border }]}
                                onPress={openAuthenticator}
                                activeOpacity={0.8}
                            >
                                <Smartphone size={18} color={theme.primary} />
                                <Text style={[styles.qrActionText, { color: theme.primary }]}>Abrir en app autenticadora</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.qrActionButton, { borderColor: theme.border }]}
                                onPress={copySecret}
                                activeOpacity={0.8}
                            >
                                <Copy size={18} color={theme.primary} />
                                <Text style={[styles.qrActionText, { color: theme.primary }]}>Copiar clave</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Secret Key */}
                        {secret && (
                            <View style={styles.secretContainer}>
                                <Text style={[styles.secretLabel, { color: theme.textMuted }]}>
                                    Clave secreta:
                                </Text>
                                <View style={[styles.secretRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <Text style={[styles.secretText, { color: theme.text }]} selectable>
                                        {showSecret ? secret : '••••••••••••••••'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowSecret(!showSecret)}>
                                        {showSecret ? (
                                            <EyeOff size={20} color={theme.textMuted} />
                                        ) : (
                                            <Eye size={20} color={theme.textMuted} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Code Input + Enable/Disable */}
                {(qrUri || is2FAEnabled) && (
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            {is2FAEnabled ? 'Desactivar 2FA' : 'Verificar Código'}
                        </Text>
                        <Text style={[styles.cardDescription, { color: theme.textMuted }]}>
                            {is2FAEnabled
                                ? 'Ingresa el código de tu app de autenticación para desactivar 2FA.'
                                : 'Ingresa el código de 6 dígitos de tu app de autenticación.'}
                        </Text>

                        <TextInput
                            style={[styles.codeInput, {
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text,
                            }]}
                            value={code}
                            onChangeText={setCode}
                            placeholder="000000"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="number-pad"
                            maxLength={6}
                            textAlign="center"
                        />

                        {is2FAEnabled ? (
                            <TouchableOpacity
                                style={[styles.dangerButton, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
                                onPress={handleDisable}
                                disabled={isDisabling}
                            >
                                {isDisabling ? (
                                    <ActivityIndicator color={theme.error} size="small" />
                                ) : (
                                    <>
                                        <ShieldOff size={20} color={theme.error} />
                                        <Text style={[styles.dangerButtonText, { color: theme.error }]}>
                                            Desactivar 2FA
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                                onPress={handleEnable}
                                disabled={isEnabling}
                            >
                                {isEnabling ? (
                                    <ActivityIndicator color={theme.onPrimary} size="small" />
                                ) : (
                                    <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Activar 2FA</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: layout.screenPadding,
    },
    statusCard: {
        padding: spacing.xxl,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    statusIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    statusTitle: {
        fontSize: font.h3,
        fontFamily: families.extrabold,
        marginBottom: spacing.sm,
    },
    statusDescription: {
        fontSize: font.base,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.xl,
    },
    cardTitle: {
        fontSize: font.xxl,
        fontFamily: families.bold,
        marginBottom: spacing.sm,
    },
    cardDescription: {
        fontSize: font.base,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    qrContainer: {
        alignSelf: 'center',
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: spacing.lg,
    },
    qrActions: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    qrActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    qrActionText: {
        fontSize: font.base,
        fontFamily: families.bold,
    },
    secretContainer: {
        marginTop: spacing.xs,
    },
    secretLabel: {
        fontSize: font.base,
        fontFamily: families.semibold,
        marginBottom: spacing.sm,
    },
    secretRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
    },
    secretText: {
        fontSize: font.base,
        fontFamily: 'monospace',
        flex: 1,
    },
    codeInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: font.h1,
        fontFamily: families.bold,
        letterSpacing: 8,
        marginBottom: spacing.lg,
    },
    primaryButton: {
        paddingVertical: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    dangerButton: {
        flexDirection: 'row',
        paddingVertical: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    dangerButtonText: {
        fontSize: font.xl,
        fontFamily: families.bold,
    },
    bottomSpacer: {
        height: 40,
    },
});
