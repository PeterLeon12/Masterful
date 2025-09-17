import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, MessageCircle, Star, CreditCard, User, AlertCircle, CheckCircle, X } from 'lucide-react-native';

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

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDismiss,
}) => {
  const getNotificationIcon = () => {
    const iconProps = { size: 20, color: '#6b7280' };
    
    switch (notification.type) {
      case 'message':
        return <MessageCircle {...iconProps} color="#3b82f6" />;
      case 'job_update':
        return <CheckCircle {...iconProps} color="#10b981" />;
      case 'payment':
        return <CreditCard {...iconProps} color="#f59e0b" />;
      case 'review':
        return <Star {...iconProps} color="#fbbf24" />;
      case 'system':
        return <AlertCircle {...iconProps} color="#ef4444" />;
      case 'reminder':
        return <Bell {...iconProps} color="#8b5cf6" />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'message':
        return '#eff6ff';
      case 'job_update':
        return '#f0fdf4';
      case 'payment':
        return '#fffbeb';
      case 'review':
        return '#fefce8';
      case 'system':
        return '#fef2f2';
      case 'reminder':
        return '#faf5ff';
      default:
        return '#f8fafc';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Acum';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}z`;
    
    return date.toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onPress?.(notification);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getNotificationColor() },
        !notification.read && styles.unreadContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getNotificationIcon()}
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={[
              styles.title,
              !notification.read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.time}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          
          <Text style={[
            styles.message,
            !notification.read && styles.unreadMessage
          ]}>
            {notification.message}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {!notification.read && (
            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => onMarkAsRead?.(notification.id)}
            >
              <CheckCircle size={16} color="#10b981" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => onDismiss?.(notification.id)}
          >
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  unreadContainer: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  markReadButton: {
    padding: 4,
  },
  dismissButton: {
    padding: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
});

export default NotificationCard;
