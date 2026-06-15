import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMySitRequests, SitRequest } from '@/src/services/cuidadores';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#f59e0b', bg: '#f59e0b20', label: 'Pendiente' },
  confirmed: { color: '#10b981', bg: '#10b98120', label: 'Confirmado' },
  completed: { color: '#6366f1', bg: '#6366f120', label: 'Completado' },
  cancelled: { color: '#ef4444', bg: '#ef444420', label: 'Cancelado' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function datesInRange(startDate: string, endDate: string): string[] {
  const keys: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const cur = new Date(start);
  while (cur <= end) {
    keys.push(cur.toISOString().substring(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

export default function CuidadoresCalendarioScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-sit-requests'],
    queryFn: getMySitRequests,
  });

  const requestsByDate = useMemo(() => {
    const map: Record<string, SitRequest[]> = {};
    requests.forEach((req) => {
      if (req.start_date && req.end_date) {
        const keys = datesInRange(req.start_date.substring(0, 10), req.end_date.substring(0, 10));
        keys.forEach((key) => {
          if (!map[key]) map[key] = [];
          map[key].push(req);
        });
      }
    });
    return map;
  }, [requests]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const selectedDateKey = selectedDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const selectedRequests = selectedDateKey ? requestsByDate[selectedDateKey] || [] : [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
          <ChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Calendario</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Month Navigator */}
        <View style={[styles.monthNav, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {MONTHS_ES[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {DAYS_ES.map((day) => (
            <Text key={day} style={[styles.dayHeaderText, { color: theme.textMuted }]}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRequests = requestsByDate[dateKey] || [];
            const isSelected = selectedDay === day;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            return (
              <TouchableOpacity
                key={`day-${day}`}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.primary, borderRadius: 12 },
                  isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.primary, borderRadius: 12 },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? '#fff' : theme.text },
                ]}>
                  {day}
                </Text>
                {dayRequests.length > 0 && (
                  <View style={[
                    styles.dot,
                    { backgroundColor: isSelected ? '#fff' : theme.primary },
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Day Requests */}
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedDay
              ? `${selectedDay} de ${MONTHS_ES[currentMonth]} — ${selectedRequests.length} servicio(s)`
              : 'Selecciona un día'}
          </Text>

          {selectedRequests.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {selectedDay ? 'Sin servicios este día' : 'Toca un día del calendario'}
              </Text>
            </View>
          ) : (
            selectedRequests.map((req) => {
              const st = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
              const isMultiDay = req.start_date.substring(0, 10) !== req.end_date.substring(0, 10);
              return (
                <TouchableOpacity
                  key={req.id}
                  style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => showAlert({
                    type: 'info',
                    title: 'Detalle del Servicio',
                    message: `Mascota: ${req.pet_id}\nTipo: ${req.service_type}\nDesde: ${req.start_date.substring(0, 10)}\nHasta: ${req.end_date.substring(0, 10)}\nEstado: ${st.label}`,
                  })}
                >
                  <View style={styles.reqTop}>
                    <Text style={[styles.reqId, { color: theme.text }]}>Cuidado #{req.id.substring(0, 6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                  <View style={styles.reqDetails}>
                    <View style={styles.reqDetailRow}>
                      <Clock size={14} color={theme.textMuted} />
                      <Text style={[styles.reqDetailText, { color: theme.textMuted }]}>
                        {isMultiDay
                          ? `${req.start_date.substring(0, 10)} → ${req.end_date.substring(0, 10)}`
                          : req.start_date.substring(0, 10)
                        }
                      </Text>
                    </View>
                    {req.address && (
                      <View style={styles.reqDetailRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.reqDetailText, { color: theme.textMuted }]} numberOfLines={1}>
                          {req.address}
                        </Text>
                      </View>
                    )}
                  </View>
                  {req.total_price != null && (
                    <Text style={[styles.reqPrice, { color: theme.primary }]}>${req.total_price}</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '900' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 16, fontWeight: '800' },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '600' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  requestsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, fontWeight: '600' },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reqId: { fontSize: 14, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  reqDetails: { gap: 6 },
  reqDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqDetailText: { fontSize: 13 },
  reqPrice: { fontSize: 16, fontWeight: '800', marginTop: 10 },
});
