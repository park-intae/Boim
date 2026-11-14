import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestPassCode, verifyPassCode } from '../api/passApi';
import { useMobileAuth } from '../store/authStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PassVerificationModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { accessToken, updateUser } = useMobileAuth();

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('010-1234-5678');
  const [code, setCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 모달 닫힐 때 상태 리셋
  useEffect(() => {
    if (!visible) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('phone');
      setCode('');
      setTransactionId('');
      setTimeLeft(180);
      setErrorMessage(null);
      setLoading(false);
    }
  }, [visible]);

  // 타이머 작동
  useEffect(() => {
    if (step === 'code' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, timeLeft]);

  // 인증번호 발송 요청
  const handleRequestCode = async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage('휴대폰 번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const txId = await requestPassCode(phoneNumber);
      setTransactionId(txId);
      setStep('code');
      setTimeLeft(180);
      Alert.alert(
        '인증번호 발송',
        '인증번호가 모의 발송되었습니다.\n(백엔드 콘솔 또는 테스트 코드 "123456" 입력)',
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 검증 요청
  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setErrorMessage('6자리 인증번호를 정확히 입력해주세요.');
      return;
    }
    if (timeLeft <= 0) {
      setErrorMessage('인증 유효시간이 만료되었습니다. 다시 발송해주세요.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await verifyPassCode(transactionId, code, accessToken);
      updateUser({ isPassVerified: true });
      Alert.alert('인증 완료', 'PASS 본인인증이 성공적으로 완료되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '인증번호가 일치하지 않습니다.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.passLogoBadge}>
                <Text style={styles.passLogoText}>PASS</Text>
              </View>
              <Text style={styles.headerTitle}>본인인증 갱신</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.descText}>
              실제 통신사(SKT, KT, LGU+) 가입자 인증 프로토콜을 모방한 실감형 본인확인 절차입니다.
            </Text>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {step === 'phone' ? (
              <View style={styles.stepContainer}>
                <Text style={styles.inputLabel}>휴대폰 번호</Text>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="010-0000-0000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  autoFocus
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    loading && styles.disabledButton,
                    pressed && styles.pressedScale,
                  ]}
                  onPress={handleRequestCode}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>인증번호 받기</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.stepContainer}>
                <View style={styles.codeLabelRow}>
                  <Text style={styles.inputLabel}>인증번호 6자리</Text>
                  <Text style={[styles.timerText, timeLeft <= 30 && styles.timerWarning]}>
                    {formatTimer(timeLeft)}
                  </Text>
                </View>

                <TextInput
                  style={[styles.textInput, styles.codeInput]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                <View style={styles.buttonRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      pressed && styles.pressedScale,
                    ]}
                    onPress={handleRequestCode}
                    disabled={loading}
                  >
                    <Text style={styles.secondaryButtonText}>재발송</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      styles.flexButton,
                      loading && styles.disabledButton,
                      pressed && styles.pressedScale,
                    ]}
                    onPress={handleVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>인증 완료하기</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passLogoBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  passLogoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingVertical: 16,
  },
  descText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
    flex: 1,
  },
  stepContainer: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  codeInput: {
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  codeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  timerWarning: {
    color: '#ef4444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressedScale: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
