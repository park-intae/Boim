import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InsuranceDiagnosisDto } from '@boim/shared-types';

interface Props {
  diagnosis?: InsuranceDiagnosisDto | null;
  onDiagnosePress?: () => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
}

const GRADE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  EXCELLENT: { label: '최우수 안심', color: '#059669', bg: '#ecfdf5' },
  GOOD: { label: '안심 등급', color: '#059669', bg: '#ecfdf5' },
  NORMAL: { label: '보통 등급', color: '#d97706', bg: '#fef3c7' },
  NEEDS_ATTENTION: { label: '보강 필요', color: '#dc2626', bg: '#fee2e2' },
  WARNING: { label: '주의 등급', color: '#dc2626', bg: '#fee2e2' },
};

export const DiagnosisScreen: React.FC<Props> = ({
  diagnosis = null,
  onDiagnosePress,
  onRefresh: externalRefresh,
}) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  const handleDiagnose = async () => {
    if (!onDiagnosePress) return;
    setIsDiagnosing(true);
    try {
      await onDiagnosePress();
    } finally {
      setIsDiagnosing(false);
    }
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

  if (!diagnosis) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
      >
        <View style={styles.emptyIconCircle}>
          <Ionicons name="analytics-outline" size={36} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>AI 보장 분석 결과가 없습니다</Text>
        <Text style={styles.emptySubtitle}>
          보유 중인 보험을 기반으로 빈틈없는 맞춤 분석 리포트를 받아보세요.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            isDiagnosing && styles.disabledButton,
            pressed && styles.pressedScale,
          ]}
          onPress={handleDiagnose}
          disabled={isDiagnosing}
        >
          {isDiagnosing ? (
            <View style={styles.btnLoadingRow}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.primaryButtonText}>AI 종합 분석 진행 중...</Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>AI 종합 진단 시작하기</Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  const gradeInfo = GRADE_MAP[diagnosis.grade] || GRADE_MAP.GOOD;

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
      <View style={styles.scoreCard}>
        <View style={styles.scoreTopRow}>
          <View style={[styles.scoreBadge, { backgroundColor: gradeInfo.bg }]}>
            <Text style={[styles.scoreBadgeText, { color: gradeInfo.color }]}>
              {gradeInfo.label}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.reDiagnoseBtn,
              isDiagnosing && styles.disabledButton,
              pressed && styles.pressedScale,
            ]}
            onPress={handleDiagnose}
            disabled={isDiagnosing}
          >
            {isDiagnosing ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <>
                <Ionicons name="refresh" size={14} color="#4f46e5" />
                <Text style={styles.reDiagnoseBtnText}>AI 재진단</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{diagnosis.score}</Text>
          <Text style={styles.scoreMax}>/ 100점</Text>
        </View>
        <Text style={styles.scoreSummary}>{diagnosis.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>카테고리별 보장 분석</Text>
        {diagnosis.categoryEvaluations.map((item, idx) => {
          const ratio = Math.min(Math.round((item.currentAmount / item.recommendedAmount) * 100), 100);
          const isAdequate = item.status === 'ADEQUATE';

          return (
            <View key={idx} style={styles.evalCard}>
              <View style={styles.evalHeader}>
                <Text style={styles.evalCategory}>{item.category}</Text>
                <View
                  style={[
                    styles.statusTag,
                    isAdequate ? styles.adequateTag : styles.underCoveredTag,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      isAdequate ? styles.adequateText : styles.underCoveredText,
                    ]}
                  >
                    {isAdequate ? '적정' : '부족'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${ratio}%` },
                    isAdequate ? styles.adequateFill : styles.underCoveredFill,
                  ]}
                />
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>
                  현재 {(item.currentAmount / 10000).toLocaleString()}만원
                </Text>
                <Text style={styles.amountRecommended}>
                  권장 {(item.recommendedAmount / 10000).toLocaleString()}만원
                </Text>
              </View>

              <Text style={styles.evalComment}>{item.comment}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI 리모델링 솔루션</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="sparkles" size={16} color="#4f46e5" />
            <Text style={styles.tipTitle}>월 보험료 절감 팁</Text>
          </View>
          {diagnosis.costSavingTips.map((tip, idx) => (
            <Text key={idx} style={styles.tipContent}>
              • {tip}
            </Text>
          ))}
        </View>
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
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  scoreTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scoreBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  reDiagnoseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  reDiagnoseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  disabledButton: {
    opacity: 0.6,
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
  },
  scoreSummary: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  evalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  evalCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adequateTag: {
    backgroundColor: '#ecfdf5',
  },
  underCoveredTag: {
    backgroundColor: '#fef2f2',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  adequateText: {
    color: '#059669',
  },
  underCoveredText: {
    color: '#dc2626',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  adequateFill: {
    backgroundColor: '#10b981',
  },
  underCoveredFill: {
    backgroundColor: '#ef4444',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  amountRecommended: {
    fontSize: 12,
    color: '#94a3b8',
  },
  evalComment: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
  },
  tipCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338ca',
  },
  tipContent: {
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
  primaryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pressedScale: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
