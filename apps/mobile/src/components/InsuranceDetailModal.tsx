import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { InsuranceProductDto, UpdateInsuranceProductDto } from '@boim/shared-types';

interface Props {
  visible: boolean;
  insurance: InsuranceProductDto | null;
  onClose: () => void;
  onUpdate: (id: string | number | bigint, dto: UpdateInsuranceProductDto) => Promise<void> | void;
  onDelete: (id: string | number | bigint) => Promise<void> | void;
}

const CATEGORY_MAP: Record<string, string> = {
  HEALTH: '건강/실손',
  CANCER: '암',
  AUTO: '운전자/자동차',
  SAVING: '연금/저축',
};

export const InsuranceDetailModal: React.FC<Props> = ({
  visible,
  insurance,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMonthly, setEditMonthly] = useState('');
  const [editMaturity, setEditMaturity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!insurance) return null;

  const handleStartEdit = () => {
    setEditMonthly(String(insurance.monthlyPayment));
    setEditMaturity(String(insurance.maturityDate).slice(0, 10));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      const dto: UpdateInsuranceProductDto = {
        monthlyPayment: Number(editMonthly.replace(/[^0-9]/g, '')) || insurance.monthlyPayment,
        maturityDate: editMaturity ? new Date(editMaturity).toISOString() : insurance.maturityDate,
      };

      await onUpdate(insurance.id, dto);
      setIsEditing(false);
      Alert.alert('수정 완료', '보험 정보가 성공적으로 변경되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.';
      Alert.alert('수정 실패', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '보험 삭제',
      `'${insurance.name}' 보험을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(insurance.id);
              onClose();
              Alert.alert('삭제 완료', '보험이 정상적으로 삭제되었습니다.');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : '삭제 실패';
              Alert.alert('오류', msg);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.companyText}>{insurance.institution}</Text>
              <Text style={styles.titleText}>{insurance.name}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressedScale]}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {CATEGORY_MAP[insurance.category] || insurance.category}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
                <Text style={styles.activeBadgeText}>유지 중</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>월 납입 보험료</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editMonthly}
                    onChangeText={setEditMonthly}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.amountHighlight}>
                    {insurance.monthlyPayment.toLocaleString()}원
                  </Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>보장 총액</Text>
                <Text style={styles.infoValue}>
                  {(Number(insurance.coverageAmount) / 10000).toLocaleString()}만원
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>가입 시작일</Text>
                <Text style={styles.infoValue}>
                  {String(insurance.startDate).slice(0, 10)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>보험 만기일</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editMaturity}
                    onChangeText={setEditMaturity}
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {String(insurance.maturityDate).slice(0, 10)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              {isEditing ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryActionBtn,
                    pressed && styles.pressedScale,
                  ]}
                  onPress={handleSaveEdit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryActionBtnText}>수정 내용 저장</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryActionBtn,
                      pressed && styles.pressedScale,
                    ]}
                    onPress={handleStartEdit}
                  >
                    <Ionicons name="create-outline" size={16} color="#475569" />
                    <Text style={styles.secondaryActionBtnText}>정보 수정</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteActionBtn,
                      pressed && styles.pressedScale,
                    ]}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text style={styles.deleteActionBtnText}>보험 삭제</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  companyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyContent: {
    gap: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '700',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  amountHighlight: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 130,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryActionBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
  },
  deleteActionBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  pressedScale: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
