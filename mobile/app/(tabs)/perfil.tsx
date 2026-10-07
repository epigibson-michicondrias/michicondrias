import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    PawPrint, Calendar, ShoppingBag, Heart, UserRound, ShieldCheck, Lock, CreditCard, Handshake, HelpCircle,
    FileText, LogOut, Sun, Moon, Monitor, ChevronRight, AlertCircle, CheckCircle2,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAccount } from '@/src/hooks/perfil/useAccount';
import { useAvatar } from '@/src/hooks/perfil/useAvatar';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import Card from '@/src/components/Card';
import SegmentedControl from '@/src/components/SegmentedControl';
import { spacing, radius, type, layout } from '@/constants/design';

/** Perfil: única pantalla de cuenta (actividad, datos, verificación, seguridad, tema, soporte y cierre de sesión). */
export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { avatarUrl } = useAvatar();
    const {
        user, roleLabel, canBecomePro, verification, verificationCopy, pendingAction,
        themeMode, setThemeMode, openBillingPortal, isOpeningBilling, hasLegal, openLegal, confirmSignOut, appVersion,
    } = useAccount();

    const go = (route: string) => () => router.push(route as any);
    const initial = user?.full_name?.trim()?.[0]?.toUpperCase() || '?';

    return (
        <ScreenContainer>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
            >
                <Text accessibilityRole="header" style={[type.h1, { color: theme.text }]}>Perfil</Text>

                {/* Cuenta: toca para editar tus datos */}
                <Card onPress={go('/perfil/editar')} elevated accessibilityLabel={`${user?.full_name || 'Tu cuenta'}. Editar datos personales`}>
                    <View style={styles.accountRow}>
                        <View style={[styles.avatar, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} accessibilityLabel="Tu foto de perfil" />
                            ) : (
                                <Text style={[type.h1, { color: theme.accent }]}>{initial}</Text>
                            )}
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{user?.full_name || 'Tu cuenta'}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{user?.email}</Text>
                            <View style={styles.roleRow}>
                                <Text style={[type.label, { color: theme.accent }]}>{roleLabel}</Text>
                                {verification === 'VERIFIED' && (
                                    <CheckCircle2 size={layout.icon.xs} color={theme.success} accessibilityLabel="Identidad verificada" />
                                )}
                            </View>
                        </View>
                        <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                    </View>
                </Card>

                {/* Aviso solo si hay algo que hacer */}
                {pendingAction && (
                    <TouchableOpacity
                        style={[styles.notice, { backgroundColor: pendingAction.tone === 'success' ? theme.successLight : theme.errorLight }]}
                        onPress={go(pendingAction.route)}
                        accessibilityRole="button"
                        accessibilityLabel={`${pendingAction.title}. ${pendingAction.desc}`}
                    >
                        {pendingAction.tone === 'success'
                            ? <Handshake size={layout.icon.md} color={theme.success} />
                            : <AlertCircle size={layout.icon.md} color={theme.error} />}
                        <View style={styles.flex}>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>{pendingAction.title}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>{pendingAction.desc}</Text>
                        </View>
                        <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                    </TouchableOpacity>
                )}

                <View style={styles.section}>
                    <SectionHeader overline title="Mi actividad" />
                    <View style={styles.rows}>
                        <ListRow icon={PawPrint} label="Mis mascotas" desc="Fichas, carnet y salud" color={theme.accent} onPress={go('/mascotas')} />
                        <ListRow icon={Calendar} label="Mis citas" desc="Próximas y pasadas" color={theme.primary} onPress={go('/directorio/citas')} />
                        <ListRow icon={ShoppingBag} label="Mis compras" desc="Pedidos de la tienda" color={theme.secondary} onPress={go('/tienda/compras')} />
                        <ListRow icon={Heart} label="Mis adopciones" desc="Tus solicitudes para adoptar" color={theme.error} onPress={go('/adopciones/mis-solicitudes')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader overline title="Cuenta" />
                    <View style={styles.rows}>
                        <ListRow icon={UserRound} label="Datos personales" desc="Nombre, teléfono, foto y más" color={theme.primary} onPress={go('/perfil/editar')} />
                        <ListRow
                            icon={ShieldCheck}
                            label="Verificación de identidad"
                            desc={verificationCopy.desc}
                            badge={verificationCopy.badge}
                            color={theme.success}
                            onPress={go('/perfil/verificacion')}
                        />
                        <ListRow icon={Lock} label="Seguridad" desc="Verificación en dos pasos" color={theme.info} onPress={go('/perfil/seguridad-2fa')} />
                        <ListRow
                            icon={CreditCard}
                            label="Facturación"
                            desc={isOpeningBilling ? 'Abriendo…' : 'Suscripciones y métodos de pago'}
                            color={theme.secondary}
                            onPress={openBillingPortal}
                        />
                        {canBecomePro && (
                            <ListRow icon={Handshake} label="Ser profesional" desc="Ofrece tus servicios en Michicondrias" color={theme.accent} onPress={go('/perfil/partner')} />
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader overline title="Apariencia" />
                    <SegmentedControl
                        accessibilityLabel="Tema de la app"
                        value={themeMode}
                        onChange={setThemeMode}
                        options={[
                            { value: 'light', label: 'Claro', icon: Sun },
                            { value: 'dark', label: 'Oscuro', icon: Moon },
                            { value: 'system', label: 'Sistema', icon: Monitor },
                        ]}
                    />
                </View>

                <View style={styles.section}>
                    <SectionHeader overline title="Soporte y legal" />
                    <View style={styles.rows}>
                        <ListRow icon={HelpCircle} label="Ayuda" desc="Preguntas frecuentes y contacto" color={theme.textMuted} onPress={go('/ayuda')} />
                        {hasLegal && <ListRow icon={FileText} label="Privacidad y términos" color={theme.textMuted} onPress={openLegal} />}
                    </View>
                </View>

                <View style={styles.footer}>
                    <ListRow icon={LogOut} label="Cerrar sesión" destructive onPress={confirmSignOut} />
                    <TouchableOpacity
                        onPress={go('/perfil/eliminar-cuenta')}
                        style={styles.deleteLink}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar mi cuenta"
                    >
                        <Text style={[type.caption, { color: theme.textMuted }]}>Eliminar mi cuenta</Text>
                    </TouchableOpacity>
                    {!!appVersion && (
                        <Text style={[type.caption, styles.version, { color: theme.textMuted }]}>Michicondrias {appVersion}</Text>
                    )}
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge * 2,
        gap: spacing.lg,
    },
    accountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    accountInfo: {
        flex: 1,
        gap: spacing.xxs,
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        minHeight: layout.minTouch,
    },
    flex: {
        flex: 1,
    },
    section: {
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    rows: {
        gap: spacing.sm,
    },
    footer: {
        marginTop: spacing.lg,
        gap: spacing.md,
        alignItems: 'stretch',
    },
    deleteLink: {
        alignSelf: 'center',
        minHeight: layout.minTouch,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    version: {
        textAlign: 'center',
    },
});
