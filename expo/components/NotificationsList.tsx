import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Bell, Filter, CheckCircle, Trash2 } from 'lucide-react-native';
import NotificationCard from './NotificationCard';

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

interface NotificationsListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onNotificationPress?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

type FilterType = 'all' | 'unread' | 'message' | 'job_update' | 'payment' | 'review' | 'system' | 'reminder';

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  isLoading = false,
  onRefresh,
  onNotificationPress,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { key: 'all' as FilterType, label: 'Toate', count: notifications.length },
    { key: 'unread' as FilterType, label: 'Necitite', count: notifications.filter(n => !n.read).length },
    { key: 'message' as FilterType, label: 'Mesaje', count: notifications.filter(n => n.type === 'message').length },
    { key: 'job_update' as FilterType, label: 'Actualizări job', count: notifications.filter(n => n.type === 'job_update').length },
    { key: 'payment' as FilterType, label: 'Plăți', count: notifications.filter(n => n.type === 'payment').length },
    { key: 'review' as FilterType, label: 'Recenzii', count: notifications.filter(n => n.type === 'review').length },
    { key: 'system' as FilterType, label: 'Sistem', count: notifications.filter(n => n.type === 'system').length },
    { key: 'reminder' as FilterType, label: 'Reminder-uri', count: notifications.filter(n => n.type === 'reminder').length },
  ];

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const renderFilterOption = ({ item }: { item: typeof filterOptions[0] }) => {
    const isSelected = filter === item.key;
    
    return (
      <TouchableOpacity
        style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
        onPress={() => {
          setFilter(item.key);
          setShowFilters(false);
        }}
      >
        <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>
          {item.label}
        </Text>
        {item.count > 0 && (
          <View style={[styles.filterCount, isSelected && styles.filterCountSelected]}>
            <Text style={[styles.filterCountText, isSelected && styles.filterCountTextSelected]}>
              {item.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      onPress={onNotificationPress}
      onMarkAsRead={onMarkAsRead}
      onDismiss={onDismiss}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Bell size={24} color="#3b82f6" />
          <Text style={styles.headerTitle}>Notificări</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <FlatList
            data={filterOptions}
            renderItem={renderFilterOption}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}

      {unreadCount > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onMarkAllAsRead}
          >
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.actionButtonText}>Marchează toate ca citite</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onClearAll}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text style={styles.actionButtonText}>Șterge toate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>
              {filter === 'all' ? 'Nu ai notificări' : `Nu ai notificări de tipul "${filterOptions.find(f => f.key === filter)?.label}"`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Vei primi notificări pentru mesaje, actualizări de job-uri și alte activități importante.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filtersList: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  filterOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
  },
  filterCount: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountSelected: {
    backgroundColor: '#ffffff',
  },
  filterCountText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterCountTextSelected: {
    color: '#3b82f6',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  notificationsList: {
    paddingVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsList;
