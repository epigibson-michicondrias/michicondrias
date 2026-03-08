import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions, Image, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getPendingVerifications, verifyUser } from '@/src/services/moderacion';
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
    Activity,
    Grid
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AdminVerificacionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
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
                        <ExternalLink size={18} color="#fff" />
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={[styles.docPreview, styles.docEmpty, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <ImageIcon size={28} color={theme.textMuted} strokeWidth={1} />
                    <Text style={[styles.docEmptyText, { color: theme.textMuted }]}>Pendiente</Text>
                </View>
            )}
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
                    <Activity size={10} color="#f59e0b" />
                    <Text style={[styles.statusText, { color: "#f59e0b" }]}>EN REVISIÓN</Text>
                </View>
            </View>

            <View style={styles.docsGrid}>
                <DocPreview url={item.id_front_url} label="Anverso ID" />
                <DocPreview url={item.id_back_url} label="Reverso ID" />
                <DocPreview url={item.proof_of_address_url} label="Domicilio" />
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.btnAction, styles.btnReject, { borderColor: '#ef444450' }]}
                    onPress={() => handleAction(item.id, item.full_name, 'REJECTED')}
                    disabled={verifyMutation.isPending}
                >
                    <XCircle size={18} color="#ef4444" />
                    <Text style={[styles.btnText, { color: '#ef4444' }]}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.btnAction, styles.btnApprove, { backgroundColor: theme.primary }]}
                    onPress={() => handleAction(item.id, item.full_name, 'VERIFIED')}
                    disabled={verifyMutation.isPending}
                >
                    <CheckCircle2 size={18} color="#fff" />
                    <Text style={[styles.btnText, { color: '#fff' }]}>Aprobar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Verificaciones</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Supervisión KYC</Text>
                        </View>
                    </View>
                    <View style={styles.headerAction}>
                        <ShieldCheck size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                </View>
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
    header: { 
        paddingHorizontal: 24, 
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        backgroundColor: '#10b981' 
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
    },
    list: { 
        padding: 20, 
        paddingBottom: 100,
        paddingTop: 12 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 16,
        marginTop: 100 
    },
    loadingText: { 
        fontSize: 14, 
        fontWeight: '700' 
    },
    empty: { 
        alignItems: 'center', 
        marginTop: 60, 
        paddingHorizontal: 40 
    },
    emptyTitle: { 
        fontSize: 20, 
        fontWeight: '900', 
        marginTop: 20, 
        marginBottom: 8 
    },
    emptySubtitle: { 
        fontSize: 14, 
        fontWeight: '600', 
        textAlign: 'center', 
        lineHeight: 22 
    },
    card: { 
        borderRadius: 28, 
        padding: 20, 
        marginBottom: 24, 
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14, 
        marginBottom: 20 
    },
    userIcon: { 
        width: 54, 
        height: 54, 
        borderRadius: 18, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    userInfo: { flex: 1 },
    userName: { 
        fontSize: 17, 
        fontWeight: '900' 
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 4 
    },
    userEmail: { 
        fontSize: 12, 
        fontWeight: '700' 
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: 9, 
        fontWeight: '900' 
    },
    docsGrid: { 
        flexDirection: 'row', 
        gap: 12, 
        marginBottom: 24 
    },
    docItem: { flex: 1, gap: 10 },
    docLabel: { 
        fontSize: 11, 
        fontWeight: '800', 
        textAlign: 'center' 
    },
    docPreview: { 
        height: 120, 
        borderRadius: 20, 
        borderWidth: 2, 
        overflow: 'hidden',
        elevation: 2,
    },
    docImage: { 
        width: '100%', 
        height: '100%' 
    },
    docOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.25)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    docEmpty: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 6,
        borderStyle: 'dashed',
    },
    docEmptyText: { 
        fontSize: 9, 
        fontWeight: '800' 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: 12 
    },
    btnAction: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 10, 
        height: 52, 
        borderRadius: 18 
    },
    btnReject: { 
        borderWidth: 1.5,
    },
    btnApprove: { 
        elevation: 6, 
        shadowColor: '#7c3aed', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 10 
    },
    btnText: { 
        fontSize: 14, 
        fontWeight: '900' 
    }
});
