import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useMobileAuth, authActions } from '../store/authStore';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useMobileAuth();

  useEffect(() => {
    authActions.loadStoredSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return isAuthenticated ? <TabNavigator /> : <LoginScreen />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
