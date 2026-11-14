import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CalendarScreen } from '../screens/CalendarScreen';
import { InsuranceListScreen } from '../screens/InsuranceListScreen';
import { DiagnosisScreen } from '../screens/DiagnosisScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { useMobileAuth } from '../store/authStore';
import { INITIAL_INSURANCES, INITIAL_DIAGNOSIS } from '../data/mockData';
import type { RootTabParamList } from '../types/navigation';
import type { InsuranceProductDto, InsuranceDiagnosisDto } from '@boim/shared-types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomMargin = insets.bottom > 0 ? insets.bottom + 8 : 16;
  const { user, logout } = useMobileAuth();

  const [insurances, setInsurances] = useState<InsuranceProductDto[]>(INITIAL_INSURANCES);
  const [diagnosis, setDiagnosis] = useState<InsuranceDiagnosisDto | null>(INITIAL_DIAGNOSIS);

  const handleAddInsurance = useCallback((newProduct: InsuranceProductDto) => {
    setInsurances((prev) => [newProduct, ...prev]);
  }, []);

  const handleRefreshData = useCallback(async () => {
    // 당겨서 새로고침 시 데이터 재동기화 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 600));
    setInsurances([...INITIAL_INSURANCES]);
    setDiagnosis({ ...INITIAL_DIAGNOSIS });
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Calendar"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '800',
          color: '#0f172a',
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomMargin,
          left: 16,
          right: 16,
          backgroundColor: '#ffffff',
          borderRadius: 26,
          height: 72,
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderTopWidth: 0,
          shadowColor: '#0f172a',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 16,
          elevation: 10,
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          height: 60,
          borderRadius: 18,
          marginHorizontal: 2,
          overflow: 'hidden',
          paddingVertical: 6,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'InsuranceList':
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
              break;
            case 'Diagnosis':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'MyPage':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Calendar"
        options={{ title: '일정 캘린더' }}
      >
        {(props) => (
          <CalendarScreen
            {...props}
            insurances={insurances}
            onRefresh={handleRefreshData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="InsuranceList"
        options={{ title: '내 보험' }}
      >
        {(props) => (
          <InsuranceListScreen
            {...props}
            insurances={insurances}
            onAddInsurance={handleAddInsurance}
            onRefresh={handleRefreshData}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Diagnosis"
        options={{ title: 'AI 보장 진단' }}
      >
        {(props) => (
          <DiagnosisScreen
            {...props}
            diagnosis={diagnosis}
            onRefresh={handleRefreshData}
            onDiagnosePress={() => setDiagnosis({ ...INITIAL_DIAGNOSIS })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="MyPage"
        options={{ title: '마이' }}
      >
        {(props) => (
          <MyPageScreen
            {...props}
            user={user}
            onLogoutPress={logout}
            onRefresh={handleRefreshData}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
