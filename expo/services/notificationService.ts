import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabaseApiClient } from './supabaseApi';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  badge?: number;
}

export class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Check if device is physical
      if (!Device.isDevice) {
        return { success: false, error: 'Must use physical device for push notifications' };
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { success: false, error: 'Failed to get push token for push notification' };
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      
      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return { success: true, token: this.expoPushToken };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize notifications',
      };
    }
  }

  async registerForPushNotifications(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const result = await this.initialize();
      
      if (!result.success || !result.token) {
        return result;
      }

      // Save token to user profile
      const response = await supabaseApiClient.updateProfile({
        pushToken: result.token,
      });

      if (!response.success) {
        console.warn('Failed to save push token to profile:', response.error);
      }

      return result;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register for push notifications',
      };
    }
  }

  async sendLocalNotification(notification: NotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger: null, // Show immediately
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending local notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  async sendPushNotification(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data && result.data[0] && result.data[0].status === 'error') {
        return { success: false, error: result.data[0].message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send push notification',
      };
    }
  }

  async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          badge: notification.badge,
        },
        trigger,
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule notification',
      };
    }
  }

  async cancelNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel notification',
      };
    }
  }

  async cancelAllNotifications(): Promise<{ success: boolean; error?: string }> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel all notifications',
      };
    }
  }

  async getBadgeCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return { success: true, count };
    } catch (error) {
      console.error('Error getting badge count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get badge count',
      };
    }
  }

  async setBadgeCount(count: number): Promise<{ success: boolean; error?: string }> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return { success: true };
    } catch (error) {
      console.error('Error setting badge count:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set badge count',
      };
    }
  }

  // Notification types for common app events
  async notifyJobPosted(jobTitle: string): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'Job Posted Successfully',
      body: `Your job "${jobTitle}" has been posted and is now visible to professionals.`,
      data: { type: 'job_posted' },
    });
  }

  async notifyNewMessage(senderName: string, jobTitle: string): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'New Message',
      body: `${senderName} sent you a message about "${jobTitle}".`,
      data: { type: 'new_message' },
    });
  }

  async notifyJobApplication(professionalName: string, jobTitle: string): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'New Job Application',
      body: `${professionalName} applied for your job "${jobTitle}".`,
      data: { type: 'job_application' },
    });
  }

  async notifyJobAccepted(jobTitle: string): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'Job Accepted',
      body: `Your application for "${jobTitle}" has been accepted!`,
      data: { type: 'job_accepted' },
    });
  }

  async notifyJobCompleted(jobTitle: string): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'Job Completed',
      body: `The job "${jobTitle}" has been marked as completed.`,
      data: { type: 'job_completed' },
    });
  }

  async notifyReviewReceived(reviewerName: string, rating: number): Promise<{ success: boolean; error?: string }> {
    return this.sendLocalNotification({
      title: 'New Review',
      body: `${reviewerName} gave you a ${rating}-star review.`,
      data: { type: 'review_received' },
    });
  }

  // Add notification listener
  addNotificationListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove notification listener
  removeNotificationListener(subscription: Notifications.Subscription) {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
