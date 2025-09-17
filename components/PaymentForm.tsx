import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { CreditCard, Lock, CheckCircle } from 'lucide-react-native';
import { apiClient } from '@/services/api';

interface PaymentFormProps {
  jobId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  jobId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);

      // Create payment intent on backend
      const response = await apiClient.createPaymentIntent(jobId, amount, currency);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = response.data;

      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Masterful',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: 'Client',
        },
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsPaymentSheetReady(true);
    } catch (error: any) {
      console.error('Payment sheet initialization error:', error);
      onPaymentError(error.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled payment
          return;
        }
        throw new Error(error.message);
      }

      // Payment succeeded
      Alert.alert(
        'Plată reușită!',
        'Plata a fost procesată cu succes. Job-ul va fi marcat ca fiind în progres.',
        [
          {
            text: 'OK',
            onPress: onPaymentSuccess,
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CreditCard size={24} color="#3b82f6" />
        <Text style={styles.title}>Plată securizată</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Suma de plată:</Text>
        <Text style={styles.amount}>{formatAmount(amount, currency)}</Text>
      </View>

      <View style={styles.securityInfo}>
        <Lock size={16} color="#10b981" />
        <Text style={styles.securityText}>
          Plățile sunt procesate securizat prin Stripe
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Beneficii:</Text>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Plată securizată și protejată</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Banii sunt ținuți în siguranță până la finalizarea job-ului</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.benefitText}>Posibilitate de rambursare în caz de probleme</Text>
        </View>
      </View>

      {!isPaymentSheetReady ? (
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={initializePaymentSheet}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Pregătește plata</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.payButton, isLoading && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Plătește {formatAmount(amount, currency)}</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.disclaimer}>
        Prin continuare, confirmi că ai citit și ești de acord cu termenii și condițiile de plată.
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
  amountContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#10b981',
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
    alignItems: 'center',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#10b981',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PaymentForm;
