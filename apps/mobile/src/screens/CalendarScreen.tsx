import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InsuranceDetailModal } from '../components/InsuranceDetailModal';
import type { InsuranceProductDto, UpdateInsuranceProductDto } from '@boim/shared-types';

interface Props {
  insurances?: InsuranceProductDto[];
  onUpdateInsurance?: (id: string | number | bigint, dto: UpdateInsuranceProductDto) => Promise<void> | void;
  onDeleteInsurance?: (id: string | number | bigint) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
}

export const CalendarScreen: React.FC<Props> = ({
  insurances = [],
  onUpdateInsurance,
  onDeleteInsurance,
  onRefresh: externalRefresh,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceProductDto | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // 해당 월의 실제 마지막 날짜 (28~31일)
  const lastDay = new Date(year, month, 0).getDate();
  const daysInMonth = Array.from({ length: lastDay }, (_, i) => i + 1);

  // 해당 월 1일의 요일 (0: 일요일 ~ 6: 토요일)
  const firstDayOffset = new Date(year, month - 1, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.getDate());
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (externalRefresh) {
        await externalRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setRefreshing(false);
    }
  }, [externalRefresh]);

  const getDaySchedules = (day: number) => {
    return insurances.filter((ins) => {
      const startDay = new Date(ins.startDate).getDate();
      return startDay === day;
    });
  };

  const selectedSchedules = getDaySchedules(selectedDay);
  const totalMonthly = insurances.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#4f46e5']}
          tintColor="#4f46e5"
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.title}>{year}년 {month}월</Text>
          <Text style={styles.subtitle}>총 납입 예정 {totalMonthly.toLocaleString()}원</Text>
        </View>

        <View style={styles.headerControls}>
          <Pressable
            style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedScale]}
            onPress={handlePrevMonth}
          >
            <Ionicons name="chevron-back" size={18} color="#475569" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.todayButton, pressed && styles.pressedScale]}
            onPress={handleGoToday}
          >
            <Text style={styles.todayButtonText}>오늘</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedScale]}
            onPress={handleNextMonth}
          >
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </Pressable>
        </View>
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
          {/* 1일 이전 요일 빈 칸 채우기 */}
          {Array.from({ length: firstDayOffset }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.dayCell} />
          ))}

          {daysInMonth.map((day) => {
            const hasSchedule = getDaySchedules(day).length > 0;
            const isSelected = selectedDay === day;

            return (
              <Pressable
                key={day}
                style={({ pressed }) => [
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  pressed && styles.pressedCell,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{day}</Text>
                {hasSchedule && <View style={[styles.dot, isSelected && styles.selectedDot]} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>{month}월 {selectedDay}일 일정</Text>
        {selectedSchedules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>예정된 보험 일정이 없습니다.</Text>
          </View>
        ) : (
          selectedSchedules.map((item) => (
            <Pressable
              key={String(item.id)}
              style={({ pressed }) => [
                styles.scheduleCard,
                pressed && styles.pressedCard,
              ]}
              onPress={() => setSelectedInsurance(item)}
            >
              <View style={styles.scheduleLeft}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>납입일</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.companyText} numberOfLines={1}>
                    {item.institution}
                  </Text>
                  <Text
                    style={styles.nameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.amountText}>{item.monthlyPayment.toLocaleString()}원</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* 일정 터치 시 상세 보기 / 수정 / 삭제 모달 */}
      <InsuranceDetailModal
        visible={!!selectedInsurance}
        insurance={selectedInsurance}
        onClose={() => setSelectedInsurance(null)}
        onUpdate={async (id, dto) => {
          if (onUpdateInsurance) await onUpdateInsurance(id, dto);
          setSelectedInsurance((prev) => (prev ? { ...prev, ...dto } : null));
        }}
        onDelete={async (id) => {
          if (onDeleteInsurance) await onDeleteInsurance(id);
          setSelectedInsurance(null);
        }}
      />
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
  headerTitleGroup: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
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
  pressedScale: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  pressedCell: {
    opacity: 0.6,
  },
  pressedCard: {
    opacity: 0.75,
    backgroundColor: '#f8fafc',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0e7ff',
    alignSelf: 'center',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  scheduleInfo: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
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
    textAlign: 'right',
  },
});
