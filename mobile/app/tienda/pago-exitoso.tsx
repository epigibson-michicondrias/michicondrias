import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { CheckCircle, Home, ShoppingBag, Package, Truck, Mail, Phone, Star } from 'lucide-react-native';

export default function PagoExitosoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const params = useLocalSearchParams();

    const orderId = params.orderId as string;
    const amount = params.amount as string;
    const productName = params.productName as string;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={[styles.successIconContainer, { backgroundColor: '#22c55e15' }]}>
                    <CheckCircle size={80} color="#22c55e" />
                </View>

                {/* Success Message */}
                <View style={styles.messageContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        ¡Pago Exitoso!
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Tu pedido ha sido procesado exitosamente
                    </Text>
                </View>

                {/* Order Details */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Detalles del Pedido
                    </Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Número de Pedido
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            #{orderId || '000000'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Producto
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.text, textAlign: 'right', flex: 1 }]}>
                            {productName || 'Producto'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Total Pagado
                        </Text>
                        <Text style={[styles.detailValue, { color: '#22c55e' }]}>
                            ${amount || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Fecha
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            {new Date().toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {/* Shipping Information */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Información de Envío
                    </Text>
                    
                    <View style={styles.shippingInfo}>
                        <View style={styles.shippingRow}>
                            <Truck size={20} color={theme.primary} />
                            <Text style={[styles.shippingText, { color: theme.text }]}>
                                Envío estándar (3-5 días hábiles)
                            </Text>
                        </View>
                        
                        <View style={styles.shippingRow}>
                            <Package size={20} color={theme.primary} />
                            <Text style={[styles.shippingText, { color: theme.text }]}>
                                Tu pedido será procesado y enviado pronto
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Contact Support */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        ¿Necesitas Ayuda?
                    </Text>
                    
                    <View style={styles.contactInfo}>
                        <View style={styles.contactRow}>
                            <Mail size={20} color={theme.primary} />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                soporte@michicondrias.com
                            </Text>
                        </View>
                        
                        <View style={styles.contactRow}>
                            <Phone size={20} color={theme.primary} />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                +52 1 800 000 0000
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/tienda/compras' as any)}
                    >
                        <ShoppingBag size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Ver Mis Compras</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => router.push('/tienda' as any)}
                    >
                        <Home size={20} color={theme.text} />
                        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                            Seguir Comprando
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Review Request */}
                <View style={[styles.reviewCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.reviewHeader}>
                        <Star size={20} color="#f59e0b" />
                        <Text style={[styles.reviewTitle, { color: theme.text }]}>
                            Califica tu experiencia
                        </Text>
                    </View>
                    <Text style={[styles.reviewSubtitle, { color: theme.textMuted }]}>
                        Tu opinión nos ayuda a mejorar
                    </Text>
                    <TouchableOpacity
                        style={[styles.reviewButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/tienda/producto/[id]' as any)} // Necesitaría el ID del producto
                    >
                        <Text style={styles.reviewButtonText}>Dejar Reseña</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    successIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
        borderWidth: 3,
        borderColor: '#22c55e30',
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    shippingInfo: {
        gap: 12,
    },
    shippingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    shippingText: {
        fontSize: 15,
        flex: 1,
        lineHeight: 22,
    },
    contactInfo: {
        gap: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactText: {
        fontSize: 15,
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 24,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    reviewCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    reviewTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    reviewSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    reviewButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    reviewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
