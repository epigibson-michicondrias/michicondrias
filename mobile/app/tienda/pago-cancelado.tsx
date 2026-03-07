import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { XCircle, Home, ShoppingBag, RefreshCw, AlertTriangle, Mail, Phone, CreditCard } from 'lucide-react-native';

export default function PagoCanceladoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const params = useLocalSearchParams();

    const orderId = params.orderId as string;
    const reason = params.reason as string;
    const productName = params.productName as string;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {/* Error Icon */}
                <View style={[styles.errorIconContainer, { backgroundColor: '#ef444415' }]}>
                    <XCircle size={80} color="#ef4444" />
                </View>

                {/* Error Message */}
                <View style={styles.messageContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        Pago Cancelado
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Tu pago no pudo ser procesado
                    </Text>
                </View>

                {/* Cancellation Reason */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={styles.cardHeader}>
                        <AlertTriangle size={20} color="#ef4444" />
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                            Motivo de la Cancelación
                        </Text>
                    </View>
                    
                    <Text style={[styles.reasonText, { color: theme.text }]}>
                        {reason || 'El pago fue cancelado o no pudo completarse. Por favor, intenta nuevamente.'}
                    </Text>
                </View>

                {/* Order Details */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Detalles del Intento
                    </Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Referencia
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
                            Fecha y Hora
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                            {new Date().toLocaleString()}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
                            Estado
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#ef444420' }]}>
                            <Text style={[styles.statusText, { color: '#ef4444' }]}>
                                Cancelado
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Troubleshooting */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Soluciones Comunes
                    </Text>
                    
                    <View style={styles.troubleshootingList}>
                        <View style={styles.troubleshootingItem}>
                            <CreditCard size={16} color={theme.primary} />
                            <Text style={[styles.troubleshootingText, { color: theme.text }]}>
                                Verifica que tu tarjeta tenga fondos disponibles
                            </Text>
                        </View>
                        
                        <View style={styles.troubleshootingItem}>
                            <RefreshCw size={16} color={theme.primary} />
                            <Text style={[styles.troubleshootingText, { color: theme.text }]}>
                                Intenta con otro método de pago
                            </Text>
                        </View>
                        
                        <View style={styles.troubleshootingItem}>
                            <AlertTriangle size={16} color={theme.primary} />
                            <Text style={[styles.troubleshootingText, { color: theme.text }]}>
                                Verifica que los datos de la tarjeta sean correctos
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
                            <View style={styles.contactDetails}>
                                <Text style={[styles.contactLabel, { color: theme.text }]}>
                                    Correo Electrónico
                                </Text>
                                <Text style={[styles.contactValue, { color: theme.primary }]}>
                                    soporte@michicondrias.com
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.contactRow}>
                            <Phone size={20} color={theme.primary} />
                            <View style={styles.contactDetails}>
                                <Text style={[styles.contactLabel, { color: theme.text }]}>
                                    Teléfono
                                </Text>
                                <Text style={[styles.contactValue, { color: theme.primary }]}>
                                    +52 1 800 000 0000
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/tienda/producto/[id]' as any)} // Necesitaría el ID del producto
                    >
                        <RefreshCw size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Reintentar Pago</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => router.push('/tienda' as any)}
                    >
                        <Home size={20} color={theme.text} />
                        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                            Seguir Explorando
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Security Notice */}
                <View style={[styles.securityCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.securityHeader}>
                        <AlertTriangle size={16} color="#f59e0b" />
                        <Text style={[styles.securityTitle, { color: theme.text }]}>
                            Seguridad de tu Pago
                        </Text>
                    </View>
                    <Text style={[styles.securityText, { color: theme.textMuted }]}>
                        Tu información de pago es segura. No se ha realizado ningún cargo a tu tarjeta. 
                        Puedes intentar realizar la compra nuevamente cuando estés listo.
                    </Text>
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
    errorIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
        borderWidth: 3,
        borderColor: '#ef444430',
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    reasonText: {
        fontSize: 16,
        lineHeight: 24,
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
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    troubleshootingList: {
        gap: 12,
    },
    troubleshootingItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    troubleshootingText: {
        fontSize: 15,
        flex: 1,
        lineHeight: 22,
    },
    contactInfo: {
        gap: 16,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactDetails: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '600',
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
    securityCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    securityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    securityTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    securityText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
