import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react-native';

interface PrivacyPolicyProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onAccept,
  onDecline,
  showActions = false,
}) => {
  const renderSection = (icon: React.ReactNode, title: string, content: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          {icon}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color="#3b82f6" />
          <Text style={styles.title}>Politica de Confidențialitate</Text>
          <Text style={styles.subtitle}>
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
          </Text>
        </View>

        <Text style={styles.intro}>
          La Masterful, ne angajăm să protejăm confidențialitatea și securitatea datelor tale personale. 
          Această politică explică cum colectăm, folosim și protejăm informațiile tale.
        </Text>

        {renderSection(
          <Database size={24} color="#10b981" />,
          "Datele pe care le colectăm",
          "Colectăm informații necesare pentru a-ți oferi serviciile noastre: numele, adresa de email, numărul de telefon, locația, informații despre serviciile oferite (pentru meșteri), istoricul job-urilor și plăților. Nu colectăm date sensibile fără consimțământul tău explicit."
        )}

        {renderSection(
          <Eye size={24} color="#f59e0b" />,
          "Cum folosim datele tale",
          "Folosim datele tale pentru a-ți oferi serviciile platformei, a conecta clienții cu meșteri, a procesa plățile, a îmbunătăți experiența utilizatorului și a comunica cu tine despre serviciile noastre. Nu vindem datele tale către terți."
        )}

        {renderSection(
          <Lock size={24} color="#ef4444" />,
          "Securitatea datelor",
          "Implementăm măsuri de securitate tehnice și organizaționale pentru a proteja datele tale împotriva accesului neautorizat, modificării, divulgării sau distrugerii. Folosim criptare SSL/TLS pentru toate transmisiile de date."
        )}

        {renderSection(
          <UserCheck size={24} color="#8b5cf6" />,
          "Drepturile tale",
          "Ai dreptul să accesezi, să corectezi, să ștergi sau să restricționezi procesarea datelor tale. Poți retrage consimțământul oricând și poți solicita o copie a datelor tale. Pentru a exercita aceste drepturi, contactează-ne la privacy@masterful.ro."
        )}

        {renderSection(
          <AlertTriangle size={24} color="#f59e0b" />,
          "Cookie-uri și tehnologii similare",
          "Folosim cookie-uri și tehnologii similare pentru a îmbunătăți funcționalitatea aplicației, a analiza utilizarea și a personaliza conținutul. Poți controla preferințele cookie-urilor în setările browserului sau aplicației."
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact</Text>
          <Text style={styles.contactText}>
            Pentru întrebări despre această politică de confidențialitate, contactează-ne:
          </Text>
          <Text style={styles.contactInfo}>
            Email: privacy@masterful.ro{'\n'}
            Telefon: +40 21 XXX XXXX{'\n'}
            Adresă: București, România
          </Text>
        </View>
      </ScrollView>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
          >
            <Text style={styles.declineButtonText}>Nu accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  sectionContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default PrivacyPolicy;
