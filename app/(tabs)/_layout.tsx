import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react-native";
import { useAuth } from "@/contexts/OptimalAuthContext";

export default function TabLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isClient = user?.role === 'CLIENT';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Acasă",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      {isClient && (
        <Tabs.Screen
          name="search"
          options={{
            title: "Căutare",
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
      )}

      <Tabs.Screen
        name="post-job"
        options={{
          title: isClient ? "Postează" : "Lucrări",
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Mesaje",
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}