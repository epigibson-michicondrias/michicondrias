import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { adminUsersService, AdminUser } from '@/src/services/adminUsers';
import { ROLE_IDS } from '@/src/constants/roles';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, UserCheck, Mail, Briefcase, Star, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminVeterinariosScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-vets-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    const vets = users.filter(u => u.role_id === ROLE_IDS.VETERINARIO);

    const renderItem = ({ item }: { item: AdminUser }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <LinearGradient
                    colors={[theme.primary, theme.primary + 'DD']}
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
                    <UserCheck size={12} color="#10b981" />
                    <Text style={[styles.statusText, { color: '#10b981' }]}>ACTIVO</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailItem}>
                    <Mail size={14} color={theme.textMuted} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{item.email || 'Sin correo'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Star size={14} color="#f59e0b" />
                    <Text style={[styles.detailText, { color: theme.text }]}>Estado: {item.is_active ? 'Activo' : 'Inactivo'}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: theme.background }]}
                    onPress={() => Alert.alert("Perfil", "Ver perfil profesional")}
                >
                    <Text style={[styles.btnText, { color: theme.text }]}>Ver Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: theme.primary }]}
                    onPress={() => Alert.alert("Editar", "Editar datos profesionales")}
                >
                    <Text style={[styles.btnText, { color: '#fff' }]}>Gestionar</Text>
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
                        <Text style={styles.title}>Veterinarios</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Directorio Profesional</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => Alert.alert("Buscar", "Buscar veterinarios")}
                    >
                        <Search size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
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
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14 
    },
    avatarPlaceholder: { 
        width: 60, 
        height: 60, 
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    info: { flex: 1 },
    name: { 
        fontSize: 17, 
        fontWeight: '900' 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 4 
    },
    specialty: { 
        fontSize: 13, 
        fontWeight: '700' 
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: 9, 
        fontWeight: '900' 
    },
    details: { 
        gap: 10,
        paddingVertical: 4,
        borderTopWidth: 1,
        borderTopColor: '#ffffff10',
        paddingTop: 16,
    },
    detailItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10 
    },
    detailText: { 
        fontSize: 13, 
        fontWeight: '700' 
    },
    actions: { 
        flexDirection: 'row', 
        gap: 12, 
        marginTop: 8 
    },
    btn: { 
        flex: 1, 
        height: 48, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    btnText: { 
        fontSize: 14, 
        fontWeight: '900' 
    }
});
