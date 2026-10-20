import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminVerifications } from '@/src/hooks/admin/useAdminVerifications';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import {
    ShieldCheck,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    ExternalLink,
    Image as ImageIcon,
    Activity,
} from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { font, spacing } from '@/constants/design';

export default function AdminVerificacionesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pendingUsers, isLoading, isFetching, refetch, verifyMutation, handleAction } = useAdminVerifications();

    const DocPreview = ({ url, label }: { url?: string, label: string }) => (
        <View style={styles.docItem}>
            <Text style={[styles.docLabel, { color: theme.textMuted }]}>{label}</Text>
            {url ? (
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.docPreview, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => Linking.openURL(url).catch(() => showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El enlace del documento venció o no es válido. Recarga la lista.' }))}
                    accessibilityLabel="Abrir documento"
                >
                    <Image source={{ uri: url }} style={styles.docImage} resizeMode="cover" />
                    <View style={styles.docOverlay}>
                        <ExternalLink size={18} color={theme.onHero} />
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
                    <Activity size={10} color={theme.warning} />
                    <Text style={[styles.statusText, { color: theme.warning }]}>EN REVISIÓN</Text>
                </View>
            </View>

            <View style={styles.docsGrid}>
                <DocPreview url={item.id_front_url} label="Anverso ID" />
                <DocPreview url={item.id_back_url} label="Reverso ID" />
                <DocPreview url={item.proof_of_address_url} label="Domicilio" />
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity accessibilityRole="button"
                    activeOpacity={0.7}
                    style={[styles.btnAction, styles.btnReject, { borderColor: theme.error + '50' }]}
                    onPress={() => handleAction(item.id, item.full_name, 'REJECTED')}
                    disabled={verifyMutation.isPending}
                >
                    <XCircle size={18} color={theme.error} />
                    <Text style={[styles.btnText, { color: theme.error }]}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                    activeOpacity={0.7}
                    style={[styles.btnAction, styles.btnApprove, { backgroundColor: theme.primary }]}
                    onPress={() => handleAction(item.id, item.full_name, 'VERIFIED')}
                    disabled={verifyMutation.isPending}
                >
                    <CheckCircle2 size={18} color={theme.onPrimary} />
                    <Text style={[styles.btnText, { color: theme.onPrimary }]}>Aprobar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Verificaciones"
            />

            <DataList
                data={pendingUsers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando verificaciones..."
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={<ShieldCheck size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="¡Felicidades!"
                emptySubtitle="No hay verificaciones de identidad pendientes en este momento."
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { 
        padding: spacing.xl, 
        paddingBottom: 100,
        paddingTop: spacing.md 
    },
    card: { 
        borderRadius: 28, 
        padding: spacing.xl, 
        marginBottom: spacing.xxl, 
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
        gap: spacing.lg, 
        marginBottom: spacing.xl 
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
        fontSize: font.xxl, 
        fontWeight: '800' 
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm, 
        marginTop: spacing.xs 
    },
    userEmail: { 
        fontSize: font.md, 
        fontWeight: '700' 
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.xs, 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.xs, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: font.xs, 
        fontWeight: '800' 
    },
    docsGrid: { 
        flexDirection: 'row', 
        gap: spacing.md, 
        marginBottom: spacing.xxl 
    },
    docItem: { flex: 1, gap: spacing.md },
    docLabel: { 
        fontSize: font.sm, 
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
        gap: spacing.sm,
        borderStyle: 'dashed',
    },
    docEmptyText: { 
        fontSize: font.xs, 
        fontWeight: '800' 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: spacing.md 
    },
    btnAction: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: spacing.md, 
        height: 52, 
        borderRadius: 18 
    },
    btnReject: { 
        borderWidth: 1.5,
    },
    btnApprove: { 
        elevation: 6, 
        shadowColor: '#8b5cf6', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 10 
    },
    btnText: { 
        fontSize: font.base, 
        fontWeight: '800' 
    }
});
