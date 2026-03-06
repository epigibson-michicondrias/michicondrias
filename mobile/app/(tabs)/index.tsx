import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '../../src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUserPets, Pet } from '../../src/services/mascotas';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Plus, MapPin, Bone, Bell, AlertTriangle, Heart, Stethoscope, ShoppingBag, ShieldCheck, UserCheck, Settings, Activity, Menu as MenuIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme];

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user?.full_name?.split(' ')[0] || 'Michilover'}! 👋</Text>
            <Text style={styles.subtitle}>¿Qué haremos hoy por tus michis?</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/menu' as any)}>
              <MenuIcon size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn}>
              <Bell size={24} color={theme.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus Mascotas</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.tint }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingPets}>
            <Text style={{ color: theme.textMuted }}>Cargando tus mejores amigos...</Text>
          </View>
        ) : pets.length === 0 ? (
          <TouchableOpacity style={styles.addPetEmpty}>
            <Plus size={32} color={theme.textMuted} />
            <Text style={styles.addPetText}>Agrega a tu primer mascota</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={pets}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.petCard}>
                <Image
                  source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }}
                  style={styles.petImage}
                />
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petBreed}>{item.breed || item.species}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.petsList}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.grid}>
          {ALL_ACTIONS.filter(action => action.roles.includes(user?.role_name || 'consumidor')).map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderColor: action.color + '33' }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: action.color }]}>
                <action.icon size={28} color="#f8fafc" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle} numberOfLines={1}>{action.title}</Text>
                <Text style={styles.actionSubtitle} numberOfLines={1}>{action.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const ALL_ACTIONS = [
  { title: 'Adoptar', subtitle: 'Busca un amigo', icon: Heart, color: '#7c3aed', route: '/adopciones', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Tienda', subtitle: 'Para tu michi', icon: ShoppingBag, color: '#ec4899', route: '/tienda', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Perdidos', subtitle: 'Apoyo común', icon: AlertTriangle, color: '#ef4444', route: '/perdidas', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Carnet', subtitle: 'Historial médico', icon: Stethoscope, color: '#3b82f6', route: '/carnet', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Donar', subtitle: 'Ayuda refugios', icon: Heart, color: '#f59e0b', route: '/donaciones', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Petfriendly', subtitle: 'Lugares top', icon: MapPin, color: '#22c55e', route: '/petfriendly', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },

  // Professional / Partner Actions
  { title: 'Directorio', subtitle: 'Gestión Médica', icon: Stethoscope, color: '#06b6d4', route: '/directorio/nuevo', roles: ['admin', 'veterinario'] },
  { title: 'Servicios Pro', subtitle: 'Mis servicios', icon: UserCheck, color: '#7c3aed', route: '/servicios-pro', roles: ['admin', 'paseador', 'cuidador'] },

  // Admin Actions
  { title: 'Verificaciones', subtitle: 'Validar KYC', icon: ShieldCheck, color: '#8b5cf6', route: '/admin/verificaciones', roles: ['admin'] },
  { title: 'Métricas', subtitle: 'Analytics', icon: Activity, color: '#3b82f6', route: '/admin/stats', roles: ['admin'] },
  { title: 'Config', subtitle: 'Sistema', icon: Settings, color: '#64748b', route: '/admin/config', roles: ['admin'] },
];

function QuickAction({ title, subtitle, icon, color }: { title: string, subtitle: string, icon: any, color: string }) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        {icon}
      </View>
      <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  section: {
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 1, // Fix for text cut off on some devices
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingPets: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addPetEmpty: {
    marginHorizontal: 24,
    height: 160,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addPetText: {
    marginTop: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  petsList: {
    paddingLeft: 24,
  },
  petCard: {
    width: 140,
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  petImage: {
    width: 140,
    height: 160,
    borderRadius: 24,
    marginBottom: 10,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
  },
  petBreed: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: 24,
    marginTop: 16,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  }
});
