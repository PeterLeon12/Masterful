import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';

export default function IndexScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Index screen - Auth state:', { 
      isLoading, 
      isAuthenticated, 
      hasUser: !!user,
      userEmail: user?.email 
    });
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('Redirecting to main app for user:', user.email);
        // User is authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        console.log('Redirecting to login - user not authenticated');
        // User is not authenticated, redirect to auth
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  // Show loading screen while checking authentication
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
