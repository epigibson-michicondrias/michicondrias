import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, View, Text } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUserPets } from '../../src/services/mascotas';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { 
  Plus, MapPin, Bone, Bell, AlertTriangle, Heart, Stethoscope, 
  ShoppingBag, ShieldCheck, UserCheck, Settings, Activity, 
  Menu as MenuIcon, ClipboardList, Building, Home, Sparkles, 
  ChevronRight, Zap, LayoutGrid 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALL_ACTIONS = [
  // Salud & Directorio (Priority)
  { title: 'Clínicas', subtitle: 'Centros cercanos', icon: Building, color: '#10b981', route: '/directorio?type=clinic', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Mi Clínica', subtitle: 'Operaciones', icon: Stethoscope, color: '#06b6d4', route: '/mi-clinica', roles: ['admin', 'veterinario'], isManagementFor: ['veterinario'] },
  { title: 'Veterinarios', subtitle: 'Busca un experto', icon: Stethoscope, color: '#0ea5e9', route: '/directorio', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Carnet', subtitle: 'Historial salud', icon: ClipboardList, color: '#3b82f6', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'], route: '/carnet' },
  { title: 'Perdidos', subtitle: 'Reportes comunes', icon: AlertTriangle, color: '#ef4444', route: '/perdidas', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },

  // Servicios & Gestión
  { title: 'Mis Tareas', subtitle: 'Agenda Paseo/Cuidado', icon: Activity, color: '#6366f1', route: '/servicios-pro/gestion', roles: ['admin', 'paseador', 'cuidador'], isManagementFor: ['paseador', 'cuidador'] },
  { title: 'Paseadores', subtitle: 'Busca paseadores', icon: UserCheck, color: '#8b5cf6', route: '/paseadores', roles: ['admin', 'consumidor'] },
  { title: 'Cuidadores', subtitle: 'Pensiones Michi', icon: Home, color: '#7c3aed', route: '/cuidadores', roles: ['admin', 'consumidor'] },
  { title: 'Petfriendly', subtitle: 'Sitios populares', icon: MapPin, color: '#14b8a6', route: '/petfriendly', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },

  // Tienda & Comunidad
  { title: 'Mi Tienda', subtitle: 'Ventas y stock', icon: ShoppingBag, color: '#10b981', route: '/tienda/vendedor', roles: ['admin', 'vendedor'], isManagementFor: ['vendedor'] },
  { title: 'Tienda', subtitle: 'Artículos Michi', icon: ShoppingBag, color: '#ec4899', route: '/tienda', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Adoptar', subtitle: 'Busca un amigo', icon: Heart, color: '#f43f5e', route: '/adopciones', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },
  { title: 'Donar', subtitle: 'Apoyo refugios', icon: Bone, color: '#f59e0b', route: '/donaciones', roles: ['admin', 'consumidor', 'vendedor', 'veterinario', 'paseador', 'cuidador'] },

  // Admin Specific Extra Tools
  { title: 'Panel Admin', subtitle: 'Gestión central', icon: ShieldCheck, color: '#7c3aed', route: '/admin', roles: ['admin'], isManagementFor: ['admin'] },
  { title: 'KYC', subtitle: 'Validar usuarios', icon: UserCheck, color: '#8b5cf6', route: '/admin/verificaciones', roles: ['admin'] },
  { title: 'Ajustes', subtitle: 'Sistema', icon: Settings, color: '#64748b', route: '/admin/config', roles: ['admin'] },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const userActions = ALL_ACTIONS
    .filter(action => action.roles.includes(user?.role_name || 'consumidor'))
    .sort((a, b) => {
      const isAManagement = a.isManagementFor?.includes(user?.role_name || '');
      const isBManagement = b.isManagementFor?.includes(user?.role_name || '');
      if (isAManagement && !isBManagement) return -1;
      if (!isAManagement && isBManagement) return 1;
      return 0;
    });

  const managementActions = userActions.filter(a => a.isManagementFor?.includes(user?.role_name || ''));
  const explorerActions = userActions.filter(a => !a.isManagementFor?.includes(user?.role_name || ''));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollViewContent, { backgroundColor: theme.background, paddingBottom: 100 }]}
      >
        {/* Premium Background Gradient */}
        <LinearGradient
          colors={[theme.primary, theme.primary + 'AA', theme.background]}
          style={styles.headerGradient}
        />

        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.menuIconBox} onPress={() => router.push('/menu' as any)}>
            <MenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topLogo}>
              <Sparkles size={16} color="#fcd34d" />
              <Text style={styles.logoText}>MICHICONDRIAS</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notificaciones' as any)}>
            <Bell size={24} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Hero Welcome Card (Glassmorphism) */}
        <View style={styles.heroContainer}>
            <View style={styles.glassCard}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.welcomeRow}>
                    <View style={styles.profileMasterInfo}>
                        <Text style={styles.welcomeLabel}>BIENVENIDO DE VUELTA</Text>
                        <Text style={styles.profileName}>{user?.full_name?.split(' ')[0] || 'Michilover'}</Text>
                    </View>
                    <View style={styles.avatarMasterContainer}>
                        <LinearGradient
                            colors={['#fcd34d', '#f59e0b']}
                            style={styles.avatarBorder}
                        >
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarText}>
                                    {user?.full_name?.charAt(0)?.toUpperCase() || 'M'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.statsStrip}>
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>{pets.length}</Text>
                        <Text style={styles.statLab}>Mascotas</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>3</Text>
                        <Text style={styles.statLab}>Citas</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>PRO</Text>
                        <Text style={styles.statLab}>Nivel</Text>
                    </View>
                </View>
            </View>
        </View>

        {/* My Pets Horizontal (Premium) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
                <Bone size={20} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tus Mejores Amigos</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/mascotas')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingPets}>
              <Activity size={32} color={theme.primary} />
            </View>
          ) : pets.length === 0 ? (
            <TouchableOpacity style={[styles.addPetEmpty, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push('/mascotas/nuevo')}>
              <Plus size={32} color={theme.textMuted} />
              <Text style={styles.addPetText}>Empezar mi familia michi</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petsList}
            >
              <TouchableOpacity 
                style={[styles.addPetCircular, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push('/mascotas/nuevo')}
              >
                <Plus size={24} color={theme.primary} />
              </TouchableOpacity>
              
              {pets.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.petHeroCard} 
                    onPress={() => router.push(`/mascotas/${item.id}` as any)}
                >
                  <Image
                    source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }}
                    style={styles.petHeroImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.petCardOverlay}
                  />
                  <View style={styles.petInfoFloating}>
                    <Text style={styles.petNameHero}>{item.name}</Text>
                    <View style={styles.petTag}>
                        <Text style={styles.petTagText}>{item.species}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Management Quick Access (Role Based) */}
        {managementActions.length > 0 && (
            <View style={[styles.section, { backgroundColor: 'transparent' }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.titleWithIcon}>
                        <Zap size={20} color="#f59e0b" />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestión Profesional</Text>
                    </View>
                </View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.mgmtList}
                >
                    {managementActions.map((action, index) => {
                        const Icon = action.icon;
                        const displayTitle = (user?.role_name === 'veterinario' && action.route === '/mi-clinica') 
                            ? 'Consultorio' 
                            : action.title;
                        
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                style={[styles.mgmtCard, { backgroundColor: action.color + 'CC' }]} // More glass-like
                                onPress={() => router.push(action.route as any)}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.3)', 'transparent']}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <Icon size={24} color="#fff" />
                                <View style={{ backgroundColor: 'transparent' }}>
                                    <Text style={styles.mgmtTitle}>{displayTitle}</Text>
                                    <Text style={styles.mgmtSub}>{action.subtitle}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        )}

        {/* General Explorer Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <View style={styles.titleWithIcon}>
                <LayoutGrid size={20} color={theme.textMuted} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Explorar Comunidad</Text>
            </View>
          </View>
          <View style={styles.explorerGrid}>
            {explorerActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.explorerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => router.push(action.route as any)}
                >
                  <View style={[styles.explorerIconBox, { backgroundColor: action.color + '15' }]}>
                    <Icon size={22} color={action.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.explorerTitle, { color: theme.text }]}>{action.title}</Text>
                    <Text style={[styles.explorerSub, { color: theme.textMuted }]} numberOfLines={1}>{action.subtitle}</Text>
                  </View>
                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Promotional / Featured Banner */}
        <View style={styles.featuredSection}>
            <TouchableOpacity style={styles.featuredBanner} activeOpacity={0.9}>
                <LinearGradient
                    colors={['#ec4899', '#f43f5e']}
                    style={styles.featuredGradient}
                    start={{x:0, y:0}}
                    end={{x:1, y:1}}
                />
                <View style={styles.featuredContent}>
                    <View style={styles.featuredTextCol}>
                        <Text style={styles.featuredTag}>NUEVO EN TIENDA</Text>
                        <Text style={styles.featuredTitle}>Michi Box Premium</Text>
                        <Text style={styles.featuredDesc}>Suscripción mensual de juguetes y snacks</Text>
                    </View>
                    <ShoppingBag size={48} color="rgba(255,255,255,0.3)" />
                </View>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewContent: { flexGrow: 1 }, // Added to ensure ScrollView content expands
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480, // Increased to fully cover hero section
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topLogo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative'
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: '#7c3aed',
    borderRadius: 4,
    backgroundColor: '#fb7185',
  },
  heroContainer: {
    paddingHorizontal: 24,
    marginTop: 30,
  },
  glassCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden', // Added for internal gradient
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'transparent' },
  profileMasterInfo: { flex: 1, backgroundColor: 'transparent' },
  welcomeLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  profileName: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2 },
  avatarMasterContainer: { width: 66, height: 66 },
  avatarBorder: { padding: 3, borderRadius: 24, ...StyleSheet.absoluteFillObject },
  avatarInner: { flex: 1, borderRadius: 21, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#7c3aed' },
  statsStrip: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  statMini: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLab: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  section: { marginTop: 32 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    marginBottom: 16
  },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  seeAll: { fontSize: 14, fontWeight: '700' },
  petsList: { paddingLeft: 24, paddingRight: 24, gap: 16 },
  addPetCircular: { 
    width: 60, 
    height: 180, 
    borderRadius: 30, 
    borderWidth: 1.5, 
    borderStyle: 'dashed',
    justifyContent: 'center', 
    alignItems: 'center'
  },
  petHeroCard: { 
    width: 140, 
    height: 180, 
    borderRadius: 32, 
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  petHeroImage: { ...StyleSheet.absoluteFillObject },
  petCardOverlay: { ...StyleSheet.absoluteFillObject },
  petInfoFloating: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 16 
  },
  petNameHero: { fontSize: 16, fontWeight: '900', color: '#fff' },
  petTag: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 6, 
    alignSelf: 'flex-start', 
    marginTop: 4 
  },
  petTagText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  mgmtList: { paddingLeft: 24, paddingRight: 24, gap: 12 },
  mgmtCard: { 
    width: 160, 
    padding: 20, 
    borderRadius: 28, 
    gap: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden'
  },
  mgmtTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  mgmtSub: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  explorerGrid: { paddingHorizontal: 24, gap: 12 },
  explorerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 22, 
    borderWidth: 1, 
    gap: 14 
  },
  explorerIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  explorerTitle: { fontSize: 15, fontWeight: '800' },
  explorerSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  featuredSection: { paddingHorizontal: 24, marginTop: 32 },
  featuredBanner: { 
    height: 120, 
    borderRadius: 32, 
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  featuredGradient: { ...StyleSheet.absoluteFillObject },
  featuredContent: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 24, 
    justifyContent: 'space-between' 
  },
  featuredTextCol: { flex: 1 },
  featuredTag: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  featuredTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 2 },
  featuredDesc: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  loadingPets: { height: 180, justifyContent: 'center', alignItems: 'center' },
  addPetEmpty: { 
    marginHorizontal: 24, 
    height: 180, 
    borderRadius: 32, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12 
  },
  addPetText: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
});
