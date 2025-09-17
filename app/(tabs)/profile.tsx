import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { 
  User, 
  Settings, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Briefcase,
  FileText
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout, switchRole } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Deconectare',
      'Ești sigur că vrei să te deconectezi?',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Deconectează-te', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleSwitchRole = () => {
    const newRole = user?.role === 'CLIENT' ? 'PROFESSIONAL' : 'CLIENT';
    const roleText = newRole === 'PROFESSIONAL' ? 'meșter' : 'client';
    
    Alert.alert(
      'Schimbă tipul de cont',
      `Vrei să îți schimbi contul în cont de ${roleText}?`,
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Schimbă', onPress: () => switchRole(newRole) }
      ]
    );
  };

  const profileStats = [
    { label: 'Proiecte finalizate', value: '12', icon: '✅' },
    { label: 'Rating mediu', value: '4.8', icon: '⭐' },
    { label: 'Ani experiență', value: '5', icon: '🏆' },
  ];

  const menuSections = [
    {
      title: 'Cont',
      items: [
        { 
          icon: User, 
          label: 'Editează profilul', 
          onPress: () => router.push('/professional/onboarding'),
          showChevron: true 
        },
        { 
          icon: Briefcase, 
          label: `Schimbă în cont ${user?.role === 'CLIENT' ? 'meșter' : 'client'}`, 
          onPress: handleSwitchRole,
          showChevron: true 
        },
        { 
          icon: CreditCard, 
          label: 'Abonament', 
          onPress: () => router.push('/subscription'),
          showChevron: true 
        },
      ]
    },
    {
      title: 'Setări',
      items: [
        { 
          icon: Bell, 
          label: 'Notificări', 
          onPress: () => {},
          showChevron: true 
        },
        { 
          icon: Shield, 
          label: 'Confidențialitate', 
          onPress: () => {},
          showChevron: true 
        },
        { 
          icon: Settings, 
          label: 'Setări generale', 
          onPress: () => {},
          showChevron: true 
        },
      ]
    },
    {
      title: 'Suport',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Ajutor și suport', 
          onPress: () => {},
          showChevron: true 
        },
        { 
          icon: FileText, 
          label: 'Documente legale', 
          onPress: () => router.push('/legal'),
          showChevron: true 
        },
        { 
          icon: LogOut, 
          label: 'Deconectează-te', 
          onPress: handleLogout,
          showChevron: false,
          isDestructive: true 
        },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.role}>
                {user?.role === 'CLIENT' ? '🏠 Client' : '🔧 Meșter'}
              </Text>
              
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{user?.email}</Text>
                </View>
                
                {user?.phone && (
                  <View style={styles.contactItem}>
                    <Phone size={14} color="#6b7280" />
                    <Text style={styles.contactText}>{user.phone}</Text>
                  </View>
                )}
                
              </View>
            </View>
          </View>

          {user?.role === 'PROFESSIONAL' && (
            <View style={styles.statsContainer}>
              {profileStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.menuItemLast
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[
                        styles.menuItemIcon,
                        item.isDestructive && styles.menuItemIconDestructive
                      ]}>
                        <item.icon 
                          size={20} 
                          color={item.isDestructive ? '#ef4444' : '#6b7280'} 
                        />
                      </View>
                      <Text style={[
                        styles.menuItemText,
                        item.isDestructive && styles.menuItemTextDestructive
                      ]}>
                        {item.label}
                      </Text>
                    </View>
                    
                    {item.showChevron && (
                      <ChevronRight size={20} color="#d1d5db" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 12,
  },
  contactInfo: {
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  menuItems: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemIconDestructive: {
    backgroundColor: '#fef2f2',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuItemTextDestructive: {
    color: '#ef4444',
  },
});