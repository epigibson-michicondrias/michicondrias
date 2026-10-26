import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
    CreditCard, Satellite, CheckCircle2, ShoppingBag, FileText, ChevronRight,
    Sparkles, ShieldCheck, AlertCircle, ExternalLink, XCircle
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { usePets } from '@/src/hooks/mascotas/usePets';
import { createBillingPortalSession, createSubscriptionSession, cancelSubscription } from '@/src/services/ecommerce';
import { openStripeUrl } from '@/src/utils/payments';
import { showAlert } from '@/src/components/AppAlert';
import { haptic } from '@/src/utils/haptics';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Card from '@/src/components/Card';
import SectionHeader from '@/src/components/SectionHeader';
import Button from '@/src/components/Button';
import { spacing, radius, type, layout } from '@/constants/design';

export default function FacturacionScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { pets, isLoading: isLoadingPets, refetch: refetchPets } = usePets();

    const [processingPetId, setProcessingPetId] = useState<string | null>(null);

    // Portal de facturación de Stripe
    const portalMutation = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                openStripeUrl(data.url).catch(() => {
                    showAlert({
                        type: 'error',
                        title: 'No se pudo abrir',
                        message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.',
                    });
                });
            } else if (data.demo) {
                showAlert({
                    type: 'info',
                    title: 'Modo de pruebas',
                    message: data.message || 'La pasarela de Stripe está en modo de prueba. Puedes activar o cancelar tus suscripciones de Michi-Tracker Pro directamente desde esta pantalla.',
                });
            }
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'No disponible',
                message: 'No se pudo contactar al portal de pagos. Inténtalo más tarde.',
            });
        },
    });

    // Suscribir mascota a Michi-Tracker Pro
    const subscribeMutation = useMutation({
        mutationFn: (petId: string) => createSubscriptionSession(petId),
        onMutate: (petId) => setProcessingPetId(petId),
        onSuccess: async (data, petId) => {
            setProcessingPetId(null);
            if (data.url) {
                try {
                    await openStripeUrl(data.url);
                } catch {
                    showAlert({
                        type: 'error',
                        title: 'Error de pago',
                        message: 'No se pudo completar el proceso de suscripción.',
                    });
                }
            }
            // Invalidar queries para refrescar estado de las mascotas
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet', petId] });
            refetchPets();
        },
        onError: () => {
            setProcessingPetId(null);
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo iniciar la suscripción de Michi-Tracker Pro.',
            });
        },
    });

    // Cancelar suscripción
    const cancelMutation = useMutation({
        mutationFn: (petId: string) => cancelSubscription(petId),
        onMutate: (petId) => setProcessingPetId(petId),
        onSuccess: (_data, petId) => {
            setProcessingPetId(null);
            haptic.success();
            showAlert({
                type: 'success',
                title: 'Suscripción cancelada',
                message: 'Se canceló Michi-Tracker Pro para esta mascota.',
            });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['pet', petId] });
            refetchPets();
        },
        onError: () => {
            setProcessingPetId(null);
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo cancelar la suscripción. Inténtalo de nuevo.',
            });
        },
    });

    const handleSubscribe = (petId: string, petName: string) => {
        haptic.selection();
        showAlert({
            type: 'info',
            title: `Activar Michi-Tracker Pro`,
            message: `¿Deseas activar el seguimiento GPS en tiempo real para ${petName} por $199.00 MXN / mes?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Activar ahora',
            onButtonPress: () => {
                subscribeMutation.mutate(petId);
            },
        });
    };

    const handleCancel = (petId: string, petName: string) => {
        haptic.warning();
        showAlert({
            type: 'warning',
            title: `Cancelar suscripción`,
            message: `¿Seguro que deseas desactivar Michi-Tracker Pro para ${petName}? Tu mascota dejará de tener rastreo GPS en tiempo real.`,
            showCancel: true,
            cancelText: 'Mantener',
            buttonText: 'Cancelar suscripción',
            onButtonPress: () => {
                cancelMutation.mutate(petId);
            },
        });
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Facturación"
                subtitle="Suscripciones y métodos de pago"
                showBack
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Banner Destacado Michi-Tracker Pro */}
                <Card elevated style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <View style={styles.heroHeader}>
                        <View style={[styles.heroIconBox, { backgroundColor: theme.primary + '20' }]}>
                            <Satellite size={24} color={theme.primary} />
                        </View>
                        <View style={styles.heroTitleBox}>
                            <Text style={[type.h2, { color: theme.text }]}>Michi-Tracker Pro</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                $199.00 MXN / mes por mascota · Cancela cuando quieras
                            </Text>
                        </View>
                    </View>
                    <View style={styles.heroFeatures}>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color={theme.success} />
                            <Text style={[type.body, { color: theme.text }]}>Rastreo GPS en tiempo real</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color={theme.success} />
                            <Text style={[type.body, { color: theme.text }]}>Alertas instantáneas de extravío</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color={theme.success} />
                            <Text style={[type.body, { color: theme.text }]}>Zonas seguras y geocercas inteligentes</Text>
                        </View>
                    </View>
                </Card>

                {/* Sección: Estado de Mis Mascotas */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Tus Mascotas"
                        subtitle="Activa o administra el rastreador en cada mascota"
                    />

                    {isLoadingPets ? (
                        <View style={styles.loaderBox}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    ) : pets.length === 0 ? (
                        <Card style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
                            <Text style={[type.body, { color: theme.textMuted, textAlign: 'center' }]}>
                                No tienes mascotas registradas aún.
                            </Text>
                            <TouchableOpacity
                                style={[styles.addPetBtn, { backgroundColor: theme.primary }]}
                                onPress={() => router.push('/mascotas/nueva')}
                            >
                                <Text style={[type.button, { color: theme.onPrimary }]}>Registrar mi primera mascota</Text>
                            </TouchableOpacity>
                        </Card>
                    ) : (
                        <View style={styles.petsList}>
                            {pets.map((pet) => {
                                const isActive = !!pet.has_active_subscription;
                                const isBusy = processingPetId === pet.id;
                                const initial = pet.name.trim()[0]?.toUpperCase() || '?';

                                return (
                                    <Card
                                        key={pet.id}
                                        style={[
                                            styles.petCard,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: isActive ? theme.success + '40' : theme.borderLight,
                                            },
                                        ]}
                                    >
                                        <View style={styles.petRow}>
                                            <View style={[styles.petAvatar, { backgroundColor: theme.accentLight }]}>
                                                {pet.photo_url ? (
                                                    <Image source={{ uri: pet.photo_url }} style={styles.petPhoto} />
                                                ) : (
                                                    <Text style={[type.h2, { color: theme.accent }]}>{initial}</Text>
                                                )}
                                            </View>

                                            <View style={styles.petInfo}>
                                                <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>
                                                    {pet.name}
                                                </Text>
                                                <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>
                                                    {pet.species === 'cat' ? 'Gato' : pet.species === 'dog' ? 'Perro' : pet.species}
                                                    {pet.breed ? ` · ${pet.breed}` : ''}
                                                </Text>
                                                <View style={styles.statusBadgeRow}>
                                                    <View
                                                        style={[
                                                            styles.statusBadge,
                                                            {
                                                                backgroundColor: isActive ? theme.success + '20' : theme.backgroundSecondary,
                                                            },
                                                        ]}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.statusDot,
                                                                { backgroundColor: isActive ? theme.success : theme.textMuted },
                                                            ]}
                                                        />
                                                        <Text
                                                            style={[
                                                                type.labelSentence,
                                                                { color: isActive ? theme.success : theme.textMuted },
                                                            ]}
                                                        >
                                                            {isActive ? 'GPS Activo' : 'Sin suscripción'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.petActionBox}>
                                                {isBusy ? (
                                                    <ActivityIndicator size="small" color={theme.primary} />
                                                ) : isActive ? (
                                                    <TouchableOpacity
                                                        style={[styles.cancelBtn, { borderColor: theme.error + '60' }]}
                                                        onPress={() => handleCancel(pet.id, pet.name)}
                                                    >
                                                        <Text style={[type.caption, { color: theme.error, fontWeight: '600' }]}>
                                                            Cancelar
                                                        </Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        style={[styles.activateBtn, { backgroundColor: theme.primary }]}
                                                        onPress={() => handleSubscribe(pet.id, pet.name)}
                                                    >
                                                        <Text style={[type.caption, { color: theme.onPrimary, fontWeight: '700' }]}>
                                                            Activar Pro
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Sección: Portal Stripe */}
                <View style={styles.section}>
                    <SectionHeader
                        title="Métodos de Pago"
                        subtitle="Administra tarjetas y datos de facturación"
                    />
                    <Card style={[styles.portalCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <View style={styles.portalRow}>
                            <View style={[styles.portalIconBox, { backgroundColor: theme.secondary + '20' }]}>
                                <CreditCard size={22} color={theme.secondary} />
                            </View>
                            <View style={styles.portalTextBox}>
                                <Text style={[type.title, { color: theme.text }]}>Portal de Pagos Seguro</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Tus métodos de pago están encriptados y procesados de manera segura por Stripe.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.portalButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                            onPress={() => {
                                haptic.selection();
                                portalMutation.mutate();
                            }}
                            disabled={portalMutation.isPending}
                        >
                            {portalMutation.isPending ? (
                                <ActivityIndicator size="small" color={theme.text} />
                            ) : (
                                <>
                                    <Text style={[type.bodyStrong, { color: theme.text }]}>
                                        Abrir portal de Stripe
                                    </Text>
                                    <ExternalLink size={16} color={theme.textMuted} />
                                </>
                            )}
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Sección: Pedidos de la tienda */}
                <View style={styles.section}>
                    <SectionHeader title="Historial y Comprobantes" />
                    <Card
                        style={[styles.linkCard, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/tienda/compras')}
                    >
                        <View style={styles.linkRow}>
                            <View style={[styles.linkIconBox, { backgroundColor: theme.info + '20' }]}>
                                <ShoppingBag size={20} color={theme.info} />
                            </View>
                            <View style={styles.linkInfo}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Mis pedidos de la tienda</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Revisa el detalle de tus compras de productos y accesorios
                                </Text>
                            </View>
                            <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                        </View>
                    </Card>

                    <Card style={[styles.fiscalCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.borderLight }]}>
                        <View style={styles.fiscalRow}>
                            <FileText size={18} color={theme.textMuted} />
                            <View style={styles.fiscalTextBox}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>
                                    Factura fiscal con RFC (CFDI)
                                </Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Para solicitar factura de compras o suscripciones, envía tus datos fiscales y el comprobante a soporte@michicondrias.com.
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl * 2,
        gap: spacing.xl,
    },
    heroCard: {
        padding: spacing.lg,
        borderRadius: radius.xl,
        borderWidth: 1,
        gap: spacing.md,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    heroIconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitleBox: {
        flex: 1,
    },
    heroFeatures: {
        gap: spacing.sm,
        paddingTop: spacing.xs,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    section: {
        gap: spacing.md,
    },
    loaderBox: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
    },
    emptyCard: {
        padding: spacing.xl,
        borderRadius: radius.lg,
        alignItems: 'center',
        gap: spacing.md,
    },
    addPetBtn: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    petsList: {
        gap: spacing.sm,
    },
    petCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    petAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    petPhoto: {
        width: '100%',
        height: '100%',
    },
    petInfo: {
        flex: 1,
        gap: 2,
    },
    statusBadgeRow: {
        flexDirection: 'row',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    petActionBox: {
        marginLeft: spacing.xs,
    },
    activateBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    cancelBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    portalCard: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
    },
    portalRow: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
    },
    portalIconBox: {
        width: 42,
        height: 42,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    portalTextBox: {
        flex: 1,
        gap: 2,
    },
    portalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    linkCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    linkIconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkInfo: {
        flex: 1,
    },
    fiscalCard: {
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    fiscalRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    fiscalTextBox: {
        flex: 1,
        gap: 2,
    },
});
