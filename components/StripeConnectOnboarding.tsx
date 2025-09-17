import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react-native';
import { apiClient } from '@/services/api';

interface StripeConnectOnboardingProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

export const StripeConnectOnboarding: React.FC<StripeConnectOnboardingProps> = ({
  onComplete,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await apiClient.getStripeAccountStatus();
      
      if (response.success && response.data) {
        setAccountStatus(response.data.status);
        
        // If account is fully set up, call onComplete
        if (response.data.status.charges_enabled && response.data.status.payouts_enabled) {
          onComplete();
        }
      } else {
        // No account exists yet
        setAccountStatus(null);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      setAccountStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const createAccount = async () => {
    try {
      setIsLoading(true);
      
      // Get user email from auth context or API
      const response = await apiClient.createStripeConnectAccount('user@example.com', 'RO');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create Stripe account');
      }

      // Create account link for onboarding
      const linkResponse = await apiClient.createStripeAccountLink(
        'https://masterful.app/onboarding/refresh',
        'https://masterful.app/onboarding/return'
      );

      if (!linkResponse.success || !linkResponse.data) {
        throw new Error('Failed to create account link');
      }

      // Open the onboarding URL
      const { url } = linkResponse.data.accountLink;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Eroare', 'Nu se poate deschide link-ul de onboarding');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      onError(error.message || 'Failed to create Stripe account');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!accountStatus) {
      return {
        title: 'Cont Stripe Connect necesar',
        message: 'Pentru a primi plăți, trebuie să îți configurezi un cont Stripe Connect.',
        color: '#f59e0b',
        icon: AlertCircle,
      };
    }

    if (accountStatus.charges_enabled && accountStatus.payouts_enabled) {
      return {
        title: 'Cont complet configurat',
        message: 'Contul tău Stripe Connect este complet configurat și poate primi plăți.',
        color: '#10b981',
        icon: CheckCircle,
      };
    }

    if (accountStatus.details_submitted) {
      return {
        title: 'Cont în procesare',
        message: 'Contul tău este în procesare. Vei primi o notificare când va fi aprobat.',
        color: '#3b82f6',
        icon: AlertCircle,
      };
    }

    return {
      title: 'Configurare incompletă',
      message: 'Contul tău necesită configurare suplimentară pentru a primi plăți.',
      color: '#f59e0b',
      icon: AlertCircle,
    };
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  if (isCheckingStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Se verifică statusul contului...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CreditCard size={24} color="#3b82f6" />
        <Text style={styles.title}>Stripe Connect</Text>
      </View>

      <View style={[styles.statusContainer, { borderColor: statusInfo.color }]}>
        <StatusIcon size={20} color={statusInfo.color} />
        <View style={styles.statusInfo}>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusMessage}>{statusInfo.message}</Text>
        </View>
      </View>

      {accountStatus && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Detalii cont:</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plăți acceptate:</Text>
            <Text style={[
              styles.detailValue,
              { color: accountStatus.charges_enabled ? '#10b981' : '#ef4444' }
            ]}>
              {accountStatus.charges_enabled ? 'Da' : 'Nu'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plăți trimise:</Text>
            <Text style={[
              styles.detailValue,
              { color: accountStatus.payouts_enabled ? '#10b981' : '#ef4444' }
            ]}>
              {accountStatus.payouts_enabled ? 'Da' : 'Nu'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Detalii completate:</Text>
            <Text style={[
              styles.detailValue,
              { color: accountStatus.details_submitted ? '#10b981' : '#ef4444' }
            ]}>
              {accountStatus.details_submitted ? 'Da' : 'Nu'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Beneficii Stripe Connect:</Text>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Primești plăți direct în contul tău bancar</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Plăți securizate și protejate</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Comisioane competitive</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Suport 24/7</Text>
        </View>
      </View>

      {(!accountStatus || !accountStatus.charges_enabled || !accountStatus.payouts_enabled) && (
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={createAccount}
          disabled={isLoading}
        >
          <ExternalLink size={16} color="#ffffff" />
          <Text style={styles.buttonText}>
            {accountStatus ? 'Completează configurarea' : 'Creează cont Stripe Connect'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={checkAccountStatus}
        disabled={isLoading}
      >
        <Text style={styles.refreshButtonText}>Verifică din nou statusul</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Stripe Connect este un serviciu de plăți securizat. Prin configurarea contului, 
        ești de acord cu termenii și condițiile Stripe.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default StripeConnectOnboarding;
