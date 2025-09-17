import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/OptimalAuthContext';
import PaymentHistory from '@/components/PaymentHistory';
import StripeConnectOnboarding from '@/components/StripeConnectOnboarding';
import { CreditCard, History, Settings } from 'lucide-react-native';

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Utilizator neautentificat</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isProfessional = user.role === 'PROFESSIONAL';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <PaymentHistory 
            userId={user.id} 
            userRole={user.role as 'CLIENT' | 'PROFESSIONAL'} 
          />
        );
      case 'settings':
        if (isProfessional) {
          return (
            <StripeConnectOnboarding
              onComplete={() => {
                Alert.alert('Succes!', 'Contul Stripe Connect a fost configurat cu succes!');
              }}
              onError={(error) => {
                Alert.alert('Eroare', error);
              }}
            />
          );
        } else {
          return (
            <View style={styles.clientSettingsContainer}>
              <Text style={styles.clientSettingsTitle}>Setări plăți</Text>
              <Text style={styles.clientSettingsDescription}>
                Ca client, poți plăti pentru job-uri direct din aplicație. 
                Plățile sunt procesate securizat prin Stripe.
              </Text>
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Beneficii:</Text>
                <Text style={styles.benefitText}>• Plăți securizate și protejate</Text>
                <Text style={styles.benefitText}>• Banii sunt ținuți în siguranță până la finalizarea job-ului</Text>
                <Text style={styles.benefitText}>• Posibilitate de rambursare în caz de probleme</Text>
                <Text style={styles.benefitText}>• Suport pentru toate cardurile bancare</Text>
              </View>
            </View>
          );
        }
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plăți</Text>
        <Text style={styles.subtitle}>
          {isProfessional ? 'Gestionează plățile primite' : 'Istoricul plăților efectuate'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <History size={20} color={activeTab === 'history' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            activeTab === 'history' && styles.activeTabText
          ]}>
            Istoric
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Settings size={20} color={activeTab === 'settings' ? '#3b82f6' : '#6b7280'} />
          <Text style={[
            styles.tabText,
            activeTab === 'settings' && styles.activeTabText
          ]}>
            Setări
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
  },
  clientSettingsContainer: {
    flex: 1,
    padding: 24,
  },
  clientSettingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  clientSettingsDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 8,
    lineHeight: 20,
  },
});
