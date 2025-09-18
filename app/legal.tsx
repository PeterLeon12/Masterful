import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, FileText, CheckCircle } from 'lucide-react-native';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';

type DocumentType = 'privacy' | 'terms';

export default function LegalDocumentsScreen() {
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [acceptedDocuments, setAcceptedDocuments] = useState<{
    privacy: boolean;
    terms: boolean;
  }>({
    privacy: false,
    terms: false,
  });

  const handleAcceptDocument = (type: DocumentType) => {
    setAcceptedDocuments(prev => ({
      ...prev,
      [type]: true
    }));
    setSelectedDocument(null);
  };

  const handleDeclineDocument = () => {
    setSelectedDocument(null);
  };

  const renderDocumentCard = (
    type: DocumentType,
    title: string,
    description: string,
    icon: React.ReactNode,
    isAccepted: boolean
  ) => (
    <TouchableOpacity
      style={[styles.documentCard, isAccepted && styles.documentCardAccepted]}
      onPress={() => setSelectedDocument(type)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          {icon}
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentDescription}>{description}</Text>
        </View>
        {isAccepted && (
          <View style={styles.acceptedIndicator}>
            <CheckCircle size={20} color="#10b981" />
          </View>
        )}
      </View>
      
      <View style={styles.documentActions}>
        <TouchableOpacity
          style={styles.readButton}
          onPress={() => setSelectedDocument(type)}
        >
          <Text style={styles.readButtonText}>
            {isAccepted ? 'Citește din nou' : 'Citește și acceptă'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documente legale</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.intro}>
          <Shield size={48} color="#3b82f6" />
          <Text style={styles.introTitle}>Transparență și încredere</Text>
          <Text style={styles.introText}>
            Pentru a utiliza platforma Masterful, trebuie să citești și să accepți 
            documentele legale de mai jos. Acestea protejează atât pe tine, cât și pe noi.
          </Text>
        </View>

        <View style={styles.documentsList}>
          {renderDocumentCard(
            'privacy',
            'Politica de Confidențialitate',
            'Cum colectăm, folosim și protejăm datele tale personale',
            <Shield size={24} color="#10b981" />,
            acceptedDocuments.privacy
          )}

          {renderDocumentCard(
            'terms',
            'Termeni și Condiții',
            'Regulile și condițiile de utilizare a platformei',
            <FileText size={24} color="#f59e0b" />,
            acceptedDocuments.terms
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status acceptare</Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <CheckCircle 
                size={16} 
                color={acceptedDocuments.privacy ? '#10b981' : '#d1d5db'} 
              />
              <Text style={[
                styles.statusText,
                acceptedDocuments.privacy && styles.statusTextAccepted
              ]}>
                Politica de Confidențialitate
              </Text>
            </View>
            <View style={styles.statusItem}>
              <CheckCircle 
                size={16} 
                color={acceptedDocuments.terms ? '#10b981' : '#d1d5db'} 
              />
              <Text style={[
                styles.statusText,
                acceptedDocuments.terms && styles.statusTextAccepted
              ]}>
                Termeni și Condiții
              </Text>
            </View>
          </View>
        </View>

        {acceptedDocuments.privacy && acceptedDocuments.terms && (
          <View style={styles.completionMessage}>
            <CheckCircle size={24} color="#10b981" />
            <Text style={styles.completionText}>
              Felicitări! Ai acceptat toate documentele legale necesare.
            </Text>
          </View>
        )}
      </View>

      {/* Privacy Policy Modal */}
      <Modal
        visible={selectedDocument === 'privacy'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <PrivacyPolicy
          onAccept={() => handleAcceptDocument('privacy')}
          onDecline={handleDeclineDocument}
          showActions={true}
        />
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={selectedDocument === 'terms'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <TermsOfService
          onAccept={() => handleAcceptDocument('terms')}
          onDecline={handleDeclineDocument}
          showActions={true}
        />
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  intro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  documentsList: {
    gap: 16,
    marginBottom: 32,
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentCardAccepted: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  acceptedIndicator: {
    padding: 4,
  },
  documentActions: {
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  readButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusTextAccepted: {
    color: '#10b981',
    fontWeight: '500',
  },
  completionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  completionText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
    flex: 1,
  },
});
