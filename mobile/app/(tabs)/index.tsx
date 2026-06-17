import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useHome, STATUS_COLORS, STATUS_LABELS, formatDate } from '@/src/hooks/home/useHome';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import {
  Plus, Bell, Bone, Stethoscope, ShoppingBag, AlertTriangle, Activity,
  Settings, Home, Sparkles, ChevronRight, Calendar, UserCheck, ShieldCheck,
  MapPin, Heart, CreditCard, ClipboardList, Building, Package, BarChart3,
  Menu as MenuIcon, Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper to get beautiful, high-quality placeholders by species
const getPetPlaceholder = (species: string) => {
  const s = (species || '').toLowerCase();
  if (s.includes('gat') || s.includes('cat')) {
    return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300';
  }
  if (s.includes('perr') || s.includes('dog')) {
    return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300';
  }
  return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300';
};

// ── Component ─────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    user,
    pets,
    petsLoading,
    upcomingAppointments,
    appointmentsLoading,
    actions,
    handleAction,
    router,
  } = useHome();

  // ── Render ──
  return (
    <ScreenContainer>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background, paddingBottom: 100 }]}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={[theme.primary, theme.primary + 'AA', theme.background]}
          style={styles.headerGradient}
        />

        {/* ─── Top Bar ─── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.topBarBtn} onPress={() => router.push('/menu' as any)}>
            <MenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topLogo}>
            <Sparkles size={16} color="#fcd34d" />
            <Text style={styles.logoText}>MICHICONDRIAS</Text>
          </View>
          <TouchableOpacity style={styles.topBarBtn} onPress={() => router.push('/notificaciones' as any)}>
            <Bell size={24} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ─── Hero Welcome Card ─── */}
        <View style={styles.heroContainer}>
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.welcomeRow}>
              <View style={styles.welcomeInfo}>
                <Text style={styles.welcomeLabel}>BIENVENIDO DE VUELTA</Text>
                <Text style={styles.welcomeName}>
                  {user?.full_name?.split(' ')[0] || 'Michilover'}
                </Text>
              </View>
              <View style={styles.avatarBox}>
                <LinearGradient colors={['#fcd34d', '#f59e0b']} style={styles.avatarBorder}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'M'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{pets.length}</Text>
                <Text style={styles.statLab}>Mascotas</Text>
              </View>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/directorio/citas' as any)}>
                <Text style={styles.statVal}>Ver</Text>
                <Text style={styles.statLab}>Citas</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>PRO</Text>
                <Text style={styles.statLab}>Nivel</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Mis Mascotas (Horizontal Carousel) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Bone size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Mis Mascotas</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/mascotas')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {petsLoading ? (
            <View style={styles.loadingBox}>
              <Activity size={32} color={theme.primary} />
            </View>
          ) : pets.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyPets, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/mascotas/nuevo')}
            >
              <Plus size={32} color={theme.textMuted} />
              <Text style={styles.emptyPetsText}>Empezar mi familia michi</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petsList}
            >
              <TouchableOpacity
                style={[styles.addPetBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push('/mascotas/nuevo')}
              >
                <Plus size={32} color={theme.primary} />
              </TouchableOpacity>

              {pets.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.petCard}
                  onPress={() => router.push(`/mascotas/${item.id}` as any)}
                >
                  <Image
                    source={{ uri: item.photo_url || getPetPlaceholder(item.species) }}
                    style={styles.petImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.petOverlay}
                  />
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{item.name}</Text>
                    <View style={styles.petTag}>
                      <Text style={styles.petTagText}>{item.species}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ─── Acciones Rápidas (2×2 grid) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Zap size={20} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Acciones Rápidas</Text>
            </View>
          </View>

          <View style={styles.actionsGrid}>
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => handleAction(action)}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionTitle, { color: theme.text }]} numberOfLines={1}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Próximas Citas ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Calendar size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Próximas Citas</Text>
            </View>
            {upcomingAppointments.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/directorio/citas' as any)}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {appointmentsLoading ? (
            <View style={styles.loadingBox}>
              <Activity size={28} color={theme.primary} />
            </View>
          ) : upcomingAppointments.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCitas, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/directorio' as any)}
            >
              <LinearGradient
                colors={[theme.primary + '10', theme.secondary + '08']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Calendar size={36} color={theme.primary} />
              <Text style={[styles.emptyCitasTitle, { color: theme.text }]}>Sin citas próximas</Text>
              <Text style={[styles.emptyCitasDesc, { color: theme.textMuted }]}>
                Agenda tu primera cita con un veterinario
              </Text>
              <View style={[styles.emptyCitasBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.emptyCitasBtnText}>Agendar tu primera cita</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.citasList}>
              {upcomingAppointments.map((appt) => {
                const statusColor = STATUS_COLORS[appt.status] || '#94a3b8';
                const statusLabel = STATUS_LABELS[appt.status] || appt.status;
                return (
                  <TouchableOpacity
                    key={appt.id}
                    style={[styles.citaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    activeOpacity={0.8}
                    onPress={() => router.push('/directorio/citas' as any)}
                  >
                    {/* Date badge */}
                    <View style={[styles.citaDateBadge, { backgroundColor: theme.primary + '15' }]}>
                      <Calendar size={16} color={theme.primary} />
                    </View>

                    <View style={styles.citaInfo}>
                      <Text style={[styles.citaDate, { color: theme.text }]}>
                        {formatDate(appt.appointment_date)}
                      </Text>
                      <Text style={[styles.citaClinic, { color: theme.textMuted }]} numberOfLines={1}>
                        {appt.clinic_name || 'Clínica'} · {appt.pet_name || 'Mascota'}
                      </Text>
                    </View>

                    <View style={[styles.citaStatusBadge, { backgroundColor: statusColor + '18' }]}>
                      <Text style={[styles.citaStatusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── Banner Promocional ─── */}
        <View style={styles.bannerSection}>
          <TouchableOpacity style={styles.banner} activeOpacity={0.9}>
            <LinearGradient
              colors={['#ec4899', '#f43f5e']}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTag}>NUEVO EN TIENDA</Text>
                <Text style={styles.bannerTitle}>Michi Box Premium</Text>
                <Text style={styles.bannerDesc}>Suscripción mensual de juguetes y snacks</Text>
              </View>
              <ShoppingBag size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  /* layout */
  scrollContent: { flexGrow: 1 },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
  },

  /* top bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  topBarBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  topLogo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 2 },
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

  /* hero welcome */
  heroContainer: { paddingHorizontal: 24, marginTop: 30 },
  glassCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  welcomeInfo: { flex: 1, backgroundColor: 'transparent' },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.5,
  },
  welcomeName: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2 },
  avatarBox: { width: 66, height: 66 },
  avatarBorder: { padding: 3, borderRadius: 24, ...StyleSheet.absoluteFillObject },
  avatarInner: {
    flex: 1,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#7c3aed' },
  statsStrip: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLab: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  /* sections */
  section: { marginTop: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  seeAll: { fontSize: 14, fontWeight: '700' },

  /* pets carousel */
  petsList: { paddingLeft: 24, paddingRight: 24, gap: 16 },
  addPetBtn: {
    width: 110,
    height: 180,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCard: {
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
  petImage: { ...StyleSheet.absoluteFillObject },
  petOverlay: { ...StyleSheet.absoluteFillObject },
  petInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  petName: { fontSize: 16, fontWeight: '900', color: '#fff' },
  petTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  petTagText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  emptyPets: {
    marginHorizontal: 24,
    height: 180,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyPetsText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  loadingBox: { height: 180, justifyContent: 'center', alignItems: 'center' },

  /* 2×2 actions grid */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 14,
  },
  actionCard: {
    width: '47%' as any,
    flexBasis: '47%',
    flexGrow: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '800' },

  /* citas */
  citasList: { paddingHorizontal: 24, gap: 12 },
  citaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
  },
  citaDateBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citaInfo: { flex: 1 },
  citaDate: { fontSize: 14, fontWeight: '800' },
  citaClinic: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  citaStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  citaStatusText: { fontSize: 10, fontWeight: '800' },
  emptyCitas: {
    marginHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  emptyCitasTitle: { fontSize: 16, fontWeight: '900', marginTop: 4 },
  emptyCitasDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  emptyCitasBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyCitasBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  /* banner */
  bannerSection: { paddingHorizontal: 24, marginTop: 32 },
  banner: {
    height: 120,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  bannerGradient: { ...StyleSheet.absoluteFillObject },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'space-between',
  },
  bannerTextCol: { flex: 1 },
  bannerTag: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 2 },
  bannerDesc: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.95)', marginTop: 4 },
});
