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
import { InsuranceAddModal } from '../components/InsuranceAddModal';
import { InsuranceDetailModal } from '../components/InsuranceDetailModal';
import type { InsuranceProductDto, UpdateInsuranceProductDto } from '@boim/shared-types';

const CATEGORY_MAP: Record<string, string> = {
  ALL: '전체',
  HEALTH: '건강/실손',
  CANCER: '암',
  AUTO: '운전자/자동차',
  SAVING: '연금/저축',
};

interface Props {
  insurances?: InsuranceProductDto[];
  onAddInsurance?: (product: InsuranceProductDto) => void;
  onUpdateInsurance?: (id: string | number | bigint, dto: UpdateInsuranceProductDto) => Promise<void> | void;
  onDeleteInsurance?: (id: string | number | bigint) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
}

export const InsuranceListScreen: React.FC<Props> = ({
  insurances = [],
  onAddInsurance,
  onUpdateInsurance,
  onDeleteInsurance,
  onRefresh: externalRefresh,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceProductDto | null>(null);

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

  const handleOpenAddModal = () => {
    setAddModalVisible(true);
  };

  const handleCardPress = (item: InsuranceProductDto) => {
    setSelectedInsurance(item);
  };

  const handleAddSubmit = (product: InsuranceProductDto) => {
    if (onAddInsurance) {
      onAddInsurance(product);
    }
  };

  const handleUpdateSubmit = async (id: string | number | bigint, dto: UpdateInsuranceProductDto) => {
    if (onUpdateInsurance) {
      await onUpdateInsurance(id, dto);
    }
    // 현재 선택된 상세 객체도 갱신
    setSelectedInsurance((prev) => (prev ? { ...prev, ...dto } : null));
  };

  const handleDeleteSubmit = async (id: string | number | bigint) => {
    if (onDeleteInsurance) {
      await onDeleteInsurance(id);
    }
    setSelectedInsurance(null);
  };

  const filtered =
    selectedKey === 'ALL'
      ? insurances
      : insurances.filter((item) => item.category === selectedKey);

  const totalMonthly = insurances.reduce((sum, item) => sum + item.monthlyPayment, 0);

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
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>가입 보험 {insurances.length}건</Text>
          <Text style={styles.summaryValue}>{totalMonthly.toLocaleString()}원</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressedScale,
          ]}
          onPress={handleOpenAddModal}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.addButtonText}>보험 등록</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {Object.entries(CATEGORY_MAP).map(([key, label]) => {
          const isSelected = selectedKey === key;
          return (
            <Pressable
              key={key}
              style={({ pressed }) => [
                styles.filterChip,
                isSelected && styles.activeFilterChip,
                pressed && styles.pressedScale,
              ]}
              onPress={() => setSelectedKey(key)}
            >
              <Text style={[styles.filterText, isSelected && styles.activeFilterText]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="shield-outline" size={36} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>가입된 보험이 없습니다</Text>
          <Text style={styles.emptySubtitle}>보유하신 보험 증권을 등록하고 맞춤 관리를 시작해보세요.</Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.pressedScale,
            ]}
            onPress={handleOpenAddModal}
          >
            <Text style={styles.emptyButtonText}>보험 증권 등록하기</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filtered.map((item) => (
            <Pressable
              key={String(item.id)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressedCard,
              ]}
              onPress={() => handleCardPress(item)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
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
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORY_MAP[item.category] || item.category}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color="#64748b" />
                  <Text style={styles.metaLabel}>만기일</Text>
                  <Text style={styles.metaValue}>{String(item.maturityDate).slice(0, 10)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#64748b" />
                  <Text style={styles.metaLabel}>보장금액</Text>
                  <Text style={styles.metaValue}>
                    {(Number(item.coverageAmount) / 10000).toLocaleString()}만원
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.monthlyLabel}>월 납입액</Text>
                <Text style={styles.monthlyValue}>{item.monthlyPayment.toLocaleString()}원</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* 새 보험 등록 및 증권 OCR 스캔 모달 */}
      <InsuranceAddModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddSubmit}
      />

      {/* 보험 상세 정보 / 수정 / 삭제 모달 */}
      <InsuranceDetailModal
        visible={!!selectedInsurance}
        insurance={selectedInsurance}
        onClose={() => setSelectedInsurance(null)}
        onUpdate={handleUpdateSubmit}
        onDelete={handleDeleteSubmit}
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
  summaryCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLeft: {
    gap: 4,
  },
  summaryLabel: {
    color: '#e0e7ff',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  pressedScale: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  pressedCard: {
    opacity: 0.8,
    backgroundColor: '#f8fafc',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeFilterChip: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  companyText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#4f46e5',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  cardBody: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
    width: 52,
  },
  metaValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  monthlyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4f46e5',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
