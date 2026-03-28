import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/OptimalAuthContext";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import OfflineIndicator from '@/components/OfflineIndicator';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Înapoi" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="professional/onboarding" 
        options={{ 
          title: "Configurare profil",
          presentation: "modal"
        }} 
      />
                  <Stack.Screen 
              name="subscription" 
              options={{ 
                title: "Abonament",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="payments" 
              options={{ 
                title: "Plăți",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="reviews/[professionalId]" 
              options={{ 
                title: "Recenzii",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="notifications" 
              options={{ 
                title: "Notificări",
                presentation: "modal"
              }} 
            />
            <Stack.Screen 
              name="legal" 
              options={{ 
                title: "Documente legale",
                presentation: "modal"
              }} 
            />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
            <OfflineIndicator />
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}