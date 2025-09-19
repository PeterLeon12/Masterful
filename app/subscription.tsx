import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { Check, Crown, Star, Zap, ArrowLeft } from 'lucide-react-native';
import { stripeService, SUBSCRIPTION_PLANS } from '@/services/stripeService';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    const result = await stripeService.getSubscriptionStatus(user.id);
    if (result.success) {
      setSubscriptionStatus(result.subscription);
    }
  };

  const plans = {
    monthly: {
      price: '29.99',
      period: 'lună',
      savings: null
    },
    yearly: {
      price: '299.99',
      period: 'an',
      savings: '2 luni gratuite'
    }
  };

  const features = [
    {
      icon: <Zap size={20} color="#10B981" />,
      title: 'Acces nelimitat la profesioniști',
      description: 'Caută și contactează oricâți profesioniști dorești'
    },
    {
      icon: <Crown size={20} color="#F59E0B" />,
      title: 'Postări de joburi nelimitate',
      description: 'Publică câte joburi vrei, fără restricții'
    },
    {
      icon: <Star size={20} color="#8B5CF6" />,
      title: 'Mesagerie în timp real',
      description: 'Comunică instant cu profesioniștii'
    },
    {
      icon: <Check size={20} color="#10B981" />,
      title: 'Suport prioritar',
      description: 'Asistență dedicată pentru abonați'
    },
    {
      icon: <Zap size={20} color="#10B981" />,
      title: 'Notificări avansate',
      description: 'Primești notificări pentru joburi relevante'
    },
    {
      icon: <Crown size={20} color="#F59E0B" />,
      title: 'Statistici detaliate',
      description: 'Urmărește performanța joburilor tale'
    }
  ];

  const handleSubscribe = async () => {
    if (!user?.id) {
      Alert.alert('Eroare', 'Trebuie să fii autentificat pentru a te abona.');
      return;
    }

    setIsLoading(true);
    try {
      // Create Stripe checkout session
      const result = await stripeService.createCheckoutSession(selectedPlan, user.id);
      
      if (result.success && result.sessionId) {
        // Redirect to Stripe checkout
        const redirectResult = await stripeService.redirectToCheckout(result.sessionId);
        
        if (redirectResult.success) {
          // Success - user will be redirected to Stripe
          return;
        } else {
          Alert.alert('Eroare', redirectResult.error || 'Nu am putut redirecționa către plata Stripe.');
        }
      } else {
        Alert.alert('Eroare', result.error || 'Nu am putut crea sesiunea de plată.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Eroare', 'Nu am putut procesa abonamentul. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await stripeService.createCustomerPortalSession(user.id);
      
      if (result.success && result.url) {
        // Open customer portal in browser
        // In a real app, you'd use Linking.openURL(result.url)
        Alert.alert('Portal Client', 'Portalul de gestionare a abonamentului va fi deschis în browser.');
      } else {
        Alert.alert('Eroare', result.error || 'Nu am putut deschide portalul de gestionare.');
      }
    } catch (error) {
      console.error('Portal error:', error);
      Alert.alert('Eroare', 'Nu am putut deschide portalul de gestionare.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#374151" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Abonament Masterful</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderTrialBanner = () => (
    <View style={styles.trialBanner}>
      <Text style={styles.trialTitle}>🎉 7 ZILE GRATUITE!</Text>
      <Text style={styles.trialSubtitle}>
        Testează toate funcționalitățile premium fără costuri
      </Text>
    </View>
  );

  const renderPlanSelector = () => (
    <View style={styles.planSelector}>
      <TouchableOpacity
        style={[
          styles.planOption,
          selectedPlan === 'monthly' && styles.planOptionSelected
        ]}
        onPress={() => setSelectedPlan('monthly')}
      >
        <Text style={[
          styles.planOptionText,
          selectedPlan === 'monthly' && styles.planOptionTextSelected
        ]}>
          Lunar
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.planOption,
          selectedPlan === 'yearly' && styles.planOptionSelected
        ]}
        onPress={() => setSelectedPlan('yearly')}
      >
        <Text style={[
          styles.planOptionText,
          selectedPlan === 'yearly' && styles.planOptionTextSelected
        ]}>
          Anual
        </Text>
        {plans.yearly.savings && (
          <Text style={styles.savingsText}>{plans.yearly.savings}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPricing = () => (
    <View style={styles.pricingContainer}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>€{plans[selectedPlan].price}</Text>
        <Text style={styles.period}>/{plans[selectedPlan].period}</Text>
      </View>
      <Text style={styles.priceDescription}>
        Facturare {selectedPlan === 'monthly' ? 'lunară' : 'anuală'}
      </Text>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.featuresTitle}>Ce primești cu abonamentul:</Text>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <View style={styles.featureIcon}>
            {feature.icon}
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSubscribeButton = () => {
    if (subscriptionStatus?.status === 'active') {
      return (
        <View style={styles.subscriptionActiveContainer}>
          <View style={styles.activeSubscriptionInfo}>
            <Text style={styles.activeSubscriptionTitle}>Abonament Activ</Text>
            <Text style={styles.activeSubscriptionPlan}>
              Plan: {subscriptionStatus.plan === 'monthly' ? 'Lunar' : 'Anual'}
            </Text>
            {subscriptionStatus.current_period_end && (
              <Text style={styles.activeSubscriptionEnd}>
                Expiră: {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={handleManageSubscription}
            disabled={isLoading}
          >
            <Text style={styles.manageButtonText}>
              {isLoading ? 'Se încarcă...' : 'Gestionează Abonamentul'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.subscribeButton} 
        onPress={handleSubscribe}
        disabled={isLoading}
      >
        <Text style={styles.subscribeButtonText}>
          {isLoading ? 'Se procesează...' : 'Începe perioada de probă gratuită'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTerms = () => (
    <View style={styles.termsContainer}>
      <Text style={styles.termsText}>
        Prin continuare, accepti{' '}
        <Text style={styles.termsLink}>Termenii și Condițiile</Text>
        {' '}și{' '}
        <Text style={styles.termsLink}>Politica de Confidențialitate</Text>
        . Perioada de probă de 7 zile este gratuită. După aceea, vei fi facturat automat.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTrialBanner()}
        {renderPlanSelector()}
        {renderPricing()}
        {renderFeatures()}
        {renderSubscribeButton()}
        {renderTerms()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  trialBanner: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  trialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  trialSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  planSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  planOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  planOptionSelected: {
    backgroundColor: '#3b82f6',
  },
  planOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  planOptionTextSelected: {
    color: '#ffffff',
  },
  savingsText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  pricingContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  period: {
    fontSize: 18,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  termsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    textAlign: 'center',
  },
      termsLink: {
        color: '#3b82f6',
        textDecorationLine: 'underline',
      },
      subscriptionActiveContainer: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#10b981',
      },
      activeSubscriptionInfo: {
        marginBottom: 16,
      },
      activeSubscriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#10b981',
        marginBottom: 8,
      },
      activeSubscriptionPlan: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 4,
      },
      activeSubscriptionEnd: {
        fontSize: 14,
        color: '#6b7280',
      },
      manageButton: {
        backgroundColor: '#10b981',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
      },
      manageButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
      },
    });