import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminClinics, type Clinic } from '@/src/hooks/admin/useAdminClinics';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { MapPin, Phone, Hospital } from 'lucide-react-native';
import { families, font, spacing, layout } from '@/constants/design';

export default function AdminClinicasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { clinics, isLoading, isFetching, refetch } = useAdminClinics();

    const renderItem = ({ item }: { item: Clinic }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                    <Hospital size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.clinicName, { color: theme.text }]}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.clinicLocation, { color: theme.textMuted }]}>{item.city}, {item.state}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardStats}>
                <View style={styles.stat}>
                    <Phone size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.text }]}>{item.phone || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.is_24_hours ? theme.success + '20' : theme.warning + '20' }]}>
                    <Text style={[styles.badgeText, { color: item.is_24_hours ? theme.success : theme.warning }]}>
                        {item.is_24_hours ? '24 HORAS' : 'HORARIO REGULAR'}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardActions}>
                <TouchableOpacity accessibilityRole="button" 
                    style={[styles.actionBtn, { backgroundColor: theme.background }]}
                    onPress={() => router.push(`/admin/clinicas/${item.id}` as any)}
                >
                    <Text style={[styles.actionBtnText, { color: theme.text }]}>Detalles</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Clínicas"
                subtitle="Red Veterinaria"
            />

            <DataList
                data={clinics}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando clínicas..."
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={<Hospital size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="No hay clínicas"
                emptySubtitle="No hay clínicas registradas."
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { 
        padding: spacing.xl, 
        paddingBottom: layout.listClearance,
        paddingTop: spacing.md 
    },
    card: { 
        padding: spacing.xl, 
        borderRadius: 28, 
        marginBottom: spacing.lg, 
        borderWidth: 1.5, 
        gap: spacing.lg,
        elevation: 4,
    },
    cardTop: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.lg 
    },
    iconBox: { 
        width: 52, 
        height: 52, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 1,
    },
    cardInfo: { flex: 1 },
    clinicName: { 
        fontSize: font.xxl, 
        fontFamily: families.extrabold 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm, 
        marginTop: spacing.xs 
    },
    clinicLocation: { 
        fontSize: font.md, 
        fontFamily: families.bold 
    },
    moreBtn: { 
        width: 36, 
        height: 36, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    cardStats: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    stat: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm 
    },
    statText: { 
        fontSize: font.base, 
        fontFamily: families.extrabold 
    },
    badge: { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderRadius: 10 
    },
    badgeText: { 
        fontSize: font.xs, 
        fontFamily: families.extrabold 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: spacing.md, 
        marginTop: spacing.xs 
    },
    actionBtn: { 
        flex: 1, 
        height: 48, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    actionBtnText: { 
        fontSize: font.base, 
        fontFamily: families.extrabold 
    }
});
