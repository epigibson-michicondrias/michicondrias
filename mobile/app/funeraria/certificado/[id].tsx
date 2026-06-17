import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useDeathReport } from '@/src/hooks/funerary/useDeathReport';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { FileText, Download, Calendar, Heart, Shield } from 'lucide-react-native';

export default function CertificadoScreen() {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { certificate, isLoadingCertificate } = useDeathReport(id);

    const handleDownload = () => {
        if (certificate?.certificate_url) {
            Linking.openURL(certificate.certificate_url);
        } else if (certificate?.url) {
            Linking.openURL(certificate.url);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoadingCertificate) {
        return (
            <ScreenContainer>
                <ScreenHeader title="📜 Certificado" />
                <LoadingOverlay message="Cargando certificado..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📜 Certificado"
                subtitle="Certificado de defunción"
                gradient={['#1e1b4b', '#312e81', '#4338ca']}
            />

            <View style={styles.content}>
                {/* Certificate card */}
                <View style={[styles.certificateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    {/* Header emblem */}
                    <View style={[styles.emblem, { backgroundColor: theme.secondary + '15' }]}>
                        <Shield size={32} color={theme.secondary} />
                    </View>

                    <Text style={[styles.certificateTitle, { color: theme.text }]}>
                        Certificado de Defunción
                    </Text>
                    <Text style={[styles.certificateSubtitle, { color: theme.textMuted }]}>
                        Documento oficial
                    </Text>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Details */}
                    <View style={styles.detailsSection}>
                        {certificate?.pet_id && (
                            <View style={styles.detailRow}>
                                <Heart size={16} color={theme.secondary} />
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Mascota</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {certificate.pet_id}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {certificate?.date_of_death && (
                            <View style={styles.detailRow}>
                                <Calendar size={16} color={theme.secondary} />
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Fecha de Defunción</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {formatDate(certificate.date_of_death)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {certificate?.cause_of_death && (
                            <View style={styles.detailRow}>
                                <FileText size={16} color={theme.secondary} />
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Causa</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {certificate.cause_of_death}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {certificate?.cremation_type && (
                            <View style={styles.detailRow}>
                                <Heart size={16} color={theme.secondary} />
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Tipo de Cremación</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {certificate.cremation_type}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {certificate?.id && (
                            <View style={styles.detailRow}>
                                <Shield size={16} color={theme.secondary} />
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Folio</Text>
                                    <Text style={[styles.detailValue, { color: theme.text }]}>
                                        {certificate.id}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Download button */}
                <TouchableOpacity
                    style={[styles.downloadBtn, { backgroundColor: theme.primary }]}
                    onPress={handleDownload}
                >
                    <Download size={22} color="#fff" />
                    <Text style={styles.downloadBtnText}>Descargar Certificado PDF</Text>
                </TouchableOpacity>

                <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
                    Este documento se descarga como PDF desde el servidor. Guárdalo en un lugar seguro.
                </Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 24,
    },
    certificateCard: {
        padding: 28,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 24,
    },
    emblem: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    certificateTitle: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
    },
    certificateSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 20,
    },
    detailsSection: {
        width: '100%',
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    downloadBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    downloadBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
