import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVerifications, verifyUser } from '@/src/services/moderacion';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
    ShieldCheck,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    MapPin,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    Activity
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AdminVerificacionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const { data: pendingUsers = [], isLoading } = useQuery({
        queryKey: ['pending-verifications'],
        queryFn: getPendingVerifications,
    });

    const verifyMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string, status: 'VERIFIED' | 'REJECTED' }) => verifyUser(userId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
            Alert.alert("Éxito", `El usuario ha sido ${variables.status === 'VERIFIED' ? 'verificado' : 'rechazado'} correctamente.`);
        },
        onError: () => Alert.alert("Error", "No se pudo procesar la verificación."),
    });

    const handleAction = (userId: string, name: string, status: 'VERIFIED' | 'REJECTED') => {
        Alert.alert(
            status === 'VERIFIED' ? "Aprobar Identidad" : "Rechazar Identidad",
            `¿Estás seguro de ${status === 'VERIFIED' ? 'APROBAR' : 'RECHAZAR'} la identidad de ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: status === 'VERIFIED' ? "Aprobar" : "Rechazar",
                    style: status === 'VERIFIED' ? "default" : "destructive",
                    onPress: () => verifyMutation.mutate({ userId, status })
                }
            ]
        );
    };

    const DocPreview = ({ url, label }: { url?: string, label: string }) => (
        <View style={styles.docItem}>
            <Text style={[styles.docLabel, { color: theme.textMuted }]}>{label}</Text>
            {url ? (
                <TouchableOpacity
                    style={[styles.docPreview, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => Alert.alert("Documento", "Aquí se abriría el visor de documentos a pantalla completa.")}
                >
                    <Image source={{ uri: url }} style={styles.docImage} resizeMode="cover" />
                    <View style={styles.docOverlay}>
                        <ExternalLink size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={[styles.docPreview, styles.docEmpty, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <ImageIcon size={32} color={theme.textMuted} strokeWidth={1} />
                    <Text style={[styles.docEmptyText, { color: theme.textMuted }]}>Sin documento</Text>
                </View>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.userIcon, { backgroundColor: theme.primary + '15' }]}>
                    <User size={24} color={theme.primary} />
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.full_name || "Usuario sin nombre"}</Text>
                    <View style={styles.infoRow}>
                        <Mail size={12} color={theme.textMuted} />
                        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.email}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#f59e0b20' }]}>
                    <Activity size={12} color="#f59e0b" />
                    <Text style={[styles.statusText, { color: "#f59e0b" }]}>PENDIENTE</Text>
                </View>
            </View>

            <View style={styles.docsGrid}>
                <DocPreview url={item.id_front_url} label="Anverso ID" />
                <DocPreview url={item.id_back_url} label="Reverso ID" />
                <DocPreview url={item.proof_of_address_url} label="Domicilio" />
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.btnAction, styles.btnReject, { borderColor: '#ef4444' }]}
                    onPress={() => handleAction(item.id, item.full_name, 'REJECTED')}
                    disabled={verifyMutation.isPending}
                >
                    <XCircle size={18} color="#ef4444" />
                    <Text style={[styles.btnText, { color: '#ef4444' }]}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btnAction, styles.btnApprove, { backgroundColor: theme.primary }]}
                    onPress={() => handleAction(item.id, item.full_name, 'VERIFIED')}
                    disabled={verifyMutation.isPending}
                >
                    <CheckCircle2 size={18} color="#fff" />
                    <Text style={[styles.btnText, { color: '#fff' }]}>Aprobar Identidad</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient colors={[theme.primary + '20', 'transparent']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <ShieldCheck size={28} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Revisión KYC</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Valida la identidad de los adoptantes para garantizar la seguridad.</Text>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando verificaciones...</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingUsers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <ShieldCheck size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>¡Felicidades!</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>No hay verificaciones de identidad pendientes en este momento.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '900' },
    subtitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    list: { padding: 24, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { fontSize: 14, fontWeight: '600' },
    empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
    card: { borderRadius: 28, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    userIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    userInfo: { flex: 1 },
    userName: { fontSize: 17, fontWeight: '800' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    userEmail: { fontSize: 12, fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 9, fontWeight: '900' },
    docsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    docItem: { flex: 1, gap: 8 },
    docLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
    docPreview: { height: 100, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    docImage: { width: '100%', height: '100%' },
    docOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    docEmpty: { justifyContent: 'center', alignItems: 'center', gap: 4 },
    docEmptyText: { fontSize: 8, fontWeight: '700' },
    cardActions: { flexDirection: 'row', gap: 12 },
    btnAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 16 },
    btnReject: { borderWidth: 1 },
    btnApprove: { elevation: 4, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    btnText: { fontSize: 13, fontWeight: '800' }
});
