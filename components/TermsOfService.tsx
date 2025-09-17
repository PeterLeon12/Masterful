import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Scale, Users, CreditCard, Shield, AlertCircle } from 'lucide-react-native';

interface TermsOfServiceProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({
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
          <FileText size={48} color="#3b82f6" />
          <Text style={styles.title}>Termeni și Condiții</Text>
          <Text style={styles.subtitle}>
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
          </Text>
        </View>

        <Text style={styles.intro}>
          Bun venit pe platforma Masterful! Acești termeni și condiții reglementează 
          utilizarea serviciilor noastre și relația dintre tine și Masterful.
        </Text>

        {renderSection(
          <Users size={24} color="#10b981" />,
          "Definiții",
          "• 'Platforma' se referă la aplicația Masterful și serviciile asociate{'\n'}" +
          "• 'Utilizator' este orice persoană care accesează platforma{'\n'}" +
          "• 'Client' este utilizatorul care postează job-uri{'\n'}" +
          "• 'Meșter' este utilizatorul care oferă servicii{'\n'}" +
          "• 'Servicii' sunt toate funcționalitățile oferite de platformă"
        )}

        {renderSection(
          <Scale size={24} color="#f59e0b" />,
          "Acceptarea termenilor",
          "Prin accesarea și utilizarea platformei Masterful, confirmi că ai citit, înțeles și accepti acești termeni și condiții. Dacă nu ești de acord cu oricare dintre termeni, te rugăm să nu utilizezi platforma."
        )}

        {renderSection(
          <Shield size={24} color="#ef4444" />,
          "Obligații ale utilizatorilor",
          "• Să furnizezi informații corecte și actualizate{'\n'}" +
          "• Să respecti legislația română și internațională{'\n'}" +
          "• Să nu postezi conținut ofensator, ilegal sau înșelător{'\n'}" +
          "• Să nu încerci să compromiți securitatea platformei{'\n'}" +
          "• Să plătești la timp pentru serviciile utilizate"
        )}

        {renderSection(
          <CreditCard size={24} color="#8b5cf6" />,
          "Plăți și facturare",
          "• Plățile se procesează prin Stripe, un procesor de plăți securizat{'\n'}" +
          "• Platforma percepe o comision de 5% din valoarea fiecărui job{'\n'}" +
          "• Plățile către meșteri se procesează în 2-3 zile lucrătoare{'\n'}" +
          "• Poți solicita rambursarea în termen de 24 de ore de la finalizarea job-ului{'\n'}" +
          "• Toate prețurile sunt exprimate în RON și includ TVA"
        )}

        {renderSection(
          <AlertCircle size={24} color="#f59e0b" />,
          "Limitarea responsabilității",
          "Masterful nu este responsabil pentru:{'\n'}" +
          "• Calitatea serviciilor oferite de meșteri{'\n'}" +
          "• Daunele rezultate din utilizarea serviciilor{'\n'}" +
          "• Întârzierile sau problemele de comunicare{'\n'}" +
          "• Pierderile financiare sau de date{'\n'}" +
          "• Conținutul postat de utilizatori"
        )}

        {renderSection(
          <FileText size={24} color="#6b7280" />,
          "Proprietatea intelectuală",
          "Toate drepturile de proprietate intelectuală asupra platformei, inclusiv designul, codul sursă, logo-urile și conținutul, aparțin Masterful. Utilizatorii nu pot copia, modifica sau distribui conținutul fără permisiunea scrisă."
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact și dispute</Text>
          <Text style={styles.contactText}>
            Pentru întrebări sau dispute legate de acești termeni:
          </Text>
          <Text style={styles.contactInfo}>
            Email: legal@masterful.ro{'\n'}
            Telefon: +40 21 XXX XXXX{'\n'}
            Adresă: București, România{'\n\n'}
            Disputele se rezolvă prin mediere sau în instanțele competente din România.
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

export default TermsOfService;
