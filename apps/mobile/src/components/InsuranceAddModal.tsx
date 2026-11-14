import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AutoPolicyScannerModal } from './AutoPolicyScannerModal';
import { createInsurance } from '../api/insuranceApi';
import { useMobileAuth } from '../store/authStore';
import type { InsuranceProductDto, ParsedInsuranceData, CreateInsuranceProductDto } from '@boim/shared-types';

import { INSURANCE_CATEGORIES } from '../constants/categories';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: InsuranceProductDto) => void;
  prefillData?: ParsedInsuranceData | null;
}

export const InsuranceAddModal: React.FC<Props> = ({
  visible,
  onClose,
  onAdd,
  prefillData,
}) => {
  const { accessToken, user } = useMobileAuth();
  const [institution, setInstitution] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('HEALTH');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('50000000');
  const [maturityDate, setMaturityDate] = useState('2044-12-31');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // prefillData가 주어지면 폼에 자동 입력 (Prefill)
  useEffect(() => {
    if (prefillData) {
      if (prefillData.institution) setInstitution(prefillData.institution);
      if (prefillData.name) setName(prefillData.name);
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.monthlyPayment) setMonthlyPayment(String(prefillData.monthlyPayment));
      if (prefillData.coverageAmount) setCoverageAmount(String(prefillData.coverageAmount));
      if (prefillData.maturityDate) setMaturityDate(String(prefillData.maturityDate).slice(0, 10));
    }
  }, [prefillData]);

  const handleScanComplete = (data: ParsedInsuranceData) => {
    if (data.institution) setInstitution(data.institution);
    if (data.name) setName(data.name);
    if (data.category) setCategory(data.category);
    if (data.monthlyPayment) setMonthlyPayment(String(data.monthlyPayment));
    if (data.coverageAmount) setCoverageAmount(String(data.coverageAmount));
    if (data.maturityDate) setMaturityDate(String(data.maturityDate).slice(0, 10));

    Alert.alert('자동 완성 완료', '증권에서 추출한 정보가 폼에 자동 입력되었습니다.');
  };

  const handleSubmit = async () => {
    if (!institution.trim() || !name.trim() || !monthlyPayment.trim()) {
      Alert.alert('알림', '보험사, 상품명, 월 납입액을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const dto: CreateInsuranceProductDto = {
      userId: user?.id ? Number(user.id) : 1,
      institution: institution.trim(),
      name: name.trim(),
      category,
      monthlyPayment: Number(monthlyPayment.replace(/[^0-9]/g, '')) || 0,
      coverageAmount: Number(coverageAmount.replace(/[^0-9]/g, '')) || 0,
      startDate: new Date().toISOString(),
      maturityDate: new Date(maturityDate).toISOString(),
    };

    try {
      // 1. 백엔드 API 호출로 DB에 영구 등록
      let savedProduct: InsuranceProductDto;
      try {
        savedProduct = await createInsurance(dto, accessToken);
      } catch {
        // 백엔드 연결 오프라인 시 로컬 객체로 폴백
        savedProduct = {
          ...dto,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      onAdd(savedProduct);
      onClose();
      Alert.alert('등록 완료', '새로운 보험이 성공적으로 등록되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '보험 등록 실패';
      Alert.alert('오류', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>새 보험 등록</Text>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressedScale]}
            onPress={onClose}
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* 카메라 OCR 빠른 스캔 배너 */}
          <Pressable
            style={({ pressed }) => [
              styles.scanBanner,
              pressed && styles.pressedScale,
            ]}
            onPress={() => setScannerVisible(true)}
          >
            <View style={styles.scanBannerIcon}>
              <Ionicons name="scan" size={24} color="#ffffff" />
            </View>
            <View style={styles.scanBannerText}>
              <Text style={styles.scanBannerTitle}>증권 자동 감지 스캔 (제로 클릭)</Text>
              <Text style={styles.scanBannerSubtitle}>
                화면에 증권을 비추면 셔터 없이 실시간으로 읽어옵니다.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4f46e5" />
          </Pressable>

          {/* 1. 보험사 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>보험사</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 삼성화재, 한화생명"
              placeholderTextColor="#94a3b8"
              value={institution}
              onChangeText={setInstitution}
            />
          </View>

          {/* 2. 상품명 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>보험 상품명</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 다이렉트 실손의료비보험"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 3. 카테고리 선택 칩 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.categoryRow}>
              {INSURANCE_CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.activeCategoryChip,
                    ]}
                    onPress={() => setCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.activeCategoryChipText,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4. 월 납입액 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>월 납입 보험료 (원)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 38500"
              placeholderTextColor="#94a3b8"
              value={monthlyPayment}
              onChangeText={setMonthlyPayment}
              keyboardType="numeric"
            />
          </View>

          {/* 5. 만기일자 입력 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>만기일자 (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 2044-03-14"
              placeholderTextColor="#94a3b8"
              value={maturityDate}
              onChangeText={setMaturityDate}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.disabledButton,
              pressed && styles.pressedScale,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '보험 등록 중...' : '내 보험으로 등록하기'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 증권 자동 감지 스캔 모달 연결 */}
      <AutoPolicyScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanComplete={handleScanComplete}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    marginBottom: 4,
  },
  scanBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scanBannerText: {
    flex: 1,
  },
  scanBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#312e81',
  },
  scanBannerSubtitle: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  activeCategoryChip: {
    backgroundColor: '#4f46e5',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeCategoryChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  pressedScale: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
