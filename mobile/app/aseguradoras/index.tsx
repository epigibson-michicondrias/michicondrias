import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsurancePlans } from '@/src/hooks/insurance/useInsurancePlans';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { useAuth } from '@/src/contexts/AuthContext';
import { InsurancePlan } from '@/src/services/insurance';
import { Shield, Clock, DollarSign, ChevronRight, Plus, CheckCircle } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function AseguradorasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { plans, isLoading, refetch, isRefetching } = useInsurancePlans();

    const roleName = user?.role_name || '';
    const isInsurer = roleName === 'aseguradora' || roleName === 'admin';

    const renderPlanItem = ({ item }: { item: InsurancePlan }) => (
        <TouchableOpacity
            style={[styles.planCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/aseguradoras/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.planHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Shield size={24} color={theme.primary} />
                </View>
                <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.planDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </View>
            </View>

            <View style={[styles.planStats, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.coverage_limit.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cobertura</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.base_premium.toLocaleString()}/mes
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prima</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        {item.min_age}-{item.max_age} años
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Edad</Text>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                {item.allowed_species.map((species, index) => (
                    <View key={index} style={[styles.speciesTag, { backgroundColor: theme.secondary + '15' }]}>
                        <Text style={[styles.speciesText, { color: theme.secondary }]}>
                            {species === 'dog' ? 'Perro' : species === 'cat' ? 'Gato' : species}
                        </Text>
                    </View>
                ))}
                {item.is_active && (
                    <View style={[styles.activeTag, { backgroundColor: theme.successLight }]}>
                        <CheckCircle size={12} color={theme.success} />
                        <Text style={[styles.activeText, { color: theme.success }]}>Activo</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Aseguradoras"
                subtitle="Protege a tu mascota con el mejor seguro"
            />

            <View style={styles.actionButtons}>
                {isInsurer ? (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/aseguradoras/nuevo' as any)}
                    >
                        <Plus size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nuevo Plan</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                        onPress={() => router.push('/aseguradoras/mis-polizas' as any)}
                    >
                        <Shield size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mis Pólizas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <DataList<InsurancePlan>
                data={plans}
                renderItem={renderPlanItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando planes..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Shield size={32} color={theme.textMuted} />}
                emptyTitle="No hay planes de seguro disponibles"
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        gap: spacing.sm,
    },
    actionButtonText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    planCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: font.xxl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    planDesc: {
        fontSize: font.base,
        lineHeight: 18,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: spacing.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statText: {
        fontSize: font.xl,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: font.sm,
        marginTop: spacing.xxs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    speciesTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    speciesText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    activeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        gap: spacing.xs,
    },
    activeText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
});
