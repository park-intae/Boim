import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InsuranceProductDto } from '@boim/shared-types';

interface Props {
  insurances?: InsuranceProductDto[];
}

export const CalendarScreen: React.FC<Props> = ({ insurances = [] }) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const getDaySchedules = (day: number) => {
    return insurances.filter((ins) => {
      const startDay = new Date(ins.startDate).getDate();
      return startDay === day;
    });
  };

  const selectedSchedules = getDaySchedules(selectedDay);
  const totalMonthly = insurances.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>2026년 11월</Text>
          <Text style={styles.subtitle}>총 납입 예정 {totalMonthly.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setSelectedDay(new Date().getDate())}
        >
          <Text style={styles.todayButtonText}>오늘</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.weekRow}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
            <Text
              key={day}
              style={[
                styles.weekText,
                idx === 0 && styles.sundayText,
                idx === 6 && styles.saturdayText,
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {daysInMonth.map((day) => {
            const hasSchedule = getDaySchedules(day).length > 0;
            const isSelected = selectedDay === day;

            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                {hasSchedule && <View style={[styles.dot, isSelected && styles.selectedDot]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>11월 {selectedDay}일 일정</Text>
        {selectedSchedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>예정된 보험 일정이 없습니다.</Text>
          </View>
        ) : (
          selectedSchedules.map((item) => (
            <View key={String(item.id)} style={styles.scheduleCard}>
              <View style={styles.scheduleLeft}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>납입일</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.companyText}>{item.institution}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
                </View>
              </View>
              <Text style={styles.amountText}>{item.monthlyPayment.toLocaleString()}원</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  todayButtonText: {
    color: '#4338ca',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  weekText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    width: 36,
    textAlign: 'center',
  },
  sundayText: {
    color: '#ef4444',
  },
  saturdayText: {
    color: '#3b82f6',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedDayCell: {
    backgroundColor: '#4f46e5',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4f46e5',
    marginTop: 2,
  },
  selectedDot: {
    backgroundColor: '#ffffff',
  },
  detailSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  scheduleInfo: {
    gap: 2,
  },
  companyText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  nameText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
});
