import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getKYCPresignedUrls, finalizeKYC } from '../../src/services/kyc';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, ShieldCheck, FileText, Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export default function VerificationScreen() {
    const router = useRouter();
    const { user, reloadUser } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [uploading, setUploading] = useState(false);
    const [docs, setDocs] = useState<{
        id_front: string | null;
        id_back: string | null;
        proof_of_address: string | null;
    }>({
        id_front: null,
        id_back: null,
        proof_of_address: null,
    });

    const pickDocument = async (type: keyof typeof docs) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setDocs(prev => ({ ...prev, [type]: result.assets[0].uri }));
        }
    };

    const handleUpload = async () => {
        if (!docs.id_front || !docs.id_back || !docs.proof_of_address) {
            Alert.alert("Documentos incompletos", "Por favor selecciona los 3 documentos requeridos.");
            return;
        }

        setUploading(true);
        try {
            // 1. Get presigned URLs
            const extensions = {
                id_front: docs.id_front.split('.').pop() || 'jpg',
                id_back: docs.id_back.split('.').pop() || 'jpg',
                proof_of_address: docs.proof_of_address.split('.').pop() || 'jpg',
            };

            const { urls } = await getKYCPresignedUrls(extensions);

            // 2. Upload to S3
            await Promise.all(urls.map(async (u) => {
                const uri = docs[u.key as keyof typeof docs];
                if (!uri) return;

                const response = await fetch(uri);
                const blob = await response.blob();

                const uploadRes = await fetch(u.url, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': blob.type || 'image/jpeg',
                    },
                });

                if (!uploadRes.ok) throw new Error(`Falló la subida de ${u.key}`);
            }));

            // 3. Finalize
            await finalizeKYC({
                id_front_url: urls.find(u => u.key === 'id_front')?.object_key || '',
                id_back_url: urls.find(u => u.key === 'id_back')?.object_key || '',
                proof_of_address_url: urls.find(u => u.key === 'proof_of_address')?.object_key || '',
            });

            await reloadUser();
            Alert.alert("¡Enviado!", "Tus documentos están en revisión. Te notificaremos pronto.");
        } catch (error) {
            console.error("KYC Error:", error);
            Alert.alert("Error", "Hubo un problema al subir tus documentos. Inténtalo de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const renderStatus = () => {
        const status = user?.verification_status || 'UNVERIFIED';

        const configs = {
            UNVERIFIED: { icon: ShieldCheck, color: theme.textMuted, title: 'Cuenta no verificada', desc: 'Verifica tu identidad para iniciar procesos de adopción formal.' },
            PENDING: { icon: ActivityIndicator, color: '#f59e0b', title: 'Verificación en curso', desc: 'Estamos revisando tus documentos. Esto toma de 24 a 48 horas.' },
            VERIFIED: { icon: CheckCircle2, color: '#10b981', title: 'Cuenta Verificada', desc: '¡Felicidades! Tienes acceso total a todas las funciones de Michicondrias.' },
            REJECTED: { icon: AlertCircle, color: '#ef4444', title: 'Verificación Rechazada', desc: 'Hubo un problema con tus documentos. Por favor intenta de nuevo.' },
        };

        const config = configs[status as keyof typeof configs];
        const Icon = config.icon;

        return (
            <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.statusIconBox, { backgroundColor: config.color + '15' }]}>
                    {status === 'PENDING' ? <ActivityIndicator color={config.color} /> : <Icon size={32} color={config.color} />}
                </View>
                <View style={styles.statusInfo}>
                    <Text style={[styles.statusTitle, { color: theme.text }]}>{config.title}</Text>
                    <Text style={[styles.statusDesc, { color: theme.textMuted }]}>{config.desc}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Seguridad y KYC</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Centro de verificación de identidad</Text>
                </View>

                <View style={styles.content}>
                    {renderStatus()}

                    {(user?.verification_status === 'UNVERIFIED' || user?.verification_status === 'REJECTED') && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Documentos requeridos</Text>

                            <TouchableOpacity
                                style={[styles.docCard, { backgroundColor: theme.surface }]}
                                onPress={() => pickDocument('id_front')}
                            >
                                <View style={[styles.docIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <FileText size={20} color={theme.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.docLabel, { color: theme.text }]}>Identificación Oficial (Frente)</Text>
                                    <Text style={[styles.docStatus, { color: docs.id_front ? '#10b981' : theme.textMuted }]}>
                                        {docs.id_front ? '✓ Archivo seleccionado' : 'INE, Pasaporte o Cédula'}
                                    </Text>
                                </View>
                                <Upload size={20} color={theme.textMuted} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.docCard, { backgroundColor: theme.surface }]}
                                onPress={() => pickDocument('id_back')}
                            >
                                <View style={[styles.docIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <FileText size={20} color={theme.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.docLabel, { color: theme.text }]}>Identificación Oficial (Reverso)</Text>
                                    <Text style={[styles.docStatus, { color: docs.id_back ? '#10b981' : theme.textMuted }]}>
                                        {docs.id_back ? '✓ Archivo seleccionado' : 'Parte trasera del documento'}
                                    </Text>
                                </View>
                                <Upload size={20} color={theme.textMuted} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.docCard, { backgroundColor: theme.surface }]}
                                onPress={() => pickDocument('proof_of_address')}
                            >
                                <View style={[styles.docIcon, { backgroundColor: theme.secondary + '15' }]}>
                                    <FileText size={20} color={theme.secondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.docLabel, { color: theme.text }]}>Comprobante de Domicilio</Text>
                                    <Text style={[styles.docStatus, { color: docs.proof_of_address ? '#10b981' : theme.textMuted }]}>
                                        {docs.proof_of_address ? '✓ Archivo seleccionado' : 'Luz, Agua o Teléfono (< 3 meses)'}
                                    </Text>
                                </View>
                                <Upload size={20} color={theme.textMuted} />
                            </TouchableOpacity>

                            <View style={[styles.infoBox, { backgroundColor: theme.primary + '10' }]}>
                                <Info size={18} color={theme.primary} />
                                <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                    Tus datos están protegidos y solo se utilizarán para validar tu identidad en el proceso de adopción.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                disabled={uploading}
                                onPress={handleUpload}
                            >
                                {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Enviar para revisión</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        padding: 24,
        gap: 24,
    },
    statusCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statusIconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    statusDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: -4,
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    docStatus: {
        fontSize: 11,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
