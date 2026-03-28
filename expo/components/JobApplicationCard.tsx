import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Clock, DollarSign, MessageCircle, Check, X } from 'lucide-react-native';
import { JobApplication } from '@/services/api';

interface JobApplicationCardProps {
  application: JobApplication;
  onAccept?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
  onMessage?: (applicationId: string) => void;
  showActions?: boolean;
}

export const JobApplicationCard: React.FC<JobApplicationCardProps> = ({
  application,
  onAccept,
  onReject,
  onMessage,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'WITHDRAWN': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Acceptată';
      case 'REJECTED': return 'Respinsă';
      case 'WITHDRAWN': return 'Retrasă';
      default: return 'În așteptare';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.professionalInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {application.professional?.avatar || '👨‍🔧'}
            </Text>
          </View>
          <View style={styles.professionalDetails}>
            <Text style={styles.professionalName}>
              {application.professional?.name || 'Professional necunoscut'}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                ⭐ N/A
              </Text>
              <Text style={styles.reviewCount}>
                (0 recenzii)
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
            <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(application.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.proposalContainer}>
        <Text style={styles.proposalLabel}>Propunere:</Text>
        <Text style={styles.proposalText}>{application.proposal}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {application.price} {application.currency}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>{application.estimatedTime}</Text>
        </View>
      </View>

      {showActions && application.status === 'PENDING' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => onMessage?.(application.id)}
          >
            <MessageCircle size={16} color="#3b82f6" />
            <Text style={styles.messageButtonText}>Mesaj</Text>
          </TouchableOpacity>
          
          <View style={styles.decisionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => onReject?.(application.id)}
            >
              <X size={16} color="#ef4444" />
              <Text style={styles.rejectButtonText}>Respinge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept?.(application.id)}
            >
              <Check size={16} color="#ffffff" />
              <Text style={styles.acceptButtonText}>Acceptă</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  proposalContainer: {
    marginBottom: 16,
  },
  proposalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  proposalText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  messageButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default JobApplicationCard;
