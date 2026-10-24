import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsuranceAdmin } from '@/src/hooks/insurance/useInsuranceAdmin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { InsurancePlan } from '@/src/services/insurance';
import {
    Shield,
    DollarSign,
    Plus,
    X,
    Clock,
    CheckCircle,
    CheckCircle2,
} from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function GestionScreen() {
    const { theme } = useTheme();
    const {
        plans,
        isLoadingPlans,
        refetchPlans,
        isRefetchingPlans,
        toggleActive,
        planForm,
        updatePlanField,
        allowedSpecies,
        toggleSpecies,
        showCreateForm,
        setShowCreateForm,
        handleCreatePlan,
        isCreatingPlan,
    } = useInsuranceAdmin();

    const renderPlanItem = ({ item }: { item: InsurancePlan }) => (
        <View style={[styles.planCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Shield size={22} color={theme.primary} />
                </View>
                <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.planDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                    <View style={[styles.activeBadge, { backgroundColor: item.is_active ? theme.successLight : theme.overlay }]}>
                        <CheckCircle size={12} color={item.is_active ? theme.success : theme.textMuted} />
                        <Text style={[styles.activeText, { color: item.is_active ? theme.success : theme.textMuted }]}>
                            {item.is_active ? 'Publicado' : 'Oculto'}
                        </Text>
                    </View>
                    <Switch
                        accessibilityLabel={`Publicar plan ${item.name}`}
                        value={!!item.is_active}
                        onValueChange={(v) => toggleActive(item.id, v)}
                        trackColor={{ true: theme.primary, false: theme.border }}
                    />
                </View>
            </View>

            <View style={[styles.planStats, { borderTopColor: theme.border }]}>
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.primary} />
                    <Text style={[styles.statValue, { color: theme.text }]}>
                        ${item.coverage_limit.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cobertura</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.statValue, { color: theme.text }]}>
                        ${item.base_premium}/mes
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prima</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.statValue, { color: theme.text }]}>
                        {item.min_age}-{item.max_age}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Edad</Text>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                {item.allowed_species.map((species, index) => (
                    <View key={index} style={[styles.speciesTag, { backgroundColor: theme.secondary + '15' }]}>
                        <Text style={[styles.speciesTagText, { color: theme.secondary }]}>
                            {species === 'dog' ? 'Perro' : species === 'cat' ? 'Gato' : species}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión de Planes"
                subtitle="Administra tus planes de seguro"
                actionIcon={showCreateForm ? X : Plus}
                actionLabel={showCreateForm ? 'Cerrar formulario' : 'Nuevo plan'}
                onAction={() => setShowCreateForm(!showCreateForm)}
            />

            {/* Create Plan Form */}
            {showCreateForm && (
                <ScrollView
                    style={styles.formContainer}
                    contentContainerStyle={styles.formContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.primary + '30' }]}>
                        <View style={styles.formHeader}>
                            <View style={[styles.formHeaderIcon, { backgroundColor: theme.primary + '20' }]}>
                                <Plus size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.formTitle, { color: theme.text }]}>Nuevo Plan de Seguro</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Nombre del Plan *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Ej. Plan Premium"
                                placeholderTextColor={theme.textMuted}
                                value={planForm.name}
                                onChangeText={(val) => updatePlanField('name', val)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Describe los beneficios..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                                value={planForm.description}
                                onChangeText={(val) => updatePlanField('description', val)}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Cobertura *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="$0"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={planForm.coverage_limit}
                                    onChangeText={(val) => updatePlanField('coverage_limit', val)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Prima Mensual *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="$0"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={planForm.base_premium}
                                    onChangeText={(val) => updatePlanField('base_premium', val)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Edad Mín</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={planForm.min_age}
                                    onChangeText={(val) => updatePlanField('min_age', val)}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>Edad Máx</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="20"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="numeric"
                                    value={planForm.max_age}
                                    onChangeText={(val) => updatePlanField('max_age', val)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Especies Permitidas</Text>
                            <View style={styles.speciesRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.speciesButton,
                                        {
                                            backgroundColor: allowedSpecies.includes('dog') ? theme.primary + '20' : theme.background,
                                            borderColor: allowedSpecies.includes('dog') ? theme.primary : theme.border,
                                        },
                                    ]}
                                    onPress={() => toggleSpecies('dog')}
                                >
                                    <Text style={[styles.speciesButtonText, { color: allowedSpecies.includes('dog') ? theme.primary : theme.text }]}>
                                        Perros
                                    </Text>
                                    {allowedSpecies.includes('dog') && <CheckCircle2 size={14} color={theme.primary} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.speciesButton,
                                        {
                                            backgroundColor: allowedSpecies.includes('cat') ? theme.primary + '20' : theme.background,
                                            borderColor: allowedSpecies.includes('cat') ? theme.primary : theme.border,
                                        },
                                    ]}
                                    onPress={() => toggleSpecies('cat')}
                                >
                                    <Text style={[styles.speciesButtonText, { color: allowedSpecies.includes('cat') ? theme.primary : theme.text }]}>
                                        Gatos
                                    </Text>
                                    {allowedSpecies.includes('cat') && <CheckCircle2 size={14} color={theme.primary} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.createBtn, { backgroundColor: isCreatingPlan ? theme.primary + '80' : theme.primary }]}
                            disabled={isCreatingPlan}
                            onPress={handleCreatePlan}
                        >
                            {isCreatingPlan ? (
                                <ActivityIndicator color={theme.onPrimary} />
                            ) : (
                                <Text style={styles.createBtnText}>Crear Plan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* Plans List */}
            {!showCreateForm && (
                <DataList<InsurancePlan>
                    data={plans}
                    renderItem={renderPlanItem}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoadingPlans}
                    loadingMessage="Cargando planes..."
                    onRefresh={refetchPlans}
                    isRefreshing={isRefetchingPlans}
                    emptyIcon={<Shield size={32} color={theme.textMuted} />}
                    emptyTitle="No hay planes registrados"
                    emptySubtitle="Crea tu primer plan de seguro"
                    emptyActionLabel="Crear Plan"
                    onEmptyAction={() => setShowCreateForm(true)}
                    contentStyle={styles.list}
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    formContainer: {
        flex: 1,
    },
    formContent: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    formCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: spacing.xl,
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    formHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formTitle: {
        fontSize: font.h3,
        fontWeight: '800',
    },
    inputGroup: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    label: {
        fontSize: font.base,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
    input: {
        height: 52,
        borderRadius: 14,
        paddingHorizontal: spacing.lg,
        fontSize: font.xl,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 80,
        borderRadius: 14,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: font.xl,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    speciesRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    speciesButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.sm,
    },
    speciesButtonText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    createBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    createBtnText: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    planCard: {
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing.lg,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    planIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: font.xl,
        fontWeight: '800',
        marginBottom: spacing.xxs,
    },
    planDesc: {
        fontSize: font.md,
        lineHeight: 16,
    },
    activeBadge: {
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
    planStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        marginBottom: spacing.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statValue: {
        fontSize: font.base,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: font.xs,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    speciesTagText: {
        fontSize: font.md,
        fontWeight: '600',
    },
});
