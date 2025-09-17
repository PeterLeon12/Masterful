import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { apiClient } from '@/services/api';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'TRANSFERRED' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  job: {
    id: string;
    title: string;
    client?: {
      name: string;
    };
    professional?: {
      name: string;
    };
  };
}

interface PaymentHistoryProps {
  userId: string;
  userRole: 'CLIENT' | 'PROFESSIONAL';
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId, userRole }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      }

      const response = await apiClient.getPaymentHistory(pageNum, 20);
      
      if (response.success && response.data) {
        const newPayments = response.data.payments || [];
        
        if (pageNum === 1 || refresh) {
          setPayments(newPayments);
        } else {
          setPayments(prev => [...prev, ...newPayments]);
        }
        
        setHasMore(newPayments.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPayments(1, true);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadPayments(page + 1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'TRANSFERRED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'PENDING':
        return <Clock size={16} color="#f59e0b" />;
      case 'REFUNDED':
        return <ArrowDownLeft size={16} color="#3b82f6" />;
      case 'FAILED':
        return <XCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'În așteptare';
      case 'COMPLETED': return 'Completată';
      case 'TRANSFERRED': return 'Transferată';
      case 'REFUNDED': return 'Rambursată';
      case 'FAILED': return 'Eșuată';
      default: return 'Necunoscut';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'TRANSFERRED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'REFUNDED':
        return '#3b82f6';
      case 'FAILED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPaymentType = (payment: Payment) => {
    if (userRole === 'CLIENT') {
      return 'Plată către';
    } else {
      return 'Plată de la';
    }
  };

  const getPaymentRecipient = (payment: Payment) => {
    if (userRole === 'CLIENT') {
      return payment.job.professional?.name || 'Professional';
    } else {
      return payment.job.client?.name || 'Client';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentIcon}>
            {userRole === 'CLIENT' ? (
              <ArrowUpRight size={20} color="#ef4444" />
            ) : (
              <ArrowDownLeft size={20} color="#10b981" />
            )}
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.jobTitle}>{item.job.title}</Text>
            <Text style={styles.paymentType}>
              {getPaymentType(item)} {getPaymentRecipient(item)}
            </Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            { color: userRole === 'CLIENT' ? '#ef4444' : '#10b981' }
          ]}>
            {userRole === 'CLIENT' ? '-' : '+'}{formatAmount(item.amount, item.currency)}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <CreditCard size={48} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Nicio plată încă</Text>
      <Text style={styles.emptyDescription}>
        {userRole === 'CLIENT' 
          ? 'Plățile tale vor apărea aici când vei plăti pentru job-uri'
          : 'Plățile primite vor apărea aici când vei finaliza job-uri'
        }
      </Text>
    </View>
  );

  if (isLoading && payments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Se încarcă istoricul plăților...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Istoric plăți</Text>
        <Text style={styles.subtitle}>
          {userRole === 'CLIENT' ? 'Plăți efectuate' : 'Plăți primite'}
        </Text>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={payments.length === 0 ? styles.emptyListContainer : undefined}
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paymentType: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default PaymentHistory;
