import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Clock, DollarSign, User, Calendar } from 'lucide-react-native';
import { Job } from '@/services/supabaseApi';
import { router } from 'expo-router';

interface JobCardProps {
  job: Job;
  onPress?: (job: Job) => void;
  showActions?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onPress, 
  showActions = true 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(job);
    } else {
      router.push(`/job/${job.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      case 'EXPIRED': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activ';
      case 'IN_PROGRESS': return 'În progres';
      case 'COMPLETED': return 'Completat';
      case 'CANCELLED': return 'Anulat';
      case 'EXPIRED': return 'Expirat';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'NORMAL': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'Ridicată';
      case 'NORMAL': return 'Normală';
      case 'LOW': return 'Scăzută';
      default: return priority;
    }
  };

  const location = job.location ? JSON.parse(job.location) : null;
  const budget = job.budget ? JSON.parse(job.budget) : null;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {getStatusText(job.status)}
            </Text>
          </View>
        </View>
        
        {job.priority && (
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
            <Text style={styles.priorityText}>
              {getPriorityText(job.priority)}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {job.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {location ? `${location.city}, ${location.county}` : 'Locație nespecificată'}
          </Text>
        </View>

        {budget && (
          <View style={styles.detailItem}>
            <DollarSign size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {budget.min && budget.max 
                ? `${budget.min} - ${budget.max} ${budget.currency || 'RON'}`
                : `${budget.min || budget.max} ${budget.currency || 'RON'}`
              }
            </Text>
          </View>
        )}

        <View style={styles.detailItem}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {new Date(job.createdAt).toLocaleDateString('ro-RO')}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.clientInfo}>
          <User size={16} color="#6b7280" />
          <Text style={styles.clientText}>
            {job.client?.name || 'Client necunoscut'}
          </Text>
        </View>

        {job.scheduledAt && (
          <View style={styles.scheduledInfo}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.scheduledText}>
              {new Date(job.scheduledAt).toLocaleDateString('ro-RO')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
});

export default JobCard;
