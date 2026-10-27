import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    MapPin,
    Truck,
    ShieldCheck,
    CheckCircle2,
    Lock,
    ArrowRight,
    Home,
    Building2,
    Info,
    ChevronRight,
    Zap,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '@/src/contexts/CartContext';
import { formatCurrency } from '@/src/utils/formatters';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import CheckoutSteps from '@/src/features/tienda/CheckoutSteps';
import { families, layout, radius, shadow, spacing, type } from '@/constants/design';

interface AddressForm {
    street: string;
    extNumber: string;
    intNumber: string;
    colonia: string;
    city: string;
    state: string;
    postalCode: string;
    references: string;
    receiverName: string;
    receiverPhone: string;
}

export default function CheckoutDireccionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { items, cartTotal, cartCount, savedAddress, rememberAddress } = useCart();

    const [useNewAddress, setUseNewAddress] = useState(!savedAddress);
    const [form, setForm] = useState<AddressForm>({
        street: '',
        extNumber: '',
        intNumber: '',
        colonia: '',
        city: '',
        state: '',
        postalCode: '',
        references: '',
        receiverName: '',
        receiverPhone: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

    useEffect(() => {
        if (!savedAddress) {
            setUseNewAddress(true);
        }
    }, [savedAddress]);

    const updateField = (field: keyof AddressForm, val: string) => {
        setForm((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const nextErrors: Partial<Record<keyof AddressForm, string>> = {};
        if (!form.receiverName.trim()) nextErrors.receiverName = 'Indica quién recibe el paquete';
        if (!form.receiverPhone.trim() || form.receiverPhone.trim().length < 10) {
            nextErrors.receiverPhone = 'Teléfono a 10 dígitos obligatorio';
        }
        if (!form.street.trim()) nextErrors.street = 'Escribe calle o avenida';
        if (!form.extNumber.trim()) nextErrors.extNumber = 'Número obligatorio';
        if (!form.colonia.trim()) nextErrors.colonia = 'Colonia o barrio obligatorio';
        if (!form.postalCode.trim() || form.postalCode.trim().length < 5) {
            nextErrors.postalCode = 'C.P. válido (5 dígitos)';
        }
        if (!form.city.trim()) nextErrors.city = 'Ciudad / Municipio';
        if (!form.state.trim()) nextErrors.state = 'Estado obligatorio';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildFullAddress = (): string => {
        if (!useNewAddress && savedAddress) {
            return savedAddress;
        }
        const parts = [
            `${form.street} #${form.extNumber}${form.intNumber ? ` Int. ${form.intNumber}` : ''}`,
            `Col. ${form.colonia}`,
            `C.P. ${form.postalCode}, ${form.city}, ${form.state}`,
            form.references ? `Ref: ${form.references}` : '',
            `Recibe: ${form.receiverName} (Tel: ${form.receiverPhone})`,
        ].filter(Boolean);
        return parts.join(' · ');
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinueToPayment = async () => {
        if (items.length === 0) {
            showAlert({
                type: 'warning',
                title: 'Bolsa vacía',
                message: 'No tienes productos por pagar.',
                onButtonPress: () => router.replace('/tienda'),
            });
            return;
        }

        let finalAddress = savedAddress;
        if (useNewAddress) {
            if (!validateForm()) {
                showAlert({
                    type: 'warning',
                    title: 'Faltan datos de envío',
                    message: 'Revisa los campos en rojo para asegurar que tu paquete llegue sin problemas.',
                });
                return;
            }
            finalAddress = buildFullAddress();
            rememberAddress(finalAddress);
        } else if (!savedAddress) {
            setUseNewAddress(true);
            return;
        }

        try {
            setIsSubmitting(true);
            const { createOrder } = await import('@/src/services/ecommerce');
            const order = await createOrder({
                items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity })),
                shipping_address: finalAddress,
            });
            router.push({
                pathname: '/tienda/pago-nativo',
                params: { order_id: order.id },
            } as any);
        } catch (err: any) {
            showAlert({
                type: 'error',
                title: 'No se pudo crear el pedido',
                message: err?.message || 'Inténtalo de nuevo en unos momentos.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.footerRow}>
                <View>
                    <Text style={[type.caption, { color: theme.textMuted }]}>Total a pagar ({cartCount} prod.)</Text>
                    <Text style={[type.h2, { fontFamily: families.bold, color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
                </View>
                <Button
                    label="Pagar in-app"
                    icon={<Lock size={layout.icon.sm} color={theme.onPrimary} />}
                    onPress={handleContinueToPayment}
                    loading={isSubmitting}
                    size="lg"
                    style={styles.payBtn}
                    accessibilityLabel="Continuar al pago con tarjeta o transferencia"
                />
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Elegir forma de entrega"
                subtitle="Paso 1 de 2: Dirección y envío"
            />

            <KeyboardScreen contentContainerStyle={styles.content} footer={footer}>
                <CheckoutSteps current={1} />

                {/* Opción Dirección Guardada */}
                {Boolean(savedAddress) && (
                    <Card style={[styles.optionCard, !useNewAddress && { borderColor: theme.primary, borderWidth: 2 }]}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setUseNewAddress(false)}
                            style={styles.optionRow}
                        >
                            <View style={[styles.radio, { borderColor: theme.success }]}>
                                {!useNewAddress && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                <View style={styles.tagRow}>
                                    <Home size={14} color={theme.primary} />
                                    <Text style={[type.caption, { fontFamily: families.bold, color: theme.primary, marginLeft: 4 }]}>
                                        Dirección habitual guardada
                                    </Text>
                                </View>
                                <Text style={[type.body, { color: theme.text, marginTop: 4 }]}>{savedAddress}</Text>
                                <View style={styles.fullTagRow}>
                                    <Zap size={12} color={theme.success} fill={theme.success} />
                                    <Text style={[type.caption, { color: theme.success, fontFamily: families.bold, marginLeft: 4 }]}>
                                        Envío FULL directo a este domicilio
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Card>
                )}

                {/* Botón selector: usar otra dirección */}
                {Boolean(savedAddress) && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setUseNewAddress(true)}
                        style={[
                            styles.optionCard,
                            useNewAddress && { borderColor: theme.primary, borderWidth: 2 },
                            { backgroundColor: theme.surface, padding: spacing.md, borderRadius: radius.lg, marginTop: spacing.xs },
                        ]}
                    >
                        <View style={styles.optionRow}>
                            <View style={[styles.radio, { borderColor: theme.success }]}>
                                {useNewAddress && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Entregar en otra dirección</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>Escribe un nuevo domicilio para este pedido</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Formulario desglosado de Dirección */}
                {useNewAddress && (
                    <Card style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <Building2 size={18} color={theme.primary} />
                            <Text style={[type.title, { color: theme.text, marginLeft: spacing.xs }]}>
                                Datos del domicilio
                            </Text>
                        </View>

                        <Text style={[type.caption, { color: theme.textMuted, marginBottom: spacing.sm }]}>
                            Información necesaria para la paquetería y el repartidor:
                        </Text>

                        {/* Quien recibe */}
                        <FormField
                            label="Nombre y apellido de quien recibe"
                            value={form.receiverName}
                            onChangeText={(v) => updateField('receiverName', v)}
                            placeholder="Ej. Juan Pérez"
                            autoComplete="name"
                            error={errors.receiverName}
                        />

                        <FormField
                            label="Teléfono de contacto"
                            value={form.receiverPhone}
                            onChangeText={(v) => updateField('receiverPhone', v)}
                            placeholder="10 dígitos para avisos de entrega"
                            keyboardType="phone-pad"
                            maxLength={10}
                            autoComplete="tel"
                            error={errors.receiverPhone}
                        />

                        {/* Calle y número */}
                        <FormField
                            label="Calle o Avenida"
                            value={form.street}
                            onChangeText={(v) => updateField('street', v)}
                            placeholder="Ej. Av. Insurgentes Sur"
                            autoComplete="street-address"
                            error={errors.street}
                        />

                        <View style={styles.inlineFields}>
                            <View style={{ flex: 1, marginRight: spacing.xs }}>
                                <FormField
                                    label="Núm. Exterior"
                                    value={form.extNumber}
                                    onChangeText={(v) => updateField('extNumber', v)}
                                    placeholder="123"
                                    error={errors.extNumber}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.xs }}>
                                <FormField
                                    label="Núm. Interior (opc)"
                                    value={form.intNumber}
                                    onChangeText={(v) => updateField('intNumber', v)}
                                    placeholder="Depto 4B"
                                />
                            </View>
                        </View>

                        {/* Colonia y CP */}
                        <View style={styles.inlineFields}>
                            <View style={{ flex: 1.2, marginRight: spacing.xs }}>
                                <FormField
                                    label="Colonia"
                                    value={form.colonia}
                                    onChangeText={(v) => updateField('colonia', v)}
                                    placeholder="Colonia o Barrio"
                                    error={errors.colonia}
                                />
                            </View>
                            <View style={{ flex: 0.8, marginLeft: spacing.xs }}>
                                <FormField
                                    label="Código Postal"
                                    value={form.postalCode}
                                    onChangeText={(v) => updateField('postalCode', v)}
                                    placeholder="06600"
                                    keyboardType="number-pad"
                                    maxLength={5}
                                    autoComplete="postal-code"
                                    error={errors.postalCode}
                                />
                            </View>
                        </View>

                        {/* Municipio / Ciudad y Estado */}
                        <View style={styles.inlineFields}>
                            <View style={{ flex: 1, marginRight: spacing.xs }}>
                                <FormField
                                    label="Ciudad / Alcaldía"
                                    value={form.city}
                                    onChangeText={(v) => updateField('city', v)}
                                    placeholder="Ej. Cuauhtémoc"
                                    error={errors.city}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: spacing.xs }}>
                                <FormField
                                    label="Estado"
                                    value={form.state}
                                    onChangeText={(v) => updateField('state', v)}
                                    placeholder="Ej. CDMX"
                                    error={errors.state}
                                />
                            </View>
                        </View>

                        {/* Referencias */}
                        <FormField
                            label="Indicaciones para la entrega (opcional)"
                            value={form.references}
                            onChangeText={(v) => updateField('references', v)}
                            placeholder="Ej. Casa blanca con portón negro, entre calles X e Y"
                            multiline
                            numberOfLines={2}
                        />
                    </Card>
                )}

                {/* Card de Compra Protegida */}
                <View style={[styles.guaranteeCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <ShieldCheck size={20} color={theme.success} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>
                            Compra Protegida con Michicondrias
                        </Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            Recibe el producto que esperabas o te devolvemos tu dinero. Envío asegurado con seguimiento en tiempo real.
                        </Text>
                    </View>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.md,
        paddingBottom: 120,
        gap: spacing.md,
    },
    optionCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fullTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    formCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        gap: spacing.xs,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    inlineFields: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    guaranteeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        marginTop: spacing.xs,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.md,
        ...shadow.card,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    payBtn: {
        flex: 1,
    },
});
