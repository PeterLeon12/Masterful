import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationsList from '@/components/NotificationsList';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useApiError } from '@/hooks/useApiError';

interface Notification {
  id: string;
  type: 'message' | 'job_update' | 'payment' | 'review' | 'system' | 'reminder';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    jobId?: string;
    professionalId?: string;
    clientId?: string;
    amount?: number;
    [key: string]: any;
  };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { error, clearError } = useApiError();

  // Fetch notifications from API
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading, 
    refresh: refreshNotifications 
  } = useApi(() => apiClient.get('/notifications'));

  useEffect(() => {
    if (notificationsData) {
      setNotifications((notificationsData as any) || []);
    }
  }, [notificationsData]);

  const handleNotificationPress = (notification: Notification) => {
    // Handle navigation based on notification type and data
    switch (notification.type) {
      case 'message':
        if (notification.data?.jobId) {
          // Navigate to chat for specific job
          console.log('Navigate to chat for job:', notification.data.jobId);
        }
        break;
      case 'job_update':
        if (notification.data?.jobId) {
          // Navigate to job details
          console.log('Navigate to job details:', notification.data.jobId);
        }
        break;
      case 'payment':
        // Navigate to payments screen
        console.log('Navigate to payments screen');
        break;
      case 'review':
        if (notification.data?.professionalId) {
          // Navigate to reviews screen
          console.log('Navigate to reviews for professional:', notification.data.professionalId);
        }
        break;
      default:
        console.log('Handle notification:', notification);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would call the API to mark notification as read
      console.log('Marking notification as read:', notificationId);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut marca notificarea ca citită.');
    }
  };

  const handleDismiss = async (notificationId: string) => {
    Alert.alert(
      'Șterge notificare',
      'Ești sigur că vrei să ștergi această notificare?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, this would call the API to delete notification
              console.log('Deleting notification:', notificationId);
              
              // Mock API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Update local state
              setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut șterge notificarea.');
            }
          }
        }
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, this would call the API to mark all notifications as read
      console.log('Marking all notifications as read');
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      Alert.alert('Succes', 'Toate notificările au fost marcate ca citite.');
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-au putut marca toate notificările ca citite.');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Șterge toate notificările',
      'Ești sigur că vrei să ștergi toate notificările? Această acțiune nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge toate',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, this would call the API to delete all notifications
              console.log('Clearing all notifications');
              
              // Mock API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Update local state
              setNotifications([]);
              
              Alert.alert('Succes', 'Toate notificările au fost șterse.');
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-au putut șterge toate notificările.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <NotificationsList
        notifications={notifications}
        isLoading={notificationsLoading}
        onRefresh={() => {
          clearError();
          refreshNotifications();
        }}
        onNotificationPress={handleNotificationPress}
        onMarkAsRead={handleMarkAsRead}
        onDismiss={handleDismiss}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />
    </SafeAreaView>
  );
}
