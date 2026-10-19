import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useHome, STATUS_COLORS, STATUS_LABELS, formatDate } from '@/src/hooks/home/useHome';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import HeroStatusBar from '@/src/components/layout/HeroStatusBar';
import { Plus, Bell, Bone, Activity, Sparkles, ChevronRight, Calendar, ShieldCheck, Zap, Handshake, XCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GettingStartedCard from '@/src/components/GettingStartedCard';
import { useAvatar } from '@/src/hooks/perfil/useAvatar';
import { spacing, radius, type, font, layout } from '@/constants/design';

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
    unreadNotifications,
    actions,
    roleTools,
    panelTitle,
    proOnboarding,
    handleAction,
    router,
  } = useHome();
  const { avatarUrl } = useAvatar();

  // ── Render ──
  return (
    <ScreenContainer>
      <HeroStatusBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background, paddingBottom: 100 }]}
      >
        {/* Background Gradient */}
        <LinearGradient
          colors={[...theme.heroGradient, theme.background]}
          locations={[0, 0.55, 1]}
          style={styles.headerGradient}
        />

        {/* ─── Top Bar ─── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <View style={styles.topLogo}>
            <Sparkles size={16} color={theme.accent} />
            <Text style={styles.logoText}>MICHICONDRIAS</Text>
          </View>
          <TouchableOpacity
            style={styles.topBarBtn}
            onPress={() => router.push('/notificaciones' as any)}
            accessibilityRole="button"
            accessibilityLabel={unreadNotifications > 0 ? `Notificaciones, ${unreadNotifications} sin leer` : 'Notificaciones'}
          >
            <Bell size={24} color={theme.onHero} />
            {unreadNotifications > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: theme.error }]}>
                <Text style={[styles.notifBadgeText, { color: theme.onHero }]}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
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
              <TouchableOpacity
                style={styles.avatarBox}
                onPress={() => router.push('/(tabs)/perfil' as any)}
                accessibilityRole="button"
                accessibilityLabel="Ir a tu perfil"
              >
                <LinearGradient colors={[theme.accent, theme.accent]} style={styles.avatarBorder}>
                  <View style={[styles.avatarInner, { overflow: 'hidden' }]}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} accessibilityLabel="Tu foto de perfil" />
                    ) : (
                      <Text style={styles.avatarText}>
                        {user?.full_name?.charAt(0)?.toUpperCase() || 'M'}
                      </Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Stats strip */}
            <View style={styles.statsStrip}>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/mascotas')} accessibilityRole="button" accessibilityLabel={`${pets.length} mascotas`}>
                <Text style={[styles.statVal, { color: theme.onHero }]}>{pets.length}</Text>
                <Text style={styles.statLab}>Mascotas</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/directorio/citas' as any)} accessibilityRole="button" accessibilityLabel="Próximas citas">
                <Text style={[styles.statVal, { color: theme.onHero }]}>{appointmentsLoading ? '–' : upcomingAppointments.length}</Text>
                <Text style={styles.statLab}>Citas</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>

        {/* ─── Primeros pasos (cuenta nueva sin mascotas) ─── */}
        {!petsLoading && pets.length === 0 && roleTools.length === 0 && <GettingStartedCard />}

        {/* ─── Alta profesional: estado de la verificación ─── */}
        {proOnboarding !== 'none' && (
          <View style={styles.section}>
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={() => router.push((proOnboarding === 'approved' ? '/perfil/partner' : '/perfil/verificacion') as any)}
              style={[styles.actionCard, { width: 'auto', alignSelf: 'stretch', flexBasis: 'auto', marginHorizontal: layout.screenPadding, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: theme.surface, borderColor: theme.accent }]}
            >
              <View style={[styles.actionIconBox, { backgroundColor: theme.accentLight, marginBottom: 0 }]}>
                {proOnboarding === 'approved' ? <Handshake size={24} color={theme.accent} /> : <XCircle size={24} color={theme.error} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: theme.text, textAlign: 'left' }]}>
                  {proOnboarding === 'approved' ? 'Identidad aprobada' : 'Verificación rechazada'}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: font.md, fontWeight: '500', marginTop: spacing.xxs }}>
                  {proOnboarding === 'approved' ? 'Activa tu cuenta profesional ahora' : 'Vuelve a subir tus documentos'}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Panel del rol (profesionales y admin) ─── */}
        {roleTools.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <ShieldCheck size={20} color={theme.accent} />
                <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>{panelTitle || 'Tu panel'}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/menu' as any)}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>Todas las herramientas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {roleTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <TouchableOpacity
                    key={tool.id}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${tool.label}. ${tool.desc}`}
                    style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push(tool.route as any)}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: tool.color + '18' }]}>
                      <ToolIcon size={24} color={tool.color} />
                    </View>
                    <Text style={[styles.actionTitle, { color: theme.text }]} numberOfLines={1}>{tool.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

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
                    <Text style={[styles.petName, { color: theme.onHero }]}>{item.name}</Text>
                    <View style={styles.petTag}>
                      <Text style={[styles.petTagText, { color: theme.onHero }]}>{item.species}</Text>
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
              <Zap size={20} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{roleTools.length > 0 ? 'Para tu mascota' : 'Atajos'}</Text>
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
                <Text style={[styles.emptyCitasBtnText, { color: theme.onPrimary }]}>Agendar tu primera cita</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.citasList}>
              {upcomingAppointments.map((appt) => {
                const statusColor = STATUS_COLORS[appt.status] || theme.textMuted;
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
    paddingHorizontal: layout.screenPadding,
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
    borderColor: 'rgba(233,200,131,0.28)',
    position: 'relative',
  },
  topLogo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoText: { fontSize: font.base, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 3 },
  notifBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: { ...type.label, letterSpacing: 0 }, // color: theme.onHero (inline)

  /* hero welcome */
  heroContainer: { paddingHorizontal: layout.screenPadding, marginTop: spacing.xxxl },
  glassCard: {
    padding: spacing.xxl,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(233,200,131,0.3)',
    backgroundColor: 'rgba(8,12,24,0.55)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'transparent',
  },
  welcomeInfo: { flex: 1, backgroundColor: 'transparent' },
  welcomeLabel: {
    fontSize: font.xs,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.5,
  },
  welcomeName: { fontSize: font.h1, fontWeight: '900', color: '#fff', marginTop: spacing.xxs },
  avatarBox: { width: 66, height: 66 },
  avatarBorder: { padding: spacing.xs, borderRadius: 24, ...StyleSheet.absoluteFillObject },
  avatarInner: {
    flex: 1,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: font.h2, fontWeight: '900', color: '#7c3aed' },
  statsStrip: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: font.xxl, fontWeight: '900' }, // color: theme.onHero (inline)
  statLab: { fontSize: font.xs, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: spacing.xxs },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  /* sections */
  section: { marginTop: spacing.xxxl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionTitle: { fontSize: font.xxl, fontWeight: '900' },
  seeAll: { fontSize: font.base, fontWeight: '700' },

  /* pets carousel */
  petsList: { paddingLeft: spacing.xxl, paddingRight: spacing.xxl, gap: spacing.lg },
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
  petInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg },
  petName: { fontSize: font.xl, fontWeight: '900' }, // color: theme.onHero (inline)
  petTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  petTagText: { fontSize: font.xs, fontWeight: '800', textTransform: 'uppercase' }, // color: theme.onHero (inline)
  emptyPets: {
    marginHorizontal: layout.screenPadding,
    height: 180,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyPetsText: { fontSize: font.base, fontWeight: '700', color: '#64748b' },
  loadingBox: { height: 180, justifyContent: 'center', alignItems: 'center' },

  /* 2×2 actions grid */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
  actionCard: {
    width: '47%' as any,
    flexBasis: '47%',
    flexGrow: 0,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.md,
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
  actionTitle: { fontSize: font.base, fontWeight: '800' },

  /* citas */
  citasList: { paddingHorizontal: layout.screenPadding, gap: spacing.md },
  citaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    gap: spacing.lg,
  },
  citaDateBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citaInfo: { flex: 1 },
  citaDate: { fontSize: font.base, fontWeight: '800' },
  citaClinic: { fontSize: font.md, fontWeight: '500', marginTop: spacing.xxs },
  citaStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },
  citaStatusText: { fontSize: font.xs, fontWeight: '800' },
  emptyCitas: {
    marginHorizontal: layout.screenPadding,
    borderRadius: 28,
    borderWidth: 1,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  emptyCitasTitle: { fontSize: font.xl, fontWeight: '900', marginTop: spacing.xs },
  emptyCitasDesc: { fontSize: font.base, fontWeight: '500', textAlign: 'center' },
  emptyCitasBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  emptyCitasBtnText: { fontSize: font.base, fontWeight: '800' }, // color: theme.onPrimary (inline)
});
