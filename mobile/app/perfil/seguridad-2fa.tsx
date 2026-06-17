import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { use2FA } from '@/src/hooks/perfil';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Shield, ShieldCheck, ShieldOff, Copy, Eye, EyeOff } from 'lucide-react-native';

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
    } = use2FA();

    const [showSecret, setShowSecret] = React.useState(false);

    return (
        <ScreenContainer>
            <ScreenHeader title="Seguridad 2FA" subtitle="Autenticación de dos factores" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <View style={[styles.statusIcon, {
                        backgroundColor: is2FAEnabled ? '#10b98120' : '#f59e0b20'
                    }]}>
                        {is2FAEnabled ? (
                            <ShieldCheck size={32} color="#10b981" />
                        ) : (
                            <Shield size={32} color="#f59e0b" />
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
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Iniciar Configuración</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* QR Code / URI Display */}
                {qrUri && !is2FAEnabled && (
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Escanea el código QR
                        </Text>
                        <Text style={[styles.cardDescription, { color: theme.textMuted }]}>
                            Escanea este enlace con tu app de autenticación o copia la clave secreta.
                        </Text>

                        {/* QR URI display */}
                        <View style={[styles.qrContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Text style={[styles.qrText, { color: theme.primary }]} selectable>
                                {qrUri}
                            </Text>
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
                                style={[styles.dangerButton, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}
                                onPress={handleDisable}
                                disabled={isDisabling}
                            >
                                {isDisabling ? (
                                    <ActivityIndicator color="#ef4444" size="small" />
                                ) : (
                                    <>
                                        <ShieldOff size={20} color="#ef4444" />
                                        <Text style={[styles.dangerButtonText, { color: '#ef4444' }]}>
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
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Activar 2FA</Text>
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
        paddingHorizontal: 24,
    },
    statusCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 20,
    },
    statusIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    statusDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    qrContainer: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    qrText: {
        fontSize: 12,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    secretContainer: {
        marginTop: 4,
    },
    secretLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    secretRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    secretText: {
        fontSize: 14,
        fontFamily: 'monospace',
        flex: 1,
    },
    codeInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 8,
        marginBottom: 16,
    },
    primaryButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    dangerButton: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 40,
    },
});
