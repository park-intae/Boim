import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CalendarScreen } from '../screens/CalendarScreen';
import { InsuranceListScreen } from '../screens/InsuranceListScreen';
import { DiagnosisScreen } from '../screens/DiagnosisScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { useMobileAuth } from '../store/authStore';
import type { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomMargin = insets.bottom > 0 ? insets.bottom + 8 : 16;
  const { user, logout } = useMobileAuth();

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
        component={CalendarScreen}
        options={{ title: '일정 캘린더' }}
      />
      <Tab.Screen
        name="InsuranceList"
        component={InsuranceListScreen}
        options={{ title: '내 보험' }}
      />
      <Tab.Screen
        name="Diagnosis"
        component={DiagnosisScreen}
        options={{ title: 'AI 보장 진단' }}
      />
      <Tab.Screen
        name="MyPage"
        options={{ title: '마이' }}
      >
        {(props) => <MyPageScreen {...props} user={user} onLogoutPress={logout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
