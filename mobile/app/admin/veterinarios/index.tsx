import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminVets } from '@/src/hooks/admin/useAdminVets';
import { AdminUser } from '@/src/services/adminUsers';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { UserCheck, Mail, Briefcase, Star, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

export default function AdminVeterinariosScreen() {
    const { theme } = useTheme();
    const {
        vets,
        isLoading,
        handleViewProfile,
        handleManage,
        handleSearch,
    } = useAdminVets();

    const renderItem = ({ item }: { item: AdminUser }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={theme.heroGradient}
                    style={styles.avatarPlaceholder}
                >
                    <Text style={styles.avatarInitial}>{item.full_name?.charAt(0).toUpperCase() || 'V'}</Text>
                </LinearGradient>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.full_name}</Text>
                    <View style={styles.row}>
                        <Briefcase size={12} color={theme.textMuted} />
                        <Text style={[styles.specialty, { color: theme.textMuted }]}>{item.specialty || 'Generalista'}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#10b98115' }]}>
                    <UserCheck size={12} color={theme.success} />
                    <Text style={[styles.statusText, { color: theme.success }]}>ACTIVO</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <Mail size={14} color={theme.textMuted} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{item.email || 'Sin correo'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Star size={14} color={theme.warning} />
                    <Text style={[styles.detailText, { color: theme.text }]}>Estado: {item.is_active ? 'Activo' : 'Inactivo'}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity accessibilityRole="button" 
                    style={[styles.btn, { backgroundColor: theme.background }]}
                    onPress={handleViewProfile}
                >
                    <Text style={[styles.btnText, { color: theme.text }]}>Ver Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" 
                    style={[styles.btn, { backgroundColor: theme.primary }]}
                    onPress={handleManage}
                >
                    <Text style={[styles.btnText, { color: theme.onPrimary }]}>Gestionar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Veterinarios"
                actionIcon={Search}
                actionLabel="Buscar veterinario"
                onAction={handleSearch}
            />

            {isLoading ? (
                <SkeletonList count={4} />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={vets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <UserCheck size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay veterinarios registrados.</Text>
                        </View>
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { 
        padding: spacing.xl, 
        paddingBottom: 100,
        paddingTop: spacing.md 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 100 
    },
    empty: { 
        alignItems: 'center', 
        marginTop: 60, 
        paddingHorizontal: spacing.huge 
    },
    emptyText: { 
        fontSize: font.base, 
        fontWeight: '700', 
        marginTop: spacing.xl,
        textAlign: 'center' 
    },
    card: { 
        padding: spacing.xl, 
        borderRadius: 28, 
        marginBottom: spacing.lg, 
        borderWidth: 1.5, 
        gap: spacing.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.lg 
    },
    avatarPlaceholder: { 
        width: 60, 
        height: 60, 
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: font.h2,
        fontWeight: '800',
        color: '#fff',
    },
    info: { flex: 1 },
    name: { 
        fontSize: font.xxl, 
        fontWeight: '800' 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm, 
        marginTop: spacing.xs 
    },
    specialty: { 
        fontSize: font.base, 
        fontWeight: '700' 
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.xs, 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: font.xs, 
        fontWeight: '800' 
    },
    details: { 
        gap: spacing.md,
        paddingVertical: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: '#ffffff10',
        paddingTop: spacing.lg,
    },
    detailItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.md 
    },
    detailText: { 
        fontSize: font.base, 
        fontWeight: '700' 
    },
    actions: { 
        flexDirection: 'row', 
        gap: spacing.md, 
        marginTop: spacing.sm 
    },
    btn: { 
        flex: 1, 
        height: 48, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    btnText: { 
        fontSize: font.base, 
        fontWeight: '800' 
    }
});
