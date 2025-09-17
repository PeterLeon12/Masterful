import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DollarSign, Clock, FileText, Send } from 'lucide-react-native';

interface JobApplicationFormProps {
  jobId: string;
  onSubmit: (applicationData: {
    proposal: string;
    price: number;
    estimatedTime: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [proposal, setProposal] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const handleSubmit = async () => {
    if (!proposal.trim()) {
      Alert.alert('Eroare', 'Te rog completează propunerea ta');
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Eroare', 'Te rog introdu un preț valid');
      return;
    }

    if (!estimatedTime.trim()) {
      Alert.alert('Eroare', 'Te rog specifică timpul estimat');
      return;
    }

    try {
      await onSubmit({
        proposal: proposal.trim(),
        price: parseFloat(price),
        estimatedTime: estimatedTime.trim(),
      });
    } catch (error) {
      console.error('Application submission error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aplică pentru acest job</Text>
      <Text style={styles.description}>
        Completează detaliile propunerii tale pentru a aplica la acest job
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <FileText size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrie propunerea ta, experiența relevantă și de ce ești potrivit pentru acest job..."
            value={proposal}
            onChangeText={setProposal}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <DollarSign size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Preț (RON)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Clock size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Timp estimat"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Sfaturi pentru o propunere bună:</Text>
          <Text style={styles.tipText}>• Menționează experiența relevantă</Text>
          <Text style={styles.tipText}>• Explică abordarea ta pentru job</Text>
          <Text style={styles.tipText}>• Include detalii despre materiale sau echipamente</Text>
          <Text style={styles.tipText}>• Specifică disponibilitatea ta</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Anulează</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Send size={16} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Se trimite...' : 'Trimite aplicația'}
          </Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#0c4a6e',
    marginBottom: 4,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
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
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobApplicationForm;
