import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserDto, NotificationSettingsDto } from '@boim/shared-types';
import { PassVerificationModal } from '../components/PassVerificationModal';
import { fetchNotificationSettings, updateNotificationSettings } from '../api/userApi';
import { useMobileAuth } from '../store/authStore';

const DEFAULT_SETTINGS: NotificationSettingsDto = {
  pushEnabled: true,
  emailEnabled: true,
  kakaoEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
};

interface Props {
  user?: UserDto | null;
  settings?: NotificationSettingsDto;
  onLoginPress?: () => void;
  onLogoutPress?: () => void;
  onRefresh?: () => Promise<void> | void;
}

export const MyPageScreen: React.FC<Props> = ({
  user = null,
  settings = DEFAULT_SETTINGS,
  onLoginPress,
  onLogoutPress,
  onRefresh: externalRefresh,
}) => {
  const { accessToken } = useMobileAuth();
  const [pushEnabled, setPushEnabled] = useState(settings.pushEnabled);
  const [kakaoEnabled, setKakaoEnabled] = useState(settings.kakaoEnabled);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isPassModalVisible, setIsPassModalVisible] = useState(false);

  // 백엔드 알림 설정 로드
  useEffect(() => {
    let isMounted = true;
    fetchNotificationSettings(accessToken)
      .then((res) => {
        if (isMounted && res) {
          setPushEnabled(res.pushEnabled);
          setKakaoEnabled(res.kakaoEnabled);
        }
      })
      .catch(() => {
        // 백엔드 오프라인 시 props 기본값 유지
      });
    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const handleTogglePush = async (val: boolean) => {
    setPushEnabled(val);
    try {
      await updateNotificationSettings({ pushEnabled: val }, accessToken);
    } catch {
      // 롤백 없이 오프라인 대응
    }
  };

  const handleToggleKakao = async (val: boolean) => {
    setKakaoEnabled(val);
    try {
      await updateNotificationSettings({ kakaoEnabled: val }, accessToken);
    } catch {
      // 롤백 없이 오프라인 대응
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (externalRefresh) {
        await externalRefresh();
      }
      const res = await fetchNotificationSettings(accessToken);
      if (res) {
        setPushEnabled(res.pushEnabled);
        setKakaoEnabled(res.kakaoEnabled);
      }
    } catch {
      // 조용히 통과
    } finally {
      setRefreshing(false);
    }
  }, [externalRefresh, accessToken]);

  if (!user) {
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
          <Ionicons name="person-outline" size={36} color="#94a3b8" />
        </View>
        <Text style={styles.emptyTitle}>로그인이 필요합니다</Text>
        <Text style={styles.emptySubtitle}>
          로그인 후 내 보험 캘린더와 정밀 진단 리포트를 안전하게 확인하세요.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressedScale,
          ]}
          onPress={onLoginPress}
        >
          <Text style={styles.primaryButtonText}>로그인 / 회원가입</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const isTestUser = user.email.includes('test') || user.email.includes('demo');

  return (
    <>
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
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.slice(0, 1)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {isTestUser && (
              <View style={styles.testBadge}>
                <Text style={styles.testBadgeText}>테스트 계정</Text>
              </View>
            )}
            {user.isPassVerified && (
              <View style={styles.passBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.passBadgeText}>PASS 인증 완료</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 설정</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color="#475569" />
              <Text style={styles.menuItemLabel}>납입일 푸시 알림</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
              thumbColor={pushEnabled ? '#4f46e5' : '#f8fafc'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#475569" />
              <Text style={styles.menuItemLabel}>카카오 알림톡</Text>
            </View>
            <Switch
              value={kakaoEnabled}
              onValueChange={handleToggleKakao}
              trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
              thumbColor={kakaoEnabled ? '#4f46e5' : '#f8fafc'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정 및 보안</Text>
        <View style={styles.menuCard}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItemButton,
              pressed && styles.pressedMenuItem,
            ]}
            onPress={() => setIsPassModalVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#4f46e5" />
              <Text style={styles.menuItemLabel}>PASS 본인인증 갱신</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [
              styles.menuItemButton,
              pressed && styles.pressedMenuItem,
            ]}
            onPress={onLogoutPress}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuItemLabel, styles.logoutText]}>로그아웃</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Boim Mobile v1.0.0 (Expo SDK 58)</Text>
      </View>
    </ScrollView>
    <PassVerificationModal
      visible={isPassModalVisible}
      onClose={() => setIsPassModalVisible(false)}
      onSuccess={() => {
        handleRefresh();
      }}
    />
    </>
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
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  passBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  testBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  testBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  logoutText: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
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
  pressedMenuItem: {
    backgroundColor: '#f1f5f9',
    opacity: 0.75,
  },
  pressedScale: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
