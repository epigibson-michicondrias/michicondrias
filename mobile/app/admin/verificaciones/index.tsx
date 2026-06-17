import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminVerifications } from '@/src/hooks/admin';
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

export default function AdminVerificacionesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pendingUsers, isLoading, isFetching, refetch, verifyMutation, handleAction } = useAdminVerifications();

    const DocPreview = ({ url, label }: { url?: string, label: string }) => (
        <View style={styles.docItem}>
            <Text style={[styles.docLabel, { color: theme.textMuted }]}>{label}</Text>
            {url ? (
                <TouchableOpacity
                    style={[styles.docPreview, { backgroundColor: theme.background, borderColor: theme.border }]}
                    onPress={() => showAlert({ type: 'info', title: 'Documento', message: 'Aquí se abriría el visor de documentos a pantalla completa.' })}
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
        <ScreenContainer>
            <ScreenHeader
                title="Verificaciones"
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                rightElement={
                    <View style={styles.headerAction}>
                        <ShieldCheck size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                }
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
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: { 
        padding: 20, 
        paddingBottom: 100,
        paddingTop: 12 
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
