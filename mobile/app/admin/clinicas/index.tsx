import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinics, Clinic } from '@/src/services/directorio';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, MapPin, Phone, Hospital, Star, MoreVertical } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminClinicasScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: clinics = [], isLoading } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: getClinics,
    });

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
                    onPress={() => Alert.alert("Gestión", "Módulo de edición de clínica en desarrollo.")}
                >
                    <Text style={[styles.actionBtnText, { color: '#fff' }]}>Gestionar</Text>
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
                        <Text style={styles.title}>Clínicas</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Red Veterinaria</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => Alert.alert("Nueva Clínica", "Abre el formulario de registro")}
                    >
                        <Plus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={clinics}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Hospital size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay clínicas registradas.</Text>
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
        borderRadius: 14,
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
        marginTop: 100 
    },
    empty: { 
        alignItems: 'center', 
        marginTop: 60, 
        paddingHorizontal: 40 
    },
    emptyText: { 
        fontSize: 14, 
        fontWeight: '700', 
        marginTop: 20,
        textAlign: 'center' 
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
