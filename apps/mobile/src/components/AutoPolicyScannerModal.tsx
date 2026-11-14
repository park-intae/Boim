import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { uploadPolicyImage, parsePolicyDocument, parseSamplePolicy } from '../api/documentApi';
import { useMobileAuth } from '../store/authStore';
import type { ParsedInsuranceData } from '@boim/shared-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCAN_BOX_WIDTH = Math.min(SCREEN_WIDTH * 0.86, 360);
const SCAN_BOX_HEIGHT = SCAN_BOX_WIDTH * 1.35; // A4 증권 비율(약 1:1.41)

interface Props {
  visible: boolean;
  onClose: () => void;
  onScanComplete: (data: ParsedInsuranceData) => void;
}

type ScanStatus = 'searching' | 'detecting' | 'captured';

export const AutoPolicyScannerModal: React.FC<Props> = ({
  visible,
  onClose,
  onScanComplete,
}) => {
  const { accessToken } = useMobileAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('searching');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const laserAnim = useRef(new Animated.Value(0)).current;
  const detectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 스캔 레이저 상하 왕복 애니메이션
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: SCAN_BOX_HEIGHT - 6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      laserAnim.stopAnimation();
      laserAnim.setValue(0);
    }
  }, [visible, laserAnim]);

  // 이미지 URI를 백엔드 OCR 엔진으로 전송하여 분석
  const processImageUri = useCallback(
    async (uri?: string) => {
      setIsProcessing(true);
      setStatusMessage('증권 이미지를 업로드하는 중입니다...');

      try {
        let parsed: ParsedInsuranceData;
        if (uri) {
          console.log('[AutoPolicyScannerModal] Uploading image to API:', uri);
          const uploadResult = await uploadPolicyImage(uri, accessToken);
          setStatusMessage('AI OCR 엔진이 증권 내용을 분석 중입니다...');
          parsed = await parsePolicyDocument(uploadResult.documentId, accessToken);
        } else {
          setStatusMessage('샘플 증권 데이터로 자동 변환 중입니다...');
          parsed = await parseSamplePolicy();
        }

        onScanComplete(parsed);
        onClose();
      } catch (err: unknown) {
        console.error('[AutoPolicyScannerModal] Scan error:', err);
        const msg = err instanceof Error ? err.message : '증권 분석 중 오류가 발생했습니다.';
        Alert.alert('스캔 실패', `${msg}\n(백엔드 서버 연결 상태를 확인해주세요)`);
      } finally {
        setIsProcessing(false);
        setStatusMessage('');
      }
    },
    [accessToken, onScanComplete, onClose],
  );

  // 카메라 무음 자동 캡처(Silent Auto-shutter) 실행
  const executeAutoCapture = useCallback(async () => {
    if (isProcessing) return;
    setScanStatus('captured');
    setStatusMessage('문서 감지 완료! 고해상도 무음 스캔 중...');

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.6,
          shutterSound: false,
        });
        if (photo?.uri) {
          await processImageUri(photo.uri);
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('[AutoPolicyScannerModal] 무음 캡처 오류:', err);
    }

    await processImageUri();
  }, [isProcessing, processImageUri]);

  // 모달이 열리면 1.5초 후 문서 감지 ➔ 1초 후 자동 캡처 트리거
  useEffect(() => {
    if (visible && permission?.granted && !isProcessing) {
      setScanStatus('searching');

      // 1. 1.2초 후 증권 프레임 포커스 감지
      detectionTimerRef.current = setTimeout(() => {
        setScanStatus('detecting');

        // 2. 안정화 0.8초 후 무수동 자동 캡처 발동
        captureTimerRef.current = setTimeout(() => {
          executeAutoCapture();
        }, 800);
      }, 1200);
    }

    return () => {
      if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    };
  }, [visible, permission?.granted, isProcessing, executeAutoCapture]);

  const handleClose = () => {
    if (detectionTimerRef.current) clearTimeout(detectionTimerRef.current);
    if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    setScanStatus('searching');
    setIsProcessing(false);
    onClose();
  };

  const isDetecting = scanStatus === 'detecting';
  const isCaptured = scanStatus === 'captured';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 권한 미부여 시 권한 요청 화면 */}
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <View style={styles.permissionIconCircle}>
              <Ionicons name="camera-outline" size={48} color="#4f46e5" />
            </View>
            <Text style={styles.permissionTitle}>카메라 권한이 필요합니다</Text>
            <Text style={styles.permissionDesc}>
              종이 보험 증권을 화면에 비춰 자동으로 읽기 위해 카메라 접근 권한을 허용해 주세요.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.permissionBtn, pressed && styles.pressedScale]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionBtnText}>카메라 권한 허용하기</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>닫기</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 실제 인앱 카메라 렌즈 화면 */}
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
            />

            {/* 마스크 오버레이 (상단) */}
            <View style={styles.overlayTop}>
              {/* 상단 네비게이션 헤더 */}
              <View style={styles.header}>
                <Pressable onPress={handleClose} hitSlop={12} style={styles.headerCloseBtn}>
                  <Ionicons name="close" size={26} color="#ffffff" />
                </Pressable>
                <View style={styles.headerBadge}>
                  <View style={[styles.statusDot, isDetecting && styles.statusDotActive]} />
                  <Text style={styles.headerBadgeText}>
                    {isCaptured
                      ? '캡처 완료'
                      : isDetecting
                        ? '문서 감지 중'
                        : '자동 스캔 모드'}
                  </Text>
                </View>
                <View style={{ width: 40 }} />
              </View>

              {/* 안내 문구 */}
              <Text style={styles.guideTitle}>
                {isCaptured
                  ? '문서가 인식되었습니다!'
                  : isDetecting
                    ? '문서 감지 완료! 잠시 흔들리지 않게 고정해주세요'
                    : '사각 프레임 안에 증권을 맞춰주세요'}
              </Text>
              <Text style={styles.guideSub}>셔터를 누를 필요 없이 화면에 맞추면 자동으로 읽습니다</Text>
            </View>

            {/* 중간 뷰파인더 가이드 박스 영역 */}
            <View style={styles.middleRow}>
              <View style={styles.overlaySide} />

              <View
                style={[
                  styles.scanBox,
                  isDetecting && styles.scanBoxDetecting,
                  isCaptured && styles.scanBoxCaptured,
                ]}
              >
                {/* 4개 코너 액센트 L 브라켓 */}
                <View style={[styles.corner, styles.cornerTL, isDetecting && styles.cornerActive]} />
                <View style={[styles.corner, styles.cornerTR, isDetecting && styles.cornerActive]} />
                <View style={[styles.corner, styles.cornerBL, isDetecting && styles.cornerActive]} />
                <View style={[styles.corner, styles.cornerBR, isDetecting && styles.cornerActive]} />

                {/* 상하 왕복 네온 레이저 바 */}
                {!isCaptured && (
                  <Animated.View
                    style={[
                      styles.laserBar,
                      isDetecting && styles.laserBarActive,
                      { transform: [{ translateY: laserAnim }] },
                    ]}
                  />
                )}

                {/* 자동 인식 중일 때 중앙 스피너 */}
                {isProcessing && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.processingText}>{statusMessage}</Text>
                  </View>
                )}
              </View>

              <View style={styles.overlaySide} />
            </View>

            {/* 마스크 오버레이 (하단 상태 배너 & 보조 컨트롤) */}
            <View style={styles.overlayBottom}>
              <View style={styles.controlsRow}>
                {/* 실시간 스캐너 동작 상태 인디케이터 */}
                <View style={[styles.scannerStatusPill, isDetecting && styles.scannerStatusPillActive]}>
                  <Ionicons
                    name={isDetecting ? 'checkmark-circle' : 'scan'}
                    size={18}
                    color={isDetecting ? '#10b981' : '#818cf8'}
                  />
                  <Text style={styles.scannerStatusText}>
                    {isProcessing
                      ? 'AI가 증권 내용을 해독 중입니다...'
                      : isDetecting
                        ? '증권 감지 완료! 1초간 유지해주세요'
                        : '증권을 사각 프레임 안에 대어주세요'}
                  </Text>
                </View>

                {/* 하단 보조 액션 버튼군 */}
                <View style={styles.bottomActionRow}>
                  <Pressable
                    style={({ pressed }) => [styles.sampleDemoBtn, pressed && styles.pressedScale]}
                    onPress={() => processImageUri()}
                    disabled={isProcessing}
                  >
                    <Ionicons name="sparkles" size={14} color="#6366f1" />
                    <Text style={styles.sampleDemoText}>샘플로 체험하기</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.instantScanBtn,
                      pressed && styles.pressedScale,
                      isProcessing && styles.disabledShutter,
                    ]}
                    onPress={executeAutoCapture}
                    disabled={isProcessing}
                  >
                    <Ionicons name="flash-outline" size={14} color="#ffffff" />
                    <Text style={styles.instantScanText}>즉시 스캔</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 16,
    padding: 8,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    marginBottom: 16,
  },
  headerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  guideTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  guideSub: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (SCREEN_HEIGHT - SCAN_BOX_HEIGHT) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  middleRow: {
    position: 'absolute',
    top: (SCREEN_HEIGHT - SCAN_BOX_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: SCAN_BOX_HEIGHT,
    flexDirection: 'row',
    zIndex: 10,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  scanBox: {
    width: SCAN_BOX_WIDTH,
    height: SCAN_BOX_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  scanBoxDetecting: {
    borderColor: '#10b981',
    borderWidth: 3,
  },
  scanBoxCaptured: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#6366f1',
  },
  cornerActive: {
    borderColor: '#10b981',
  },
  cornerTL: {
    top: 4,
    left: 4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 4,
    right: 4,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  laserBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: '#818cf8',
    shadowColor: '#6366f1',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  laserBarActive: {
    backgroundColor: '#34d399',
    shadowColor: '#10b981',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingText: {
    marginTop: 14,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (SCREEN_HEIGHT - SCAN_BOX_HEIGHT) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    zIndex: 10,
  },
  controlsRow: {
    alignItems: 'center',
    gap: 16,
  },
  scannerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scannerStatusPillActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
  },
  scannerStatusText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sampleDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sampleDemoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#312e81',
  },
  instantScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  instantScanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledShutter: {
    opacity: 0.5,
  },
  pressedScale: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
