import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminClinics, Clinic } from '@/src/hooks/admin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { Plus, MapPin, Phone, Hospital, MoreVertical } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

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
                <TouchableOpacity style={styles.moreBtn}>
                    <MoreVertical size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardStats}>
                <View style={styles.stat}>
                    <Phone size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.text }]}>{item.phone || 'N/A'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.is_24_hours ? '#10b98120' : '#f59e0b20' }]}>
                    <Text style={[styles.badgeText, { color: item.is_24_hours ? '#10b981' : '#f59e0b' }]}>
                        {item.is_24_hours ? '24 HORAS' : 'HORARIO REGULAR'}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardActions}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.background }]}
                    onPress={() => router.push(`/admin/clinicas/${item.id}` as any)}
                >
                    <Text style={[styles.actionBtnText, { color: theme.text }]}>Detalles</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => showAlert({ type: 'info', title: 'Gestión', message: 'Módulo de edición de clínica en desarrollo.' })}
                >
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Gestionar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Clínicas"
                subtitle="Red Veterinaria"
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                actionIcon={Plus}
                onAction={() => showAlert({ type: 'info', title: 'Nueva Clínica', message: 'Abre el formulario de registro' })}
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
        padding: 20, 
        paddingBottom: 100,
        paddingTop: 12 
    },
    card: { 
        padding: 20, 
        borderRadius: 28, 
        marginBottom: 16, 
        borderWidth: 1.5, 
        gap: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardTop: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 16 
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
        fontSize: 17, 
        fontWeight: '900' 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 4 
    },
    clinicLocation: { 
        fontSize: 12, 
        fontWeight: '700' 
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
        gap: 8 
    },
    statText: { 
        fontSize: 13, 
        fontWeight: '800' 
    },
    badge: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 10 
    },
    badgeText: { 
        fontSize: 9, 
        fontWeight: '900' 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: 12, 
        marginTop: 4 
    },
    actionBtn: { 
        flex: 1, 
        height: 48, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    actionBtnText: { 
        fontSize: 14, 
        fontWeight: '900' 
    }
});
