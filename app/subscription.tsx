import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { Check, Crown, Star, Zap } from 'lucide-react-native';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string;
  color: string;
  features: string[];
  popular?: boolean;
}

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isClient = user?.role === 'CLIENT';

  const clientPlans: SubscriptionPlan[] = [
    {
      id: 'client-basic',
      name: 'Basic',
      price: 0,
      period: 'lună',
      icon: '🏠',
      color: '#6b7280',
      features: [
        '3 sarcini postate pe lună',
        'Căutare de bază',
        'Mesaje cu meșterii',
        'Suport email',
      ],
    },
    {
      id: 'client-premium',
      name: 'Premium',
      price: 29,
      period: 'lună',
      icon: '⭐',
      color: '#3b82f6',
      popular: true,
      features: [
        'Sarcini nelimitate',
        'Căutare avansată cu filtre',
        'Prioritate în rezultate',
        'Mesaje nelimitate',
        'Suport prioritar',
        'Statistici detaliate',
      ],
    },
    {
      id: 'client-business',
      name: 'Business',
      price: 79,
      period: 'lună',
      icon: '👑',
      color: '#f59e0b',
      features: [
        'Tot din Premium',
        'Manager de cont dedicat',
        'Facturare automată',
        'Rapoarte personalizate',
        'API access',
        'Suport telefonic 24/7',
      ],
    },
  ];

  const professionalPlans: SubscriptionPlan[] = [
    {
      id: 'pro-starter',
      name: 'Starter',
      price: 0,
      period: 'lună',
      icon: '🔧',
      color: '#6b7280',
      features: [
        '5 aplicări pe lună',
        'Profil de bază',
        'Mesaje cu clienții',
        'Comision 15% per proiect',
      ],
    },
    {
      id: 'pro-professional',
      name: 'Professional',
      price: 49,
      period: 'lună',
      icon: '⚡',
      color: '#3b82f6',
      popular: true,
      features: [
        'Aplicări nelimitate',
        'Profil premium cu badge',
        'Prioritate în căutări',
        'Comision redus 10%',
        'Statistici avansate',
        'Suport prioritar',
      ],
    },
    {
      id: 'pro-expert',
      name: 'Expert',
      price: 99,
      period: 'lună',
      icon: '👑',
      color: '#f59e0b',
      features: [
        'Tot din Professional',
        'Badge "Expert verificat"',
        'Promovare în top rezultate',
        'Comision minim 5%',
        'Manager de cont dedicat',
        'Cursuri de dezvoltare',
        'Suport telefonic 24/7',
      ],
    },
  ];

  const plans = isClient ? clientPlans : professionalPlans;

  const handleSubscribe = async (planId: string) => {
    if (planId.includes('basic') || planId.includes('starter')) {
      Alert.alert(
        'Plan gratuit',
        'Ești deja pe planul gratuit!',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement real subscription API call
      // For now, we'll show a message that this feature is coming soon
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Funcționalitate în dezvoltare',
        'Integrarea cu Stripe pentru plăți va fi disponibilă în curând. Mulțumim pentru răbdare!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut activa abonamentul. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <View
      key={plan.id}
      style={[
        styles.planCard,
        plan.popular && styles.planCardPopular,
        selectedPlan === plan.id && styles.planCardSelected
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Star size={12} color="#ffffff" fill="#ffffff" />
          <Text style={styles.popularText}>Cel mai popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planIcon}>{plan.icon}</Text>
        <Text style={styles.planName}>{plan.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {plan.price === 0 ? 'Gratuit' : `${plan.price} RON`}
          </Text>
          {plan.price > 0 && (
            <Text style={styles.period}>/{plan.period}</Text>
          )}
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.feature}>
            <Check size={16} color="#10b981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          plan.popular && styles.selectButtonPopular,
          selectedPlan === plan.id && styles.selectButtonSelected
        ]}
        onPress={() => {
          setSelectedPlan(plan.id);
          handleSubscribe(plan.id);
        }}
        disabled={isLoading}
      >
        <Text style={[
          styles.selectButtonText,
          plan.popular && styles.selectButtonTextPopular,
          selectedPlan === plan.id && styles.selectButtonTextSelected
        ]}>
          {plan.price === 0 ? 'Plan actual' : 'Selectează planul'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planuri de abonament</Text>
        <Text style={styles.subtitle}>
          {isClient 
            ? 'Alege planul potrivit pentru proiectele tale'
            : 'Dezvoltă-ți afacerea cu planurile noastre'
          }
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roleIndicator}>
          <Text style={styles.roleText}>
            {isClient ? '🏠 Planuri pentru clienți' : '🔧 Planuri pentru meșteri'}
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>De ce să alegi un plan premium?</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefit}>
              <Zap size={20} color="#3b82f6" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Acces prioritar</Text>
                <Text style={styles.benefitDescription}>
                  {isClient 
                    ? 'Sarcinile tale apar primele în căutările meșterilor'
                    : 'Profilul tău apare primul în rezultatele căutărilor'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Crown size={20} color="#f59e0b" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Badge premium</Text>
                <Text style={styles.benefitDescription}>
                  Distinge-te cu badge-uri speciale care inspiră încredere
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Star size={20} color="#10b981" />
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Suport prioritar</Text>
                <Text style={styles.benefitDescription}>
                  Răspuns rapid la întrebări și suport dedicat
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Poți anula abonamentul oricând din setările contului.{'\n'}
            Toate planurile includ o perioadă de probă de 7 zile.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  roleIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  planCardPopular: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  planCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  planIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  period: {
    fontSize: 16,
    color: '#6b7280',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonPopular: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  selectButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectButtonTextPopular: {
    color: '#ffffff',
  },
  selectButtonTextSelected: {
    color: '#ffffff',
  },
  benefits: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});