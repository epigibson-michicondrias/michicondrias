import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsurancePlans } from '@/src/hooks/insurance';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { useAuth } from '@/src/contexts/AuthContext';
import { InsurancePlan } from '@/src/services/insurance';
import { Shield, Clock, DollarSign, ChevronRight, Plus, CheckCircle } from 'lucide-react-native';

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
                <TouchableOpacity style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.planStats}>
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.coverage_limit.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cobertura</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.base_premium.toLocaleString()}/mes
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prima</Text>
                </View>
                <View style={styles.statDivider} />
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
                            {species === 'dog' ? '🐕 Perro' : species === 'cat' ? '🐈 Gato' : species}
                        </Text>
                    </View>
                ))}
                {item.is_active && (
                    <View style={[styles.activeTag, { backgroundColor: '#10b98115' }]}>
                        <CheckCircle size={12} color="#10b981" />
                        <Text style={[styles.activeText, { color: '#10b981' }]}>Activo</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🛡️ Aseguradoras"
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
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    planCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
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
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    planDesc: {
        fontSize: 13,
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
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    speciesTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    speciesText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    activeText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
