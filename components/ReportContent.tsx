import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Flag, AlertTriangle, MessageSquare, User, CreditCard, Shield } from 'lucide-react-native';

interface ReportContentProps {
  contentType: 'user' | 'job' | 'message' | 'review' | 'payment';
  contentId: string;
  onSubmit: (report: {
    reason: string;
    description: string;
    evidence?: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReportContent: React.FC<ReportContentProps> = ({
  contentType,
  contentId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');

  const reportReasons = [
    {
      id: 'spam',
      label: 'Spam sau conținut irelevant',
      icon: <AlertTriangle size={20} color="#f59e0b" />,
      description: 'Conținut care nu este relevant sau este spam'
    },
    {
      id: 'inappropriate',
      label: 'Conținut nepotrivit',
      icon: <Flag size={20} color="#ef4444" />,
      description: 'Conținut ofensator, vulgar sau nepotrivit'
    },
    {
      id: 'fraud',
      label: 'Înșelăciune sau fraudă',
      icon: <Shield size={20} color="#dc2626" />,
      description: 'Încercare de înșelăciune sau activitate frauduloasă'
    },
    {
      id: 'harassment',
      label: 'Hărțuire sau bullying',
      icon: <User size={20} color="#b91c1c" />,
      description: 'Comportament agresiv, hărțuire sau intimidare'
    },
    {
      id: 'fake_profile',
      label: 'Profil fals sau înșelător',
      icon: <User size={20} color="#dc2626" />,
      description: 'Profil cu informații false sau înșelătoare'
    },
    {
      id: 'payment_issue',
      label: 'Problemă cu plata',
      icon: <CreditCard size={20} color="#dc2626" />,
      description: 'Problemă legată de procesarea plăților'
    },
    {
      id: 'other',
      label: 'Alt motiv',
      icon: <MessageSquare size={20} color="#6b7280" />,
      description: 'Alt tip de problemă sau încălcare'
    }
  ];

  const getContentTypeLabel = () => {
    const labels = {
      user: 'utilizator',
      job: 'job',
      message: 'mesaj',
      review: 'recenzie',
      payment: 'tranzacție'
    };
    return labels[contentType] || 'conținut';
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Eroare', 'Te rog selectează un motiv pentru raportare');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Eroare', 'Te rog descrie problema în cel puțin 10 caractere');
      return;
    }

    onSubmit({
      reason: selectedReason,
      description: description.trim(),
      evidence: evidence.trim() || undefined
    });
  };

  const renderReasonOption = (reason: typeof reportReasons[0]) => {
    const isSelected = selectedReason === reason.id;
    
    return (
      <TouchableOpacity
        key={reason.id}
        style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
        onPress={() => setSelectedReason(reason.id)}
      >
        <View style={styles.reasonHeader}>
          <View style={styles.reasonIcon}>
            {reason.icon}
          </View>
          <View style={styles.reasonInfo}>
            <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
              {reason.label}
            </Text>
            <Text style={[styles.reasonDescription, isSelected && styles.reasonDescriptionSelected]}>
              {reason.description}
            </Text>
          </View>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Flag size={24} color="#ef4444" />
        <Text style={styles.title}>Raportează {getContentTypeLabel()}</Text>
        <Text style={styles.subtitle}>
          Ajută-ne să menținem platforma sigură și curată
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivul raportării</Text>
          <Text style={styles.sectionSubtitle}>
            Selectează motivul pentru care raportezi acest {getContentTypeLabel()}:
          </Text>
          
          <View style={styles.reasonsList}>
            {reportReasons.map(renderReasonOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrierea problemei</Text>
          <Text style={styles.sectionSubtitle}>
            Descrie în detaliu ce problemă ai identificat (minim 10 caractere):
          </Text>
          <View style={styles.textInputContainer}>
            <Text style={styles.textInput}>
              {description}
            </Text>
            <Text style={styles.characterCount}>
              {description.length}/500 caractere
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dovezi (opțional)</Text>
          <Text style={styles.sectionSubtitle}>
            Dacă ai dovezi (screenshot-uri, link-uri, etc.), descrie-le aici:
          </Text>
          <View style={styles.textInputContainer}>
            <Text style={styles.textInput}>
              {evidence}
            </Text>
            <Text style={styles.characterCount}>
              {evidence.length}/300 caractere
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <AlertTriangle size={20} color="#f59e0b" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Informații importante</Text>
            <Text style={styles.infoText}>
              • Raporturile sunt anonime și confidențiale{'\n'}
              • Vom examina raportul în termen de 24-48 de ore{'\n'}
              • Vei primi o notificare despre rezultatul investigației{'\n'}
              • Raporturile false pot duce la suspendarea contului
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Anulează</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedReason || description.trim().length < 10 || isLoading) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason || description.trim().length < 10 || isLoading}
        >
          <Flag size={16} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Se trimite...' : 'Trimite raportul'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonsList: {
    gap: 8,
  },
  reasonOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  reasonOptionSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonInfo: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: '#dc2626',
    fontWeight: '600',
  },
  reasonDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  reasonDescriptionSelected: {
    color: '#b91c1c',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    minHeight: 60,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#a16207',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ReportContent;
